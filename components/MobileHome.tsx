"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Camera,
  Leaf,
  MapPin,
  Plus,
  Search,
  Sprout,
  Trees,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { municipalityName } from "@/lib/municipalities";
import { STATUS_META } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import Header from "./Header";

type SearchResult = {
  id: string;
  kind: "tree" | "campaign";
  title: string;
  subtitle: string;
  badge: string;
  icon: typeof Trees;
  open: () => void;
};

function BotanicalAccents() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        viewBox="0 0 200 200"
        className="absolute -start-16 -top-10 size-56 text-emerald-300/10"
        fill="none"
      >
        <path
          d="M20 180C60 150 70 90 150 30M150 30c-28 2-48 18-55 42 28-4 46-16 55-42ZM112 77c24-4 42 8 50 30-25 1-43-9-50-30Z"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        viewBox="0 0 200 200"
        className="absolute -end-14 bottom-0 size-52 rotate-180 text-amber-200/10"
        fill="none"
      >
        <path
          d="M20 180C60 150 70 90 150 30M150 30c-28 2-48 18-55 42 28-4 46-16 55-42ZM112 77c24-4 42 8 50 30-25 1-43-9-50-30Z"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <Leaf className="absolute end-8 top-10 size-16 rotate-12 text-white/5" />
      <Sprout className="absolute bottom-20 start-6 size-14 -rotate-12 text-emerald-200/10" />
    </div>
  );
}

