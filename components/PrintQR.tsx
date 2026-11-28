"use client";

import { QRCodeSVG } from "qrcode.react";
import {
  CalendarDays,
  Info,
  MapPin,
  Printer,
  QrCode,
  Ruler,
  Sprout,
  TreePine,
  Users,
  X,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { getMunicipality } from "@/lib/municipalities";
import { qrDeepLink } from "@/lib/qr";
import { formatArea, formatDate, formatNumber, polygonAreaSqm } from "@/lib/utils";
import { Modal } from "./ui";

/** One printable A4 sign per campaign site — replaces per-tree QR labels. */
export default function PrintQR({ campaignId }: { campaignId: string }) {
  const { t, lang, campaigns, trees, closeModal } = useApp();
  const campaign = campaigns.find((c) => c.id === campaignId);

  if (!campaign) {
    return (
      <Modal
        open
        onClose={closeModal}
        title={t("لافتة الموقع", "Site sign")}
        icon={<QrCode className="size-5" />}
        size="sm"
      >
        <p className="py-6 text-center text-[12px] text-charcoal/50">
          {t("لم يتم العثور على الحملة.", "Campaign not found.")}
        </p>
      </Modal>
    );
  }

  const muni = getMunicipality(campaign.municipalityId);
  const siteTrees = trees.filter((tr) => tr.campaignId === campaign.id);
  const species = Array.from(
    new Map(
      siteTrees.map((tr) => [
        `${tr.speciesAr}|${tr.speciesEn}`,
        lang === "ar" ? tr.speciesAr : tr.speciesEn,
      ]),
    ).values(),
  );
  const area =
    campaign.areaSqm ?? (campaign.polygon ? polygonAreaSqm(campaign.polygon) : 0);
  const organizer =
    campaign.organizer?.trim() ||
    muni.adminName ||
    (lang === "ar" ? "ولاية سكيكدة" : "Skikda Wilaya");
  const statusLabel =
    campaign.status === "active"
      ? t("جارية", "Active")
      : campaign.status === "completed"
        ? t("مكتملة", "Completed")
        : t("مخططة", "Planned");
  const campaignUrl = qrDeepLink(campaign.id);

  return (
    <Modal
      open
      onClose={closeModal}
      size="full"
      bare
      bodyClassName="p-0"
      className="overflow-hidden"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white/85 px-4 py-3 backdrop-blur sm:px-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-forest text-mint">
              <QrCode className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-forest sm:text-lg">
                {t("لافتة تعريف موقع التشجير", "Planting site sign")}
              </h2>
              <p className="flex flex-wrap items-center gap-x-2 text-[10px] text-charcoal/45">
                <span>{lang === "ar" ? campaign.nameAr : campaign.nameEn}</span>
                <span className="text-charcoal/20">·</span>
                <span>{lang === "ar" ? muni.nameAr : muni.nameEn}</span>
                <span className="text-charcoal/20">·</span>
                <span>{formatDate(campaign.date, lang)}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-[11.5px] font-bold text-white transition hover:bg-brand-dark"
            >
              <Printer className="size-3.5" />
              {t("طباعة لافتة A4", "Print A4 sign")}
            </button>
            <button
              onClick={closeModal}
              className="grid size-9 place-items-center rounded-full border border-line bg-white text-charcoal/55 transition hover:text-forest"
              aria-label={t("إغلاق", "Close")}
            >
              <X className="size-4.5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-cream p-4 sm:p-5">
          <div
            id="print-area"
            className="site-sign mx-auto w-full max-w-[760px] overflow-hidden rounded-[26px] border-[3px] border-forest bg-white text-forest shadow-sm"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <div className="site-sign-header bg-forest px-7 py-6 text-white sm:px-10 sm:py-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/25">
                    <Sprout className="size-7 text-mint" strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="font-display text-2xl font-extrabold leading-tight sm:text-[28px]">
                      {t("حملتي", "HAMALATI")}
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-mint/65">
                      {t("ولاية سكيكدة · منصة توثيق حملات التشجير", "Skikda Wilaya · Campaign documentation platform")}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-mint/15 px-3 py-1.5 text-[10px] font-bold text-mint ring-1 ring-mint/30">
                  {statusLabel}
                </span>
              </div>
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-mint/60">
                {t("لافتة تعريف بموقع الغرس", "PLANTING SITE IDENTIFICATION")}
              </p>
              <h1 className="mt-1 font-display text-[28px] font-extrabold leading-tight sm:text-[38px]">
                {lang === "ar" ? campaign.nameAr : campaign.nameEn}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-white/75 sm:text-[13px]">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-mint" />
                  {lang === "ar" ? muni.nameAr : muni.nameEn}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-mint" />
                  {formatDate(campaign.date, lang)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4 text-mint" />
                  {organizer}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-b border-line/70 px-7 py-5 sm:px-10">
              {[
                {
                  icon: TreePine,
                  value: formatNumber(siteTrees.length, lang),
                  label: t("شجرة مزروعة ومسجّلة", "Trees planted & registered"),
                },
                {
                  icon: Sprout,
                  value: formatNumber(species.length, lang),
                  label: t("نوع مسجّل", "Registered species"),
                },
                {
                  icon: Ruler,
                  value: formatArea(area, lang),
                  label: t("مساحة الموقع التقريبية", "Approximate site area"),
                },
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="text-center">
                    <Icon className="mx-auto size-5 text-brand" />
                    <p className="mt-1 font-display text-xl font-extrabold sm:text-2xl">
                      {metric.value}
                    </p>
                    <p className="mt-0.5 text-[9px] text-charcoal/50 sm:text-[10px]">
                      {metric.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col items-center gap-3 px-7 py-6 sm:px-10">
              <div className="rounded-[22px] border border-forest/15 bg-white p-3 shadow-sm">
                <QRCodeSVG
                  value={campaignUrl}
                  size={250}
                  marginSize={3}
                  bgColor="#ffffff"
                  fgColor="#123B2A"
                  level="H"
                />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-charcoal/40">
                {t("رمز الحملة", "CAMPAIGN CODE")}
              </p>
              <p className="rounded-full bg-mint-soft px-4 py-1.5 font-mono text-[14px] font-extrabold tracking-wide text-brand-dark" dir="ltr">
                {campaign.id}
              </p>
              <p className="text-center text-[10px] text-charcoal/45">
                {t(
                  "امسح الرمز بالكاميرا أو أدخل الرمز أعلاه في الماسح لعرض بطاقة الموقع.",
                  "Scan the code with your camera or enter the code above in the scanner.",
                )}
              </p>
            </div>

            <div className="site-sign-footer border-t-[3px] border-forest bg-mint-soft/50 px-7 py-4 text-center sm:px-10">
              <p className="font-display text-[15px] font-extrabold leading-relaxed text-forest sm:text-lg">
                {t(
                  "هذا الموقع غُرس بسواعد متطوعينا.. امسح الرمز لمتابعة نموه وتفاصيله",
                  "This site was planted by our volunteers.. scan the code to follow its growth and details",
                )}
              </p>
              {species.length > 0 && (
                <p className="mt-2 text-[10px] text-charcoal/55">
                  {t("الأنواع الرئيسية:", "Main species:")}{" "}
                  {species.slice(0, 5).join(" · ")}
                </p>
              )}
            </div>
          </div>

          <div className="no-print mx-auto mt-3 flex max-w-[760px] items-center justify-center gap-1.5 text-[9px] text-charcoal/35">
            <Info className="size-3" />
            {t(
              "نصيحة: اطبع على ورق مقاوم للماء أو غلّف اللافتة قبل تعليقها في الموقع.",
              "Tip: print on water-resistant paper or laminate the sign before hanging it on site.",
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
