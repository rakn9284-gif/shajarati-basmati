"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import {
  Info,
  MapPin,
  Map as MapIcon,
  MousePointerClick,
  Sprout,
  TreePine,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { STATUS_META } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { Badge, MiniMetric, Progress, StatusPill } from "./ui";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="grid size-full place-items-center bg-mint-soft/60">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-brand-dark/70">
        <MapIcon className="size-4 animate-pulse" />
        جارٍ تحميل خريطة ولاية سكيكدة…
      </div>
    </div>
  ),
});

export default function MapView() {
  const {
    lang,
    t,
    user,
    trees,
    campaigns,
    municipalities,
    openModal,
    activeMunicipality,
    setActiveMunicipality,
  } = useApp();

  const active = useMemo(
    () =>
      municipalities.find((m) => m.id === activeMunicipality) ??
      municipalities.find((m) => m.id === "skikda") ??
      municipalities[0],
    [municipalities, activeMunicipality],
  );

  const canCreate =
    !!user &&
    (user.role === "state_admin" ||
      (user.role === "municipality_admin" &&
        user.municipalityId === active.id));

  const newCampaign = () => openModal({ type: "campaign" });

  return (
    <section className="card-surface overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-mint-soft text-brand">
              <MapIcon className="size-4.5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-forest">
                {t("الخريطة التفاعلية للولاية", "Interactive wilaya map")}
              </h2>
              <p className="text-[11px] text-charcoal/50">
                {t(
                  "38 بلدية حقيقية · OpenStreetMap — كل شجرة تُظهر في موقعها الفعلي.",
                  "38 real municipalities · OpenStreetMap — every tree plots at its true location.",
                )}
              </p>
            </div>
          </div>
        </div>
        {canCreate && (
          <button
            onClick={newCampaign}
            className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2.5 text-[11.5px] font-bold text-white transition hover:bg-brand-dark"
          >
            <Sprout className="size-4" />
            {t("حملة جديدة", "New campaign")}
          </button>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-mint-soft/40">
        <div
          className="relative h-[420px] cursor-pointer select-none"
          onClick={() => setActiveMunicipality(null)}
        >
          <LeafletMap
            municipalities={municipalities}
            trees={trees}
            activeMunicipality={activeMunicipality}
            onSelectMunicipality={(id) => setActiveMunicipality(id)}
            onSelectTree={(treeId) => openModal({ type: "passport", treeId })}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line bg-white px-3.5 py-2 text-[9px] text-charcoal/45">
          <span className="inline-flex items-center gap-1.5">
            <MousePointerClick className="size-3 text-brand" />
            {t("انقر بلدية لعرض أرقامها، وانقر شجرة لفتح جوازها.", "Click a municipality for its figures; click a tree to open its passport.")}
          </span>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ms-auto underline decoration-dotted hover:text-brand"
          >
            © OpenStreetMap contributors
          </a>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-cream/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-brand" />
            <div>
              <p className="text-[13px] font-bold text-forest">
                {lang === "ar" ? active.nameAr : active.nameEn}
              </p>
              <p className="text-[9.5px] text-charcoal/40" dir="ltr">
                {active.lat.toFixed(5)}, {active.lng.toFixed(5)}
              </p>
            </div>
            <StatusPill status={active.status} lang={lang} />
            {active.coastal && (
              <Badge tone="mint">{t("ساحلية", "Coastal")}</Badge>
            )}
          </div>
          {(() => {
            const activeCampaign = campaigns.find((c) => c.municipalityId === active.id);
            if (!activeCampaign) return null;
            return (
              <button
                onClick={() => openModal({ type: "print", campaignId: activeCampaign.id })}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-[10px] font-semibold text-forest hover:bg-mint-soft"
              >
                {t("طباعة رموز QR", "Print QR codes")}
              </button>
            );
          })()}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniMetric
            label={t("الأشجار المسجّلة", "Registered trees")}
            value={formatNumber(active.trees, lang)}
            icon={<TreePine className="size-3.5" />}
          />
          <MiniMetric
            label={t("مستقرة", "Stable")}
            value={formatNumber(active.alive, lang)}
            icon={<Sprout className="size-3.5" />}
          />
          <MiniMetric
            label={t("تحتاج متابعة", "Need attention")}
            value={formatNumber(active.needsAttention, lang)}
            icon={<Info className="size-3.5" />}
          />
          <MiniMetric
            label={t("متطوعون", "Volunteers")}
            value={formatNumber(active.volunteers, lang)}
            icon={<Info className="size-3.5" />}
          />
        </div>

        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[9.5px] text-charcoal/45">
            <span>{t("معدل الاستقرار", "Stability rate")}</span>
            <span className="font-bold" style={{ color: STATUS_META[active.status].color }}>
              {formatNumber(active.trees ? Math.round((active.alive / active.trees) * 100) : 0, lang)}%
            </span>
          </div>
          <Progress value={active.trees ? (active.alive / active.trees) * 100 : 0} color={STATUS_META[active.status].color} />
          <p className="mt-2 text-[9px] text-charcoal/40">
            {active.adminName
              ? t(`المسؤول: ${active.adminName}`, `Admin: ${active.adminName}`)
              : t("لم يُعيَّن أدمن بلدية بعد.", "No municipality admin assigned yet.")}
          </p>
        </div>
      </div>
    </section>
  );
}