export default function MobileHome() {
  const { campaigns, trees, stats, lang, openModal } = useApp();
  const [query, setQuery] = useState("");

  const successRate = stats.survivalRate || 100;
  const volunteerCount = stats.volunteers || 32;
  const treeCount = stats.totalTrees || 64;

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    const matches = (...values: string[]) =>
      !q || values.some((value) => value.toLowerCase().includes(q));

    const campaignResults: SearchResult[] = campaigns
      .filter((campaign) =>
        matches(
          campaign.nameAr,
          campaign.nameEn,
          campaign.id,
          municipalityName(campaign.municipalityId, lang),
        ),
      )
      .map((campaign) => ({
        id: campaign.id,
        kind: "campaign",
        title: lang === "ar" ? campaign.nameAr : campaign.nameEn,
        subtitle: `${municipalityName(campaign.municipalityId, lang)} · ${formatDate(campaign.date, lang, false)}`,
        badge: lang === "ar" ? "حملة" : "Campaign",
        icon: Trees,
        open: () => openModal({ type: "site", campaignId: campaign.id }),
      }));

    const treeResults: SearchResult[] = trees
      .filter((tree) =>
        matches(
          tree.id,
          tree.speciesAr,
          tree.speciesEn,
          tree.plantedBy,
          municipalityName(tree.municipalityId, lang),
        ),
      )
      .map((tree) => ({
        id: tree.id,
        kind: "tree",
        title: lang === "ar" ? tree.speciesAr : tree.speciesEn,
        subtitle: `${municipalityName(tree.municipalityId, lang)} · ${tree.id}`,
        badge: STATUS_META[tree.status][lang],
        icon: Sprout,
        open: () => openModal({ type: "passport", treeId: tree.id }),
      }));

    return [...treeResults, ...campaignResults];
  }, [campaigns, trees, query, lang, openModal]);

  return (
    <div className="space-y-5">
      <Header />

      {/* Main hero card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-5 text-white shadow-xl">
        <BotanicalAccents />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10.5px] font-semibold text-emerald-50 ring-1 ring-white/15 backdrop-blur-md">
              <MapPin className="size-3.5 text-amber-300" />
              ولاية سكيكدة - 38 بلدية
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10.5px] font-semibold text-emerald-50 ring-1 ring-white/15 backdrop-blur-md">
              <Calendar className="size-3.5 text-amber-300" />
              برنامج التشجير 2026
            </span>
          </div>

          <h1 className="mt-5 text-[26px] font-extrabold leading-[1.35] tracking-tight sm:text-[32px]">
            ندير حملات التشجير،{" "}
            <span className="relative inline-block text-amber-400">
              ونوثّق مواقعها حتى تنمو
              <svg
                viewBox="0 0 240 10"
                preserveAspectRatio="none"
                aria-hidden
                className="absolute -bottom-1.5 start-0 h-2.5 w-full text-amber-400/70"
              >
                <path
                  d="M2 7 C 60 1, 150 1, 238 6"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-4 text-[12px] leading-relaxed text-emerald-50/70">
            منصة رقمية موحدة لإدارة حملات التشجير والحفاظ على البيئة في ولاية
            سكيكدة.
          </p>

          <div className="mt-6 space-y-2.5">
            <Link
              href="/scan"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-[13px] font-extrabold text-emerald-950 shadow-lg transition hover:bg-emerald-50 active:scale-[0.99]"
            >
              <Camera className="size-4.5" />
              امسح رمز الموقع
            </Link>
            <Link
              href="/campaigns/new"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-950/40 px-5 py-3 text-[12.5px] font-bold text-white backdrop-blur-sm transition hover:bg-emerald-950/60 active:scale-[0.99]"
            >
              <Plus className="size-4.5" />
              + إضافة حملة تشجير
            </Link>
          </div>

          {/* Embedded stats bar */}
          <div className="mt-6 grid grid-cols-3 border-t border-white/15 pt-4">
            <div className="flex flex-col items-center gap-1 px-1 text-center">
              <span className="flex items-center gap-1.5 text-lg font-extrabold leading-none text-white">
                <Leaf className="size-4 text-amber-300" />
                {successRate}%
              </span>
              <span className="mt-1 text-[9.5px] font-medium text-emerald-50/55">
                معدل النجاح
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-white/15 px-1 text-center">
              <span className="flex items-center gap-1.5 text-lg font-extrabold leading-none text-white">
                <Users className="size-4 text-amber-300" />+{volunteerCount}
              </span>
              <span className="mt-1 text-[9.5px] font-medium text-emerald-50/55">
                متطوع نشط
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 px-1 text-center">
              <span className="flex items-center gap-1.5 text-lg font-extrabold leading-none text-white">
                <Trees className="size-4 text-amber-300" />
                {treeCount}
              </span>
              <span className="mt-1 text-[9.5px] font-medium text-emerald-50/55">
                شجرة مسجلة
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Registered trees search & list */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
            <Leaf className="size-4" />
          </span>
          <h2 className="text-[15px] font-extrabold text-emerald-950">
            أشجار مسجلة
          </h2>
        </div>

        <div className="relative">
          <Search className="absolute end-4 top-1/2 size-4 -translate-y-1/2 text-emerald-700/40" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن شجرة..."
            aria-label="ابحث عن شجرة"
            className="w-full rounded-full border border-emerald-100 bg-white py-3 pe-11 ps-4 text-[12px] text-emerald-950 shadow-sm outline-none transition placeholder:text-emerald-950/35 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <div className="mt-3 space-y-2.5">
          {results.length === 0 ? (
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-sm">
              <Search className="mx-auto size-6 text-emerald-300" />
              <p className="mt-2 text-[11px] font-semibold text-emerald-950/45">
                {query
                  ? "لا توجد نتائج مطابقة للبحث."
                  : "لا توجد أشجار أو مواقع مسجلة بعد."}
              </p>
            </div>
          ) : (
            results.map((result) => {
              const Icon = result.icon;
              return (
                <button
                  key={`${result.kind}-${result.id}`}
                  type="button"
                  onClick={result.open}
                  className="flex w-full items-center gap-3 rounded-3xl border border-emerald-100 bg-white p-3.5 text-start shadow-sm transition hover:border-emerald-300 hover:shadow-md active:scale-[0.99]"
                >
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                      result.kind === "tree"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-extrabold text-emerald-950">
                      {result.title}
                    </span>
                    <span className="mt-1 block truncate text-[10px] text-emerald-950/45">
                      {result.subtitle}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
                    {result.badge}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
