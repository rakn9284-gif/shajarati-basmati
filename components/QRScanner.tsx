"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  ScanLine,
  Search,
  TreePine,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { municipalityName } from "@/lib/municipalities";
import { formatDate } from "@/lib/utils";
import { Badge, Modal } from "./ui";
import type { Campaign } from "@/lib/types";
import jsQR from "jsqr";

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
};

/** Accepts plain campaign IDs as well as scanned URLs containing ?campaign=. */
function campaignCodeOf(raw: string) {
  const trimmed = raw.trim();
  try {
    const url = new URL(
      trimmed,
      typeof window !== "undefined" ? window.location.origin : "https://hamalati.dz",
    );
    const fromQuery = url.searchParams.get("campaign");
    if (fromQuery) return fromQuery.trim().toUpperCase();
  } catch {
    // Not a URL — treat the input as a plain campaign code.
  }
  return trimmed.toUpperCase();
}

const statusTone = (status: Campaign["status"]) =>
  status === "active" ? "mint" : status === "completed" ? "forest" : "amber";

/** Scans (or accepts manual entry of) the single QR code of a campaign site. */
export default function QRScanner() {
  const { t, lang, campaigns, findCampaign, closeModal, openModal } = useApp();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [detectedLabel, setDetectedLabel] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const loopRef = useRef<number | null>(null);
  // محرك الكشف الفعّال: "native" = BarcodeDetector، "compat" = jsQR البديل
  const [engine, setEngine] = useState<"native" | "compat" | null>(null);

  const openSite = useCallback(
    (raw: string) => {
      const normalized = campaignCodeOf(raw);
      if (!normalized) {
        setError(t("أدخل رمز الحملة أولاً.", "Enter a campaign code first."));
        return false;
      }
      const campaign =
        findCampaign(normalized) ??
        campaigns.find((c) => c.id.toUpperCase() === normalized);
      if (!campaign) {
        setError(
          t(
            "لم نجد موقعاً بهذا الرمز. تأكد من رمز الحملة ثم أعد المحاولة.",
            "No site found with this code. Check the campaign code and try again.",
          ),
        );
        return false;
      }
      setRecent((prev) =>
        [campaign.id, ...prev.filter((x) => x !== campaign.id)].slice(0, 3),
      );
      setError("");
      openModal({ type: "site", campaignId: campaign.id });
      return true;
    },
    [campaigns, findCampaign, openModal, t],
  );

  const stopCamera = useCallback(() => {
    if (loopRef.current) {
      window.clearInterval(loopRef.current);
      loopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setDetectedLabel("");
    setEngine(null);
  }, []);

  useEffect(() => {
    if (!cameraOn) return;
    let cancelled = false;

    const start = async () => {
      setCameraError("");
      try {
        // إجبار المتصفح على طلب الكاميرا الخلفية لجميع أنواع الهواتف
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { exact: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch {
          // Fallback للهواتف التي لا تدعم الخاصية الدقيقة exact environment
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
        }

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true"); // مهم جداً لأجهزة iOS / Safari
          await videoRef.current.play().catch(() => undefined);
        }

        const Ctor = (
          window as unknown as {
            BarcodeDetector?: new (opts?: { formats?: string[] }) => BarcodeDetectorLike;
          }
        ).BarcodeDetector;

        if (Ctor) {
          setEngine("native");
          const detector = new Ctor({ formats: ["qr_code"] });
          loopRef.current = window.setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) return;
            try {
              const results = await detector.detect(videoRef.current);
              if (results.length > 0) {
                const value = results[0].rawValue;
                setDetectedLabel(value.slice(0, 40));
                if (openSite(value)) stopCamera();
              }
            } catch {
              // تتجاهل الأخطاء المؤقتة أثناء المسح
            }
          }, 300);
        } else {
          /* محرك التوافق: معالجة إطارات الفيديو مباشرة عبر jsQR. */
          setEngine("compat");
          const captureCode = () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas || video.readyState < 2 || !video.videoWidth) return;
            const scale = Math.min(1, 640 / video.videoWidth);
            canvas.width = Math.round(video.videoWidth * scale);
            canvas.height = Math.round(video.videoHeight * scale);
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) return;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const result = jsQR(frame.data, frame.width, frame.height, {
              inversionAttempts: "dontInvert",
            });
            if (result?.data) {
              setDetectedLabel(result.data.slice(0, 40));
              if (openSite(result.data)) stopCamera();
            }
          };
          loopRef.current = window.setInterval(captureCode, 280);
        }
      } catch (err: unknown) {
        console.error("Camera access failed:", err);
        setCameraError(
          t(
            "تعذّر الوصول للكاميرا. تأكد من فتح الموقع برابط HTTPS وإعطاء إذن الكاميرا للمتصفح.",
            "Could not access camera. Ensure you are using HTTPS and granted camera access.",
          ),
        );
        setCameraOn(false);
      }
    };

    void start();
    return () => {
      cancelled = true;
    };
  }, [cameraOn, openSite, stopCamera, t]);

  useEffect(() => {
    return () => {
      if (loopRef.current) window.clearInterval(loopRef.current);
      if (streamRef.current)
        streamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const search = () => {
    if (!code.trim()) {
      setError(t("أدخل رمز الحملة أولاً.", "Enter a campaign code first."));
      return;
    }
    openSite(code);
  };

  const recentCampaigns = recent
    .map((id) => findCampaign(id))
    .filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <Modal
      open
      onClose={closeModal}
      title={t("مسح رمز موقع التشجير", "Scan a planting site QR")}
      subtitle={t(
        "وجّه الكاميرا نحو رمز الحملة المطبوع في الموقع، أو أدخل رمزها يدوياً لفتح بطاقة الموقع.",
        "Point the camera at the campaign sign, or enter its code manually to open the site card.",
      )}
      icon={<ScanLine className="size-5" />}
      size="md"
    >
      <div className="space-y-4">
        {/* Live camera viewport */}
        <div className="relative overflow-hidden rounded-[26px] bg-forest p-5 text-center">
          <div className="hero-pattern pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative mx-auto flex h-[210px] w-full max-w-[300px] items-center justify-center overflow-hidden rounded-2xl border border-mint/20 bg-black/25">
            {cameraOn ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="size-full object-cover"
                />
                {/* كانفاس مخفي — يستخرج إطارات الفيديو لمحرك jsQR */}
                <canvas ref={canvasRef} className="hidden" aria-hidden />
              </>
            ) : (
              <div className="relative grid size-20 place-items-center rounded-2xl border border-mint/25 bg-white/5 text-mint/80">
                <QrCode className="size-11" strokeWidth={1.2} />
              </div>
            )}
            <span className="pointer-events-none absolute start-3 top-3 size-6 rounded-ss-xl border-s-2 border-t-2 border-mint" />
            <span className="pointer-events-none absolute end-3 top-3 size-6 rounded-se-xl border-e-2 border-t-2 border-mint" />
            <span className="pointer-events-none absolute bottom-3 start-3 size-6 rounded-es-xl border-b-2 border-s-2 border-mint" />
            <span className="pointer-events-none absolute bottom-3 end-3 size-6 rounded-ee-xl border-b-2 border-e-2 border-mint" />
            {cameraOn && (
              <span className="pointer-events-none absolute inset-x-8 top-4 h-0.5 animate-scan bg-gradient-to-r from-transparent via-mint to-transparent shadow-[0_0_16px_2px_rgba(184,230,206,0.7)]" />
            )}
            {detectedLabel && !cameraOn && (
              <span
                dir="ltr"
                className="absolute bottom-2 start-1/2 -translate-x-1/2 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[8.5px] font-bold text-forest"
              >
                {detectedLabel}
              </span>
            )}
          </div>
          <div className="relative mt-3 flex flex-wrap items-center justify-center gap-2 text-[9.5px] text-mint/70">
            <Camera className="size-3.5" />
            {cameraOn
              ? t("الكاميرا نشطة — ضع رمز الحملة داخل الإطار", "Camera active — place the campaign code inside the frame")
              : t("الكاميرا متوقفة", "Camera off")}
            {cameraOn && (
              <>
                {engine === "native" && (
                  <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[8.5px] font-bold text-mint ring-1 ring-mint/30">
                    {t("الماسح المباشر يعمل", "Live scanner on")}
                  </span>
                )}
                {engine === "compat" && (
                  <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[8.5px] font-bold text-mint ring-1 ring-mint/30">
                    {t("الماسح يعمل (وضع التوافق)", "Scanner on (compat mode)")}
                  </span>
                )}
              </>
            )}
            {!cameraOn && (
              <button
                onClick={() => {
                  setCameraError("");
                  setError("");
                  setCameraOn(true);
                }}
                className="rounded-full bg-mint px-3 py-1.5 text-[10px] font-bold text-forest transition hover:bg-white"
              >
                {t("تشغيل الكاميرا", "Turn camera on")}
              </button>
            )}
            {cameraOn && (
              <button
                onClick={stopCamera}
                className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15"
              >
                <CameraOff className="me-1 inline size-3" />
                {t("إيقاف", "Stop")}
              </button>
            )}
          </div>
          {cameraError && (
            <p className="relative mt-2 rounded-xl bg-[#FBE7E7] px-3 py-2 text-[9.5px] font-medium text-[#B03636]">
              {cameraError}
            </p>
          )}
        </div>

        {/* Manual entry */}
        <div>
          <label
            htmlFor="campaign-code"
            className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-charcoal/65"
          >
            <span>{t("رمز الحملة", "Campaign code")}</span>
            <span className="text-[9px] font-medium text-charcoal/35">
              {t("أو الصق رابط الرمز", "or paste the QR link")}
            </span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-charcoal/30" />
              <input
                id="campaign-code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") search();
                }}
                placeholder="CMP-SKK-001"
                dir="ltr"
                className="w-full rounded-2xl border border-line bg-white py-2.5 pe-3 ps-10 text-start font-mono text-[12px] tracking-wide outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </div>
            <button
              onClick={search}
              className="rounded-2xl bg-forest px-4 text-[12px] font-bold text-white transition hover:bg-brand-dark"
            >
              {t("بحث", "Find")}
            </button>
          </div>
          {error && (
            <p className="mt-1.5 text-[10px] font-medium text-[#B03636]">{error}</p>
          )}
        </div>

        {recentCampaigns.length > 0 && (
          <div className="rounded-2xl bg-cream/80 p-3">
            <p className="flex items-center gap-1.5 text-[9.5px] font-semibold text-charcoal/45">
              <Clock className="size-3" />
              {t("آخر المواقع المسوحة", "Recently scanned sites")}
            </p>
            <div className="mt-2 space-y-1.5">
              {recentCampaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => openSite(campaign.id)}
                  className="flex w-full items-center gap-2.5 rounded-2xl border border-line/80 bg-white p-2.5 text-start transition hover:border-brand/35 hover:shadow-sm"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-mint-soft text-brand">
                    <TreePine className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-forest">
                      {lang === "ar" ? campaign.nameAr : campaign.nameEn}
                    </p>
                    <p className="truncate text-[9.5px] text-charcoal/45">
                      <MapPin className="me-1 inline size-2.5" />
                      {municipalityName(campaign.municipalityId, lang)} ·{" "}
                      {formatDate(campaign.date, lang, false)}
                    </p>
                  </div>
                  <Badge tone={statusTone(campaign.status)}>
                    {campaign.status === "active"
                      ? t("جارية", "Active")
                      : campaign.status === "completed"
                        ? t("مكتملة", "Completed")
                        : t("مخططة", "Planned")}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 rounded-2xl bg-forest/5 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[9.5px] text-charcoal/50">
            <CheckCircle2 className="size-3.5 text-brand" />
            {t(
              "كل موقع تشجير له رمز QR واحد يفتح بطاقته وتفاصيل نموه.",
              "Every planting site has one QR code that opens its card and growth details.",
            )}
          </div>
          <button
            onClick={closeModal}
            className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[9.5px] font-semibold text-forest ring-1 ring-line"
          >
            {t("إغلاق", "Close")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
