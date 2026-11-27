"use client";

import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  CalendarDays,
  CheckCircle2,
  Copy,
  Info,
  MapPin,
  Printer,
  QrCode,
  Ruler,
  Sprout,
  TreePine,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { getMunicipality } from "@/lib/municipalities";
import {
  formatArea,
  formatDate,
  formatNumber,
  polygonAreaSqm,
} from "@/lib/utils";
import type { Campaign } from "@/lib/types";
import { Badge, Modal, Progress } from "./ui";

const STATUS: Record<
  Campaign["status"],
  { ar: string; en: string; tone: "amber" | "mint" | "forest" }
> = {
  planned: { ar: "مخططة", en: "Planned", tone: "amber" },
  active: { ar: "جارية", en: "Active", tone: "mint" },
  completed: { ar: "مكتملة", en: "Completed", tone: "forest" },
};

/** Full site card shown when a campaign QR code is scanned or its code entered. */
export default function CampaignSite({ campaignId }: { campaignId: string }) {
  const { t, lang, findCampaign, trees, closeModal, openModal, isAdmin, notify } =
    useApp();
  const campaign = findCampaign(campaignId);

  const siteTrees = useMemo(
    () => (campaign ? trees.filter((tr) => tr.campaignId === campaign.id) : []),
    [campaign, trees],
  );

  const species = useMemo(() => {
    const counts = new Map<string, { ar: string; en: string; count: number }>();
    siteTrees.forEach((tree) => {
      const key = `${tree.speciesAr}|${tree.speciesEn}`;
      const entry = counts.get(key) ?? {
        ar: tree.speciesAr,
        en: tree.speciesEn,
        count: 0,
      };
      entry.count += 1;
      counts.set(key, entry);
    });
    return [...counts.values()].sort((a, b) => b.count - a.count);
  }, [siteTrees]);

  if (!campaign) {
    return (
      <Modal
        open
        onClose={closeModal}
        title={t("بطاقة موقع التشجير", "Planting site card")}
        icon={<MapPin className="size-5" />}
        size="sm"
      >
        <p className="py-6 text-center text-[12px] text-charcoal/50">
          {t(
            "لم نجد حملة بهذا الرمز. تأكد من رمز الموقع ثم أعد المحاولة.",
            "No campaign found with this code. Check the site code and try again.",
          )}
        </p>
      </Modal>
    );
  }

  const muni = getMunicipality(campaign.municipalityId);
  const status = STATUS[campaign.status];
  const area =
    campaign.areaSqm ?? (campaign.polygon ? polygonAreaSqm(campaign.polygon) : 0);
  const organizer =
    campaign.organizer?.trim() ||
    muni.adminName ||
    (lang === "ar" ? "ولاية سكيكدة" : "Skikda Wilaya");
  const codePath = `?campaign=${encodeURIComponent(campaign.id)}`;
  const codeUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}${codePath}`
      : codePath;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(campaign.id);
      notify(t("تم نسخ رمز الحملة.", "Campaign code copied."));
    } catch {
      notify(t("تعذّر النسخ.", "Could not copy."), "error");
    }
  };

  const metrics = [
    {
      label: t("الأشجار المسجّلة", "Registered trees"),
      value: formatNumber(siteTrees.length, lang),
      icon: TreePine,
    },
    {
      label: t("الأنواع المسجّلة", "Registered species"),
      value: formatNumber(species.length, lang),
      icon: Sprout,
    },
    {
      label: t("مساحة الموقع", "Site area"),
      value: formatArea(area, lang),
      icon: Ruler,
    },
    {
      label: t("المستهدف", "Target"),
      value: formatNumber(campaign.target, lang),
      icon: Users,
    },
  ];

  return (
    <Modal
      open
      onClose={closeModal}
      title={t("بطاقة موقع التشجير", "Planting site card")}
      subtitle={t(
        "كل موقع له رمز QR واحد يفتح بطاقته ومتابعة نموه.",
        "One QR code per site opens its card and growth record.",
      )}
      icon={<MapPin className="size-5" />}
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-[10.5px] font-semibold text-forest transition hover:bg-mint-soft"
          >
            <Copy className="size-3.5" />
            <span dir="ltr">{campaign.id}</span>
          </button>
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <button
                onClick={() =>
                  openModal({ type: "campaign", campaignId: campaign.id })
                }
                className="rounded-full border border-line bg-white px-3.5 py-2 text-[10.5px] font-semibold text-forest transition hover:bg-mint-soft"
              >
                {t("تعديل حدود الموقع", "Edit site boundary")}
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() =>
                  openModal({ type: "tree-form", campaignId: campaign.id })
                }
                className="rounded-full border border-line bg-white px-3.5 py-2 text-[10.5px] font-semibold text-forest transition hover:bg-mint-soft"
              >
                {t("تسجيل شجرة في الحملة", "Add a tree to this campaign")}
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() =>
                  openModal({ type: "print", campaignId: campaign.id })
                }
                className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-[10.5px] font-bold text-white transition hover:bg-brand-dark"
              >
                <Printer className="size-3.5" />
                {t("لافتة الموقع", "Site sign")}
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-[22px] bg-forest p-5 text-white">
          <div className="hero-pattern pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-mint/65">
                {t("موقع تشجير موثّق", "DOCUMENTED PLANTING SITE")}
              </p>
              <h3 className="mt-1 font-display text-xl font-extrabold sm:text-2xl">
                {lang === "ar" ? campaign.nameAr : campaign.nameEn}
              </h3>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-white/65">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" />
                  {lang === "ar" ? muni.nameAr : muni.nameEn}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3" />
                  {formatDate(campaign.date, lang)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3" />
                  {organizer}
                </span>
              </p>
              <p className="mt-1.5 font-mono text-[10px] tracking-wide text-mint/70" dir="ltr">
                {campaign.id}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="rounded-xl bg-white p-2">
                <QRCodeSVG
                  value={codeUrl}
                  size={104}
                  marginSize={2}
                  bgColor="#ffffff"
                  fgColor="#123B2A"
                  level="M"
                />
              </div>
              <Badge tone={status.tone}>
                {lang === "ar" ? status.ar : status.en}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="rounded-2xl border border-line/70 bg-white p-3 text-center"
              >
                <Icon className="mx-auto size-4 text-brand" />
                <p className="mt-1 font-display text-base font-extrabold text-forest">
                  {metric.value}
                </p>
                <p className="text-[8.5px] text-charcoal/45">{metric.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-line/70 bg-white p-4">
            <p className="flex items-center gap-1.5 text-[10.5px] font-bold text-forest">
              <Sprout className="size-3.5 text-brand" />
              {t("توزيع الأنواع المسجّلة", "Registered species mix")}
            </p>
            {species.length === 0 ? (
              <p className="mt-3 text-[10px] text-charcoal/45">
                {t(
                  "لا توجد أشجار مسجّلة داخل الحملة بعد.",
                  "No trees registered in this campaign yet.",
                )}
              </p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {species.slice(0, 6).map((sp) => (
                  <div key={`${sp.ar}|${sp.en}`}>
                    <div className="mb-1 flex justify-between text-[9.5px]">
                      <span className="font-semibold text-forest">
                        {lang === "ar" ? sp.ar : sp.en}
                      </span>
                      <span className="font-mono text-brand">{sp.count}</span>
                    </div>
                    <Progress
                      value={siteTrees.length ? (sp.count / siteTrees.length) * 100 : 0}
                      className="h-1"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line/70 bg-white p-4">
            <p className="flex items-center gap-1.5 text-[10.5px] font-bold text-forest">
              <Ruler className="size-3.5 text-brand" />
              {t("حدود الموقع", "Site boundary")}
            </p>
            <div className="mt-3 space-y-2 text-[10px] text-charcoal/55">
              <p className="flex items-center justify-between gap-2">
                <span>{t("عدد نقاط المضلع", "Polygon points")}</span>
                <span className="font-mono font-bold text-forest">
                  {campaign.polygon?.length ?? 0}
                </span>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span>{t("المساحة التقريبية", "Approximate area")}</span>
                <span className="font-bold text-brand">{formatArea(area, lang)}</span>
              </p>
              <p className="flex items-center justify-between gap-2" dir="ltr">
                <span>{t("نقطة الارتكاز", "Anchor")}</span>
                <span className="font-mono text-[9px]">
                  {campaign.lat.toFixed(5)}, {campaign.lng.toFixed(5)}
                </span>
              </p>
            </div>
            <div className="mt-3 flex items-start gap-1.5 rounded-xl bg-mint-soft/60 p-2.5 text-[9px] leading-snug text-brand-dark/70">
              <Info className="mt-0.5 size-3 shrink-0" />
              {t(
                "تُحسب المساحة تقديرياً من إحداثيات الحدود المرسومة على الخريطة.",
                "The area is estimated from the boundary drawn on the map.",
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-2xl bg-forest/5 px-3 py-2.5 text-[9.5px] text-charcoal/50">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-brand" />
            <QrCode className="size-3.5 text-brand" />
            {t(
              "امسح رمز الموقع أو أدخل رمزه لعرض هذه البطاقة في أي وقت.",
              "Scan the site code or enter it any time to open this card.",
            )}
          </span>
        </div>
      </div>
    </Modal>
  );
}
