"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Map as MapIcon,
  MapPin,
  QrCode,
  Search,
  Trees,
  X,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { municipalityName } from "@/lib/municipalities";
import { formatDate } from "@/lib/utils";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="grid size-full place-items-center bg-emerald-50">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700/70">
        <MapIcon className="size-4 animate-pulse" />
        جارٍ تحميل خريطة ولاية سكيكدة…
      </div>
    </div>
  ),
});

export default function MobileMapView() {
  const {
    lang,
    trees,
    campaigns,
    municipalities,
    activeMunicipality,
    setActiveMunicipality,
    openModal,
  } = useApp();
  const [query, setQuery] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null,
  );

  const visibleCampaigns = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      const inMunicipality =
        !activeMunicipality || campaign.municipalityId === activeMunicipality;
      const matchesQuery =
        !q ||
        campaign.nameAr.includes(q) ||
        campaign.nameEn.toLowerCase().includes(q) ||
        municipalityName(campaign.municipalityId, lang)
          .toLowerCase()
          .includes(q);
      return inMunicipality && matchesQuery;
    });
  }, [campaigns, query, activeMunicipality, lang]);

  const visibleTrees = useMemo(
    () =>
      trees.filter(
        (tree) =>
          !activeMunicipality || tree.municipalityId === activeMunicipality,
      ),
    [trees, activeMunicipality],
  );

  const selected = campaigns.find((campaign) => campaign.id === selectedCampaignId);
  const selectedTreeCount = selected
    ? trees.filter((tree) => tree.campaignId === selected.id).length ||
      selected.planted
    : 0;
  const hectares = selected?.areaSqm
    ? (selected.areaSqm / 10_000).toFixed(2)
    : "—";

  return (
    <div className="relative h-[calc(100vh-5rem)] min-h-[520px] overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50 shadow-sm">
      <LeafletMap
        municipalities={municipalities}
        trees={visibleTrees}
        campaigns={visibleCampaigns}
        activeMunicipality={activeMunicipality}
        onSelectMunicipality={(id) => setActiveMunicipality(id)}
        onSelectTree={(treeId) => openModal({ type: "passport", treeId })}
        onSelectCampaign={(campaignId) => setSelectedCampaignId(campaignId)}
      />

      {/* Floating search + municipality filter */}
      <div className="absolute inset-x-3 top-3 z-[500] rounded-3xl border border-white/70 bg-white/90 p-3 shadow-lg backdrop-blur-md">
        <div className="relative">
          <Search className="absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-emerald-700/40" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن موقع أو حملة..."
            aria-label="ابحث عن موقع أو حملة"
            className="w-full rounded-full border border-emerald-100 bg-white py-2.5 pe-10 ps-4 text-[11.5px] text-emerald-950 shadow-sm outline-none placeholder:text-emerald-950/35 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <label className="flex flex-1 items-center gap-1.5 text-[10px] font-bold text-emerald-800">
            <MapPin className="size-3.5" />
            <select
              value={activeMunicipality ?? ""}
              onChange={(event) =>
                setActiveMunicipality(event.target.value || null)
              }
              aria-label="فلترة حسب البلدية"
              className="min-w-0 flex-1 rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-[10.5px] font-semibold text-emerald-950 outline-none focus:border-emerald-400"
            >
              <option value="">38 بلدية — كل الولاية</option>
              {municipalities.map((municipality) => (
                <option key={municipality.id} value={municipality.id}>
                  {lang === "ar" ? municipality.nameAr : municipality.nameEn}
                </option>
              ))}
            </select>
          </label>
          <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[9.5px] font-bold text-emerald-700">
            {visibleCampaigns.length} موقع
          </span>
        </div>
      </div>

      {/* Bottom slide-up site summary */}
      {selected && (
        <div className="absolute inset-x-3 bottom-24 z-[500] rounded-3xl border border-emerald-100 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(6,78,59,0.12)] backdrop-blur-md animate-fade-up">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white">
              <Trees className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-extrabold text-emerald-950">
                {lang === "ar" ? selected.nameAr : selected.nameEn}
              </p>
              <p className="mt-1 truncate text-[10px] text-emerald-950/45">
                {municipalityName(selected.municipalityId, lang)} ·{" "}
                {formatDate(selected.date, lang, false)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCampaignId(null)}
              aria-label="إغلاق البطاقة"
              className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-emerald-50/70 px-3 py-2">
              <p className="text-[9px] text-emerald-950/45">عدد الأشجار</p>
              <p className="text-[13px] font-extrabold text-emerald-800">
                {selectedTreeCount}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-3 py-2">
              <p className="text-[9px] text-amber-800/60">المساحة</p>
              <p className="text-[13px] font-extrabold text-amber-800">
                {hectares} هكتار
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => openModal({ type: "site", campaignId: selected.id })}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-800 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-emerald-900"
            >
              <BookOpen className="size-3.5" />
              عرض التفاصيل
            </button>
            <Link
              href="/scan"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-2 text-[11px] font-bold text-emerald-800 transition hover:bg-emerald-50"
            >
              <QrCode className="size-3.5" />
              مسح QR
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
