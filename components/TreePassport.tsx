"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Droplets,
  Fingerprint,
  Grid3X3,
  Leaf,
  MapPin,
  Printer,
  QrCode,
  Send,
  Share2,
  ShieldCheck,
  Sprout,
  TreePine,
  UserRound,
  X,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { getMunicipality } from "@/lib/municipalities";
import { STATUS_META } from "@/lib/data";
import {
  cn,
  daysSince,
  formatDate,
  formatNumber,
  relativeTime,
  todayISO,
} from "@/lib/utils";
import { Badge, CopyButton, Modal, Progress, StatusPill } from "./ui";
import { TreeArt } from "./TreeArt";

export default function TreePassport({ treeId }: { treeId: string }) {
  const {
    t,
    lang,
    findTree,
    closeModal,
    waterTree,
    escalateTree,
    user,
    campaigns,
    activities,
    notify,
  } = useApp();
  const [escalating, setEscalating] = useState(false);
  const [note, setNote] = useState("");
  const [printQueued, setPrintQueued] = useState(false);

  const tree = findTree(treeId);

  // Watering log for this tree — grouped by actor and day (from the field log)
  const treeWaterLog = activities
    .filter((a) => a.type === "water" && a.treeId === treeId)
    .reduce<Array<{ key: string; actor: string; when: string; count: number }>>(
      (entries, activity) => {
        const when = relativeTime(activity.at, lang);
        const key = `${activity.actor}|${when}`;
        const existing = entries.find((e) => e.key === key);
        if (existing) existing.count += 1;
        else
          entries.push({
            key,
            actor: activity.actor,
            when,
            count: 1,
          });
        return entries;
      },
      [],
    );

  // Single-tree printable QR label
  useEffect(() => {
    if (!printQueued) return;
    const timer = setTimeout(() => {
      window.print();
      setPrintQueued(false);
    }, 60);
    return () => clearTimeout(timer);
  }, [printQueued]);

  if (!tree) {
    return (
      <Modal
        open
        onClose={closeModal}
        title={t("جواز الشجرة", "Tree passport")}
        icon={<QrCode className="size-5" />}
        size="sm"
      >
        <div className="py-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#FBE7E7] text-[#B03636]">
            <AlertTriangle className="size-6" />
          </div>
          <p className="mt-4 font-display text-base font-bold text-forest">
            {t("لم يتم العثور على الشجرة", "Tree not found")}
          </p>
          <p className="mt-1 text-[12px] text-charcoal/50">
            {t("قد يكون الرمز تالفاً. جرّب استرجاع الرقم من إحداثياته.", "The code may be damaged. Try recovering the ID from its grid coordinates.")}
          </p>
          <button
            onClick={closeModal}
            className="mt-4 rounded-full bg-forest px-5 py-2 text-[12px] font-bold text-white"
          >
            {t("إغلاق", "Close")}
          </button>
        </div>
      </Modal>
    );
  }

  const muni = getMunicipality(tree.municipalityId);
  const meta = STATUS_META[tree.status];
  const campaign = campaigns.find((c) => c.id === tree.campaignId);
  const wateredToday = tree.lastWatered === todayISO();
  const canEscalate = user && user.role !== "volunteer";

  const share = async () => {
    const text = `${tree.id} · ${lang === "ar" ? tree.speciesAr : tree.speciesEn} · ${lang === "ar" ? muni.nameAr : muni.nameEn}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "جواز الشجرة الرقمي", text });
      } else {
        await navigator.clipboard.writeText(text);
        notify(t("تم نسخ بيانات الشجرة.", "Tree details copied."));
      }
    } catch {
      notify(t("تعذّر المشاركة.", "Sharing is unavailable."), "error");
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(tree.id);
      notify(t("تم نسخ رقم الشجرة.", "Tree ID copied."));
    } catch {
      notify(t("تعذّر النسخ.", "Could not copy."), "error");
    }
  };

  return (
    <Modal
      open
      onClose={closeModal}
      size="xl"
      bare
      bodyClassName="p-0"
      className="overflow-hidden"
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Header */}
        <div className="relative overflow-hidden bg-forest p-5 text-white sm:p-6">
          <div className="hero-pattern pointer-events-none absolute inset-0 opacity-60" />
          <div className="pointer-events-none absolute -top-20 end-1/4 size-64 rounded-full bg-brand/35 blur-3xl" />
          <button
            onClick={closeModal}
            className="absolute end-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-white/10 text-white/70 ring-1 ring-white/15 transition hover:bg-white/20 hover:text-white"
            aria-label={t("إغلاق", "Close")}
          >
            <X className="size-4.5" />
          </button>

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-mint/15 text-mint ring-1 ring-mint/20">
                <Fingerprint className="size-6" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-mint/60">
                    {t("جواز الشجرة الرقمي", "DIGITAL TREE PASSPORT")}
                  </p>
                  <StatusPill status={tree.status} lang={lang} />
                </div>
                <h2 className="mt-1 font-mono text-2xl font-extrabold tracking-wide text-white sm:text-[30px]">
                  {tree.id}
                </h2>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/55">
                  <span className="flex items-center gap-1">
                    <TreePine className="size-3.5 text-mint" />
                    {lang === "ar" ? tree.speciesAr : tree.speciesEn}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5 text-mint" />
                    {lang === "ar" ? muni.nameAr : muni.nameEn} ({muni.code})
                  </span>
                  {campaign && (
                    <span className="flex items-center gap-1">
                      <Leaf className="size-3.5 text-mint" />
                      {lang === "ar" ? campaign.nameAr : campaign.nameEn}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white p-2.5 text-charcoal shadow-lg">
              <div className="rounded-lg bg-white p-1">
                <QRCodeSVG
                  value={`https://shajarati.dz/tree/${tree.id}`}
                  size={78}
                  bgColor="#ffffff"
                  fgColor="#123B2A"
                  level="M"
                />
              </div>
              <div className="hidden pe-1 sm:block">
                <p className="text-[8px] font-bold uppercase tracking-wider text-charcoal/35">
                  {t("امسح للتحقق", "SCAN TO VERIFY")}
                </p>
                <p className="mt-1 max-w-[92px] text-[9px] leading-snug text-charcoal/55">
                  {t("جواز رقمي موثّق في سجل ولاية سكيكدة.", "Verified in the Skikda wilaya registry.")}
                </p>
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-mint-soft px-1.5 py-0.5 text-[8px] font-bold text-brand">
                  <ShieldCheck className="size-2.5" />
                  {t("موثّق", "VERIFIED")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-4">
            <div className="relative h-44 overflow-hidden rounded-[22px] border border-line">
              <TreeArt seed={tree.art} />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/70 via-forest/5 to-transparent" />
              <div className="absolute inset-x-3 bottom-3 flex items-end justify-between">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-mint/80">
                    {t("صورة توثيقية", "Field photo")}
                  </p>
                  <p className="font-display text-sm font-bold text-white">
                    {lang === "ar" ? tree.speciesAr : tree.speciesEn} ·{" "}
                    {t("صف", "Row")} {tree.row} / {t("عمود", "Col")} {tree.col}
                  </p>
                </div>
                <span className="rounded-full bg-white/15 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur">
                  {formatDate(tree.plantedAt, lang)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  icon: TreePine,
                  label: t("النوع", "Species"),
                  value: lang === "ar" ? tree.speciesAr : tree.speciesEn,
                },
                {
                  icon: MapPin,
                  label: t("البلدية", "Municipality"),
                  value: lang === "ar" ? muni.nameAr : muni.nameEn,
                },
                {
                  icon: CalendarDays,
                  label: t("تاريخ الغرس", "Planting date"),
                  value: formatDate(tree.plantedAt, lang),
                },
                {
                  icon: Droplets,
                  label: t("آخر سقاية", "Last watered"),
                  value: formatDate(tree.lastWatered, lang),
                },
                {
                  icon: Grid3X3,
                  label: t("الإحداثيات", "Grid coordinates"),
                  value: `R${tree.row} / C${tree.col}`,
                },
                {
                  icon: UserRound,
                  label: t("الغارس", "Planted by"),
                  value: tree.plantedBy,
                },
                {
                  icon: Clock,
                  label: t("مرات السقاية", "Waterings"),
                  value: `${formatNumber(tree.waterings, lang)} ${t("مرة", "times")}`,
                },
                {
                  icon: ShieldCheck,
                  label: t("الصحة", "Health"),
                  value: `${tree.health}/100`,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-line/70 bg-white p-3"
                  >
                    <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-charcoal/35">
                      <Icon className="size-3 text-brand" />
                      {item.label}
                    </p>
                    <p className="mt-1 truncate text-[11.5px] font-bold text-forest">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-line/70 bg-white p-3.5">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-[10px] font-bold text-forest">
                  <Fingerprint className="size-3.5 text-brand" />
                  {t("ملاحظات ميدانية", "Field notes")}
                </p>
                <Badge tone="mint">{t("سجل حي", "Live record")}</Badge>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-charcoal/55">
                {lang === "ar"
                  ? tree.notesAr || t("لا توجد ملاحظات مسجلة لهذه الشجرة بعد.", "No field notes recorded for this tree yet.")
                  : tree.notesEn || t("No field notes recorded for this tree yet.", "No field notes recorded for this tree yet.")}
              </p>
              <div className="mt-3 flex items-start gap-1.5 rounded-xl bg-[#FBF2DC]/70 px-2.5 py-2 text-[9px] leading-snug text-[#8A6516]">
                <Grid3X3 className="mt-0.5 size-3 shrink-0" />
                {t(
                  `استرجاع الرقم عند تلف الـ QR: ابحث عن الصف ${tree.row} والعمود ${tree.col} في مخطط الحملة.`,
                  `If the QR is damaged: find row ${tree.row}, column ${tree.col} on the campaign layout.`,
                )}
              </div>
            </div>
          </div>

          {/* Care panel */}
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-forest to-brand-dark p-4 text-white">
              <div className="hero-pattern pointer-events-none absolute inset-0 opacity-40" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-mint/70">
                    <Droplets className="size-3.5" />
                    {t("رعاية الشجرة", "Tree care")}
                  </p>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-semibold text-mint ring-1 ring-white/10">
                    {daysSince(tree.lastWatered) === 0
                      ? t("سُقيت اليوم", "Watered today")
                      : t(`منذ ${daysSince(tree.lastWatered)} يوم`, `${daysSince(tree.lastWatered)}d ago`)}
                  </span>
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-[9px] text-white/45">{t("آخر توثيق سقاية", "Last watering")}</p>
                    <p className="font-display text-sm font-bold text-white">
                      {formatDate(tree.lastWatered, lang)}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="font-display text-2xl font-extrabold text-mint">
                      {tree.waterings}
                    </p>
                    <p className="text-[8px] text-white/45">{t("سقاية موثقة", "verified waterings")}</p>
                  </div>
                </div>

                <button
                  onClick={() => waterTree(tree.id)}
                  disabled={wateredToday}
                  className={cn(
                    "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[13px] font-bold transition",
                    wateredToday
                      ? "cursor-default bg-white/10 text-mint/60 ring-1 ring-white/10"
                      : "bg-mint text-forest shadow-[0_14px_30px_-16px_rgba(184,230,206,0.9)] hover:bg-white",
                  )}
                >
                  {wateredToday ? (
                    <>
                      <CheckCircle2 className="size-4.5" />
                      {t("تمت سقاية اليوم", "Watered today")}
                    </>
                  ) : (
                    <>
                      <Droplets className="size-4.5" />
                      {t("سقيت اليوم", "I watered it today")}
                    </>
                  )}
                </button>
                <p className="mt-2 text-center text-[8.5px] text-white/35">
                  {t(
                    "نقرة واحدة تُحدّث السحابة وسجل السقاية فوراً.",
                    "One click updates the cloud and the watering log instantly.",
                  )}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-line/70 bg-white p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-forest">
                  {t("مؤشر صحة الشجرة", "Tree health index")}
                </p>
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                  style={{ backgroundColor: meta.bg, color: meta.color }}
                >
                  {tree.health}/100
                </span>
              </div>
              <Progress
                value={tree.health}
                color={meta.color}
                className="mt-2 h-2"
              />
              <div className="mt-2 flex justify-between text-[9px] text-charcoal/40">
                <span>{t("آخر فحص", "Last check")}</span>
                <span>{relativeTime(`${tree.lastWatered}T10:00:00`, lang)}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-line/70 bg-white p-3.5">
              <p className="text-[10px] font-bold text-forest">
                {t("إجراءات الجواز", "Passport actions")}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <button
                  onClick={copyId}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-cream/70 px-2 py-2 text-[10px] font-semibold text-charcoal/65 transition hover:bg-mint-soft hover:text-brand"
                >
                  <Copy className="size-3.5" />
                  {t("نسخ الرقم", "Copy ID")}
                </button>
                <button
                  onClick={share}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-cream/70 px-2 py-2 text-[10px] font-semibold text-charcoal/65 transition hover:bg-mint-soft hover:text-brand"
                >
                  <Share2 className="size-3.5" />
                  {t("مشاركة", "Share")}
                </button>
                <button
                  onClick={() => setPrintQueued(true)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-cream/70 px-2 py-2 text-[10px] font-semibold text-charcoal/65 transition hover:bg-mint-soft hover:text-brand"
                >
                  <Printer className="size-3.5" />
                  {t("طباعة رمز QR", "Print QR code")}
                </button>
                {canEscalate ? (
                  <button
                    onClick={() => setEscalating((v) => !v)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#F3D2B0] bg-[#FDEEE2] px-2 py-2 text-[10px] font-semibold text-[#B45A12] transition hover:bg-[#FBE1CC]"
                  >
                    <AlertTriangle className="size-3.5" />
                    {t("تصعيد حالة", "Escalate")}
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      notify(
                        "تم إرسال طلب الفحص إلى أدمن البلدية.",
                        "An inspection request was sent to the municipality admin.",
                      )
                    }
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#F3D2B0] bg-[#FDEEE2] px-2 py-2 text-[10px] font-semibold text-[#B45A12] transition hover:bg-[#FBE1CC]"
                  >
                    <AlertTriangle className="size-3.5" />
                    {t("أبلغ عن مشكلة", "Report")}
                  </button>
                )}
              </div>

              {escalating && (
                <div className="mt-2.5 rounded-xl bg-cream/80 p-2.5">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder={t(
                      "وصف الحالة (جفاف، آفات، ضرر ميكانيكي)…",
                      "Describe the issue (drought, pests, damage)…",
                    )}
                    className="w-full resize-none rounded-lg border border-line bg-white px-2.5 py-2 text-[10.5px] outline-none focus:border-brand"
                  />
                  <button
                    onClick={() => {
                      escalateTree(tree.id, note);
                      setEscalating(false);
                      setNote("");
                    }}
                    className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#C96A1E] py-2 text-[10px] font-bold text-white transition hover:bg-[#B45A12]"
                  >
                    <Send className="size-3" />
                    {t("إرسال التصعيد إلى الولاية", "Send escalation to wilaya")}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-line/70 bg-white p-3.5">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-[10px] font-bold text-forest">
                  <Clock className="size-3.5 text-brand" />
                  {t("سجل السقاية الميداني", "Field watering log")}
                </p>
                <Badge tone="mint">
                  {formatNumber(
                    treeWaterLog.reduce(
                      (n, entry) => n + entry.count,
                      0,
                    ),
                    lang,
                  )}
                </Badge>
              </div>
              {treeWaterLog.length > 0 ? (
                <div className="mt-2.5 space-y-1.5">
                  {treeWaterLog.slice(0, 5).map((entry) => (
                    <div
                      key={entry.key}
                      className="flex items-center justify-between rounded-xl bg-cream/60 px-2.5 py-2"
                    >
                      <span className="min-w-0 flex-1 truncate text-[10.5px] font-medium text-charcoal/70">
                        <UserRound className="me-1 inline size-3 text-brand" />
                        {entry.actor || t("متطوع ميداني", "Field volunteer")}
                      </span>
                      <span className="ms-2 text-[9px] text-charcoal/40">
                        {entry.count > 1
                          ? t(
                              `${entry.count} توثيقات · ${entry.when}`,
                              `${entry.count} logins · ${entry.when}`,
                            )
                          : entry.when}
                      </span>
                      <Droplets className="ms-2 size-3 shrink-0 text-brand" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 rounded-xl bg-cream/60 px-2.5 py-2 text-[9.5px] leading-relaxed text-charcoal/45">
                  {t(
                    "لا سقايات موثقة لهذه الشجرة بعد — أول توثيق ميداني سيُسجَّل هنا فور مسح الرمز.",
                    "No verified waterings yet — the first authenticated scan lands here.",
                  )}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-mint-soft/70 p-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white text-brand">
                <Sprout className="size-4" />
              </span>
              <p className="text-[9px] leading-relaxed text-brand-dark/70">
                {t(
                  "الشجرة جزء من حملة موثقة. كل سقاية تُسجّل باسمك في سجل الولاية.",
                  "This tree is part of a documented campaign. Every watering is logged under your name.",
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/70 bg-white/70 px-5 py-3 sm:px-6">
          <div className="flex items-center gap-1.5 text-[9px] text-charcoal/40">
            <ShieldCheck className="size-3.5 text-brand" />
            {t("سجل رقمي موثّق · شجرتي بصمتي", "Verified digital record · Shajarati Basmati")}
          </div>
          <div className="flex items-center gap-2">
            <CopyButton value={tree.id} lang={lang} labelAr="نسخ معرف الشجرة" labelEn="Copy tree ID" />
            <span className="font-mono text-[9px] text-charcoal/30">
              v1.0 · {formatDate(tree.plantedAt, lang, true)}
            </span>
          </div>
        </div>
      </div>

      {/* Print-only: individual QR label for this single tree */}
      <div className="print-only" aria-hidden={printQueued ? undefined : true}>
        <div id="print-area" className="p-6" dir="ltr">
          <div className="print-label mx-auto w-[240px] border-2 border-[#123B2A] p-4 text-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#123B2A]">
              SHAJARATI BASMATI · Skikda
            </p>
            <div className="my-3 flex justify-center">
              <QRCodeSVG value={tree.id} size={150} level="H" bgColor="#ffffff" fgColor="#123B2A" />
            </div>
            <p className="font-mono text-[15px] font-extrabold text-[#123B2A]">{tree.id}</p>
            <p className="mt-1 text-[11px] font-semibold text-[#202B25]">
              {tree.speciesAr} / {tree.speciesEn}
            </p>
            <p className="mt-0.5 text-[10px] text-[#202B25]/70">
              {muni.nameAr} / {muni.nameEn} · R{tree.row} C{tree.col}
            </p>
            <p className="mt-0.5 text-[9px] text-[#202B25]/60">
              Lat {tree.lat} · Lng {tree.lng} · Planted {tree.plantedAt}
            </p>
            <p className="mt-2 border-t border-dashed border-[#123B2A]/40 pt-1.5 text-[8px] text-[#202B25]/60">
              If the QR is damaged: locate row {tree.row}, column {tree.col} on the campaign
              layout map to recover the ID.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
