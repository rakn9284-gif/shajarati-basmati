"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  FileDown,
  Leaf,
  MapPin,
  PieChart,
  Printer,
  Search,
  ShieldCheck,
  Sprout,
  TrendingUp,
  TreePine,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { monthlyPlanting, speciesDistribution, STATUS_META } from "@/lib/data";
import { STATUS_COLORS } from "@/lib/municipalities";
import type { MunicipalityStatus } from "@/lib/types";
import { downloadCSV, formatNumber } from "@/lib/utils";
import {
  Badge,
  Progress,
  SectionHeading,
  StatusPill,
} from "./ui";

const STATUS_ORDER: MunicipalityStatus[] = [
  "stable",
  "monitoring",
  "risk",
  "critical",
];

export default function Reports() {
  const {
    t,
    lang,
    user,
    stats,
    trees,
    municipalities,
    notify,
    setView,
    setActiveMunicipality,
  } = useApp();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | MunicipalityStatus>("all");

  const scope =
    user && user.role !== "state_admin" && user.municipalityId
      ? municipalities.find((m) => m.id === user.municipalityId) ?? null
      : null;

  // Municipal scope admins see only their municipality's rows
  const scoped = useMemo(
    () =>
      scope
        ? [scope]
        : user?.role === "municipality_admin" && user.municipalityId
          ? municipalities.filter((m) => m.id === user.municipalityId)
          : municipalities,
    [scope, user, municipalities],
  );

  const scopedTrees = useMemo(
    () =>
      !user || user.role === "state_admin"
        ? trees
        : trees.filter((tr) => tr.municipalityId === user.municipalityId),
    [trees, user],
  );

  const MONTHLY_PLANTING = monthlyPlanting(scopedTrees);
  const SPECIES_DISTRIBUTION = speciesDistribution(scopedTrees);

  const totals = scope
    ? {
        trees: scope.trees,
        planted: scope.planted,
        alive: scope.alive,
        needsAttention: scope.needsAttention,
        volunteers: scope.volunteers,
      }
    : {
        trees: stats.totalTrees,
        planted: stats.planted,
        alive: stats.alive,
        needsAttention: stats.needsAttention,
        volunteers: stats.volunteers,
      };

  const survivalRate = totals.trees
    ? Math.round((totals.alive / totals.trees) * 100)
    : 0;
  const plantedRate = totals.trees
    ? Math.round((totals.planted / totals.trees) * 100)
    : 0;
  const attentionRate = totals.trees
    ? Math.round((totals.needsAttention / totals.trees) * 100)
    : 0;

  const statusCounts = useMemo(() => {
    return STATUS_ORDER.reduce<Record<MunicipalityStatus, number>>(
      (acc, key) => {
        acc[key] = scoped.filter((m) => m.status === key).length;
        return acc;
      },
      { stable: 0, monitoring: 0, risk: 0, critical: 0 },
    );
  }, [scoped]);

  const maxMonthly = Math.max(1, ...MONTHLY_PLANTING.map((m) => m.value));
  const monthlyTotal = MONTHLY_PLANTING.reduce((sum, m) => sum + m.value, 0);

  const speciesTotal = SPECIES_DISTRIBUTION.reduce(
    (sum, s) => sum + s.value,
    0,
  ) || 1;

  const topMunicipalities = useMemo(
    () => [...scoped].sort((a, b) => b.trees - a.trees).slice(0, 6),
    [scoped],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoped.filter((m) => {
      const matchesQuery =
        !q ||
        m.nameAr.includes(query.trim()) ||
        m.nameEn.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.adminName.includes(query.trim());
      const matchesStatus = status === "all" || m.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [scoped, query, status]);

  const exportCSV = () => {
    const rows: Array<Array<string | number>> = [
      [
        "Code",
        "Municipality AR",
        "Municipality EN",
        "Registered",
        "Planted",
        "Alive",
        "Needs attention",
        "Volunteers",
        "Survival %",
        "Status",
        "Admin",
      ],
      ...filtered.map((m) => [
        m.code,
        m.nameAr,
        m.nameEn,
        m.trees,
        m.planted,
        m.alive,
        m.needsAttention,
        m.volunteers,
        Math.round((m.alive / m.trees) * 100),
        STATUS_META[m.status].en,
        m.adminName,
      ]),
    ];
    downloadCSV("shajarati-reports-skikda.csv", rows);
    notify(
      "تم تصدير التقرير بصيغة CSV.",
      "The report has been exported as CSV.",
    );
  };

  const summary = [
    {
      label: t("أشجار مسجلة", "Registered trees"),
      value: totals.trees,
      sub: t("في السجل الرقمي", "in the digital registry"),
      icon: TreePine,
      color: "#123B2A",
      bg: "#E4F4EA",
      trend: "+12%",
      up: true,
    },
    {
      label: t("أشجار مغروسة", "Planted trees"),
      value: totals.planted,
      sub: `${plantedRate}% ${t("من المسجل", "of registered")}`,
      icon: Sprout,
      color: "#16865B",
      bg: "#DDF2E8",
      trend: "+8%",
      up: true,
    },
    {
      label: t("أشجار حية مؤكدة", "Verified alive"),
      value: totals.alive,
      sub: `${survivalRate}% ${t("معدل البقاء", "survival rate")}`,
      icon: ShieldCheck,
      color: "#0F6B47",
      bg: "#DDF2E8",
      trend: `+${survivalRate}%`,
      up: true,
    },
    {
      label: t("بحاجة لعناية", "Needs attention"),
      value: totals.needsAttention,
      sub: `${attentionRate}% ${t("من المسجل", "of registered")}`,
      icon: TriangleAlert,
      color: "#C96A1E",
      bg: "#FDEEE2",
      trend: "-4",
      up: false,
    },
  ];

  return (
    <div
      id="print-area"
      className="space-y-5"
    >
      {/* Header */}
      <section className="card-surface overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-br from-forest via-forest-700 to-brand-dark p-5 text-white sm:p-7">
          <div className="hero-pattern pointer-events-none absolute inset-0 opacity-50" />
          <div className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-mint/15 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-mint/60">
                <BarChart3 className="size-3.5" />
                {t("مركز التقارير", "REPORTING CENTRE")}
              </p>
              <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-[32px]">
                {t("تقارير الغطاء النباتي", "Vegetation reports")}
              </h1>
              <p className="mt-1.5 max-w-2xl text-[12px] leading-relaxed text-white/55">
                {t(
                  "مؤشرات الغرس والبقاء والعناية، موزّعة على البلديات والأصناف والأشهر — بيانات قابلة للتصدير والطباعة.",
                  "Planting, survival and care indicators by municipality, species and month — ready to export and print.",
                )}
              </p>
            </div>
            <div className="no-print flex flex-wrap items-center gap-2">
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-[11px] font-semibold text-white transition hover:bg-white/20"
              >
                <Download className="size-3.5" />
                {t("تصدير CSV", "Export CSV")}
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-full bg-mint px-4 py-2.5 text-[11px] font-bold text-forest transition hover:bg-white"
              >
                <Printer className="size-3.5" />
                {t("طباعة / PDF", "Print / PDF")}
              </button>
            </div>
          </div>

          <div className="relative mt-4 flex flex-wrap items-center gap-2">
            <Badge tone="white">
              {scope
                ? `${lang === "ar" ? scope.nameAr : scope.nameEn} · ${scope.code}`
                : t("كل بلديات الولاية · 38", "All 38 municipalities")}
            </Badge>
            <Badge tone="white">
              {t("آخر تحديث: أكتوبر 2026", "Updated: October 2026")}
            </Badge>
            {user?.role === "state_admin" && (
              <Badge tone="white">
                {t("صلاحية أدمن الولاية", "State admin access")}
              </Badge>
            )}
          </div>
        </div>
      </section>

      {scope && (
        <div className="no-print flex items-start gap-2 rounded-2xl border border-brand/15 bg-mint-soft/60 px-4 py-3 text-[10.5px] leading-relaxed text-brand-dark/75">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          {t(
            `تقريرك مقيّد ببلدية ${scope.nameAr}. يرى أدمن الولاية مؤشرات البلديات الثماني والثلاثين كاملة.`,
            `Your report is scoped to ${scope.nameEn}. The state admin sees indicators for all 38 municipalities.`,
          )}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="card-surface p-4 transition hover:-translate-y-0.5 sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold text-charcoal/50">
                    {card.label}
                  </p>
                  <p className="mt-2 font-display text-[27px] font-extrabold leading-none tracking-tight text-forest sm:text-[30px]">
                    {formatNumber(card.value, lang)}
                  </p>
                  <p className="mt-1.5 text-[10px] text-charcoal/40">
                    {card.sub}
                  </p>
                </div>
                <span
                  className="grid size-10 place-items-center rounded-2xl"
                  style={{ backgroundColor: card.bg, color: card.color }}
                >
                  <Icon className="size-5" />
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1 rounded-full bg-cream px-2 py-1 text-[10px] font-semibold text-charcoal/55">
                {card.up ? (
                  <ArrowUpRight className="size-3 text-brand" />
                ) : (
                  <ArrowDownRight className="size-3 text-[#C96A1E]" />
                )}
                <span className={card.up ? "text-brand" : "text-[#C96A1E]"}>
                  {card.trend}
                </span>
                {t("هذا الشهر", "this month")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Monthly planting */}
        <section className="card-surface p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
                <TrendingUp className="size-3.5" />
                {t("الغرس الشهري", "MONTHLY PLANTING")}
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-forest">
                {t("أشجار مغروسة خلال 2026", "Trees planted through 2026")}
              </h2>
            </div>
            <div className="text-end">
              <p className="font-display text-xl font-extrabold text-forest">
                {formatNumber(monthlyTotal, lang)}
              </p>
              <p className="text-[9px] text-charcoal/40">
                {t("شجرة موثقة", "documented trees")}
              </p>
            </div>
          </div>

          <div className="mt-5 flex h-[190px] items-end gap-1.5 sm:gap-2.5">
            {MONTHLY_PLANTING.map((month, i) => {
              const height = Math.max(6, (month.value / maxMonthly) * 100);
              const isPeak = month.value === maxMonthly;
              return (
                <div
                  key={month.en}
                  className="group flex h-full min-w-0 flex-1 flex-col justify-end"
                  title={`${lang === "ar" ? month.ar : month.en}: ${month.value}`}
                >
                  <div className="relative flex flex-1 items-end">
                    <div
                      className="animate-grow-bar w-full rounded-t-lg transition group-hover:opacity-90"
                      style={{
                        height: `${height}%`,
                        background: isPeak
                          ? "linear-gradient(180deg, #16865B, #123B2A)"
                          : "linear-gradient(180deg, #B8E6CE, #4FA97A)",
                        animationDelay: `${i * 45}ms`,
                      }}
                    />
                    <span className="absolute inset-x-0 -top-5 hidden text-center text-[9px] font-bold text-forest group-hover:block">
                      {month.value}
                    </span>
                  </div>
                  <span className="mt-2 block truncate text-center text-[8.5px] font-semibold text-charcoal/45 sm:text-[9.5px]">
                    {lang === "ar" ? month.ar : month.en}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3 text-[9.5px] text-charcoal/40">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-brand" />
              {t("ذروة الغرس: أكتوبر ونوفمبر", "Peak planting: October & November")}
            </span>
            <span className="flex items-center gap-1.5">
              <Leaf className="size-3.5 text-brand" />
              {t("موسم الغرس الخريفي", "Autumn planting season")}
            </span>
          </div>
        </section>

        {/* Species donut */}
        <section className="card-surface p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
                <PieChart className="size-3.5" />
                {t("توزيع الأصناف", "SPECIES MIX")}
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-forest">
                {t("الأنواع المزروعة", "Planted species")}
              </h2>
            </div>
            <Badge tone="mint">
              {SPECIES_DISTRIBUTION.length} {t("أصناف", "types")}
            </Badge>
          </div>

          <div className="mt-3 flex justify-center">
            <div className="relative w-full max-w-[220px]">
              <svg
                viewBox="0 0 42 42"
                className="h-auto w-full max-w-full max-h-[400px] object-contain"
                role="img"
                aria-label={t("توزيع أصناف الأشجار", "Tree species distribution")}
              >
                <circle
                  cx="21"
                  cy="21"
                  r="15.9155"
                  fill="none"
                  stroke="#EDF1E8"
                  strokeWidth="6"
                />
                {(() => {
                  let cumulative = 0;
                  return SPECIES_DISTRIBUTION.map((species) => {
                    const dash = (species.value / speciesTotal) * 100;
                    const offset = -cumulative;
                    cumulative += dash;
                    return (
                      <circle
                        key={species.en}
                        cx="21"
                        cy="21"
                        r="15.9155"
                        fill="none"
                        stroke={species.color}
                        strokeWidth="6"
                        strokeDasharray={`${dash} ${100 - dash}`}
                        strokeDashoffset={offset}
                        pathLength={100}
                        transform="rotate(-90 21 21)"
                      />
                    );
                  });
                })()}
                <text
                  x="21"
                  y="19.5"
                  textAnchor="middle"
                  fontSize="4.4"
                  fontWeight="800"
                  fill="#123B2A"
                >
                  {totals.trees > 999
                    ? `${(totals.trees / 1000).toFixed(1)}k`
                    : totals.trees}
                </text>
                <text
                  x="21"
                  y="24"
                  textAnchor="middle"
                  fontSize="2.2"
                  fill="#202B25"
                  opacity="0.5"
                >
                  {t("شجرة", "trees")}
                </text>
              </svg>
            </div>
          </div>

          <div className="mt-2 space-y-1.5">
            {SPECIES_DISTRIBUTION.map((species) => (
              <div
                key={species.en}
                className="flex items-center gap-2 text-[10px]"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: species.color }}
                />
                <span className="min-w-0 flex-1 truncate text-charcoal/60">
                  {lang === "ar" ? species.ar : species.en}
                </span>
                <span className="font-bold text-forest">{species.value}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Status + top municipalities */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card-surface p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
                <CheckCircle2 className="size-3.5" />
                {t("حالة البلديات", "MUNICIPALITY STATUS")}
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-forest">
                {t("توزيع الحالات", "Status distribution")}
              </h2>
            </div>
            <Badge tone="neutral">
              {scoped.length} {t("بلدية", "municipalities")}
            </Badge>
          </div>

          <div className="mt-4 space-y-3.5">
            {STATUS_ORDER.map((key) => {
              const meta = STATUS_META[key];
              const count = statusCounts[key];
              const percent = scoped.length
                ? Math.round((count / scoped.length) * 100)
                : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="flex items-center gap-1.5 font-semibold text-charcoal/65">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[key] }}
                      />
                      {lang === "ar" ? meta.ar : meta.en}
                    </span>
                    <span className="text-charcoal/45">
                      {count} ·{" "}
                      <span className="font-bold text-forest">{percent}%</span>
                    </span>
                  </div>
                  <Progress
                    value={percent}
                    color={STATUS_COLORS[key]}
                    className="mt-1.5 h-1.5"
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[#FBF2DC]/70 px-3 py-2.5 text-[9.5px] leading-relaxed text-[#8A6516]">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
            {t(
              "الحالات الحرجة تُصعّد تلقائياً إلى أدمن الولاية للمتابعة.",
              "Critical cases are automatically escalated to the state admin.",
            )}
          </div>
        </section>

        <section className="card-surface p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
                <TreePine className="size-3.5" />
                {t("الأكثر تشجيراً", "TOP PLANTING")}
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-forest">
                {t("البلديات الرائدة", "Leading municipalities")}
              </h2>
            </div>
            <button
              onClick={() => setView("municipalities")}
              className="no-print inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline"
            >
              {t("الدليل الكامل", "Full directory")}
              <ArrowUpRight className="size-3" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {topMunicipalities.map((m, i) => {
              const meta = STATUS_META[m.status];
              const aliveRate = Math.round((m.alive / m.trees) * 100);
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveMunicipality(m.id);
                    setView("municipalities");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-2xl p-1.5 text-start transition hover:bg-cream/70"
                >
                  <span
                    className="grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: meta.bg, color: meta.color }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[11px] font-bold text-forest">
                        {lang === "ar" ? m.nameAr : m.nameEn}
                      </span>
                      <span className="shrink-0 text-[10px] font-bold text-brand">
                        {formatNumber(m.trees, lang)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Progress
                        value={aliveRate}
                        color={STATUS_COLORS[m.status]}
                        className="h-1.5 flex-1"
                      />
                      <span className="shrink-0 text-[8.5px] text-charcoal/40">
                        {aliveRate}% {t("حية", "alive")}
                      </span>
                    </div>
                  </div>
                  <StatusPill status={m.status} lang={lang} />
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Full table */}
      <section className="card-surface overflow-hidden">
        <div className="border-b border-line/70 px-5 py-4 sm:px-6">
          <SectionHeading
            eyebrow={t("السجل الكامل", "FULL REGISTRY")}
            title={t("تقرير البلديات التفصيلي", "Detailed municipality report")}
            subtitle={t(
              "كل المؤشرات في جدول واحد — ابحث، رشّح، ثم صدّر أو اطبع.",
              "All indicators in one table — search, filter, then export or print.",
            )}
          />
          <div className="no-print mt-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[210px] flex-1">
              <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-charcoal/30" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(
                  "ابحث عن بلدية، رمز أو أدمن…",
                  "Search municipality, code or admin…",
                )}
                className="w-full rounded-2xl border border-line bg-white py-2.5 pe-3.5 ps-10 text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setStatus("all")}
                className={`rounded-full border px-3 py-2 text-[10px] font-semibold transition ${
                  status === "all"
                    ? "border-forest bg-forest text-white"
                    : "border-line bg-white text-charcoal/50 hover:border-brand/30"
                }`}
              >
                {t("الكل", "All")}
              </button>
              {STATUS_ORDER.map((key) => (
                <button
                  key={key}
                  onClick={() => setStatus(key)}
                  className={`rounded-full border px-3 py-2 text-[10px] font-semibold transition ${
                    status === key
                      ? "border-forest bg-forest text-white"
                      : "border-line bg-white text-charcoal/50 hover:border-brand/30"
                  }`}
                >
                  {lang === "ar" ? STATUS_META[key].ar : STATUS_META[key].en}
                </button>
              ))}
            </div>
            <span className="text-[9.5px] text-charcoal/40">
              {filtered.length} / {scoped.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-start">
            <thead>
              <tr className="bg-cream/80 text-[9px] font-bold uppercase tracking-wide text-charcoal/45">
                <th className="px-4 py-3 text-start">{t("الرمز", "Code")}</th>
                <th className="px-3 py-3 text-start">{t("البلدية", "Municipality")}</th>
                <th className="px-3 py-3 text-end">{t("مسجلة", "Registered")}</th>
                <th className="px-3 py-3 text-end">{t("مغروسة", "Planted")}</th>
                <th className="px-3 py-3 text-end">{t("حية", "Alive")}</th>
                <th className="px-3 py-3 text-end">{t("عناية", "Attention")}</th>
                <th className="px-3 py-3 text-end">{t("متطوعون", "Volunteers")}</th>
                <th className="px-3 py-3 text-end">{t("البقاء", "Survival")}</th>
                <th className="px-4 py-3 text-start">{t("الحالة", "Status")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const aliveRate = Math.round((m.alive / m.trees) * 100);
                return (
                  <tr
                    key={m.id}
                    className="border-t border-line/60 text-[10.5px] transition hover:bg-cream/50"
                  >
                    <td className="px-4 py-2.5">
                      <span className="rounded-md bg-cream px-1.5 py-0.5 font-mono text-[9px] font-bold text-charcoal/50">
                        {m.code}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-forest">
                        {lang === "ar" ? m.nameAr : m.nameEn}
                      </p>
                      <p className="text-[8.5px] text-charcoal/35">
                        {m.adminName}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 text-end font-bold text-forest">
                      {formatNumber(m.trees, lang)}
                    </td>
                    <td className="px-3 py-2.5 text-end text-charcoal/60">
                      {formatNumber(m.planted, lang)}
                    </td>
                    <td className="px-3 py-2.5 text-end text-charcoal/60">
                      {formatNumber(m.alive, lang)}
                    </td>
                    <td className="px-3 py-2.5 text-end">
                      <span
                        className={
                          m.needsAttention > 2
                            ? "font-bold text-[#C96A1E]"
                            : "text-charcoal/60"
                        }
                      >
                        {formatNumber(m.needsAttention, lang)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-end text-charcoal/60">
                      {formatNumber(m.volunteers, lang)}
                    </td>
                    <td className="px-3 py-2.5 text-end">
                      <span className="font-bold text-brand">{aliveRate}%</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusPill status={m.status} lang={lang} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-forest/20 bg-mint-soft/40 text-[10.5px] font-bold text-forest">
                <td className="px-4 py-3" colSpan={2}>
                  {t("الإجمالي", "Total")}
                </td>
                <td className="px-3 py-3 text-end">
                  {formatNumber(
                    filtered.reduce((sum, m) => sum + m.trees, 0),
                    lang,
                  )}
                </td>
                <td className="px-3 py-3 text-end">
                  {formatNumber(
                    filtered.reduce((sum, m) => sum + m.planted, 0),
                    lang,
                  )}
                </td>
                <td className="px-3 py-3 text-end">
                  {formatNumber(
                    filtered.reduce((sum, m) => sum + m.alive, 0),
                    lang,
                  )}
                </td>
                <td className="px-3 py-3 text-end">
                  {formatNumber(
                    filtered.reduce((sum, m) => sum + m.needsAttention, 0),
                    lang,
                  )}
                </td>
                <td className="px-3 py-3 text-end">
                  {formatNumber(
                    filtered.reduce((sum, m) => sum + m.volunteers, 0),
                    lang,
                  )}
                </td>
                <td className="px-3 py-3 text-end">
                  {Math.round(
                    (filtered.reduce((sum, m) => sum + m.alive, 0) /
                      Math.max(
                        1,
                        filtered.reduce((sum, m) => sum + m.trees, 0),
                      )) *
                      100,
                  )}
                  %
                </td>
                <td className="px-4 py-3">
                  <Badge tone="mint">{scoped.length} {t("بلدية", "munis")}</Badge>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center">
            <Users className="mx-auto size-7 text-charcoal/20" />
            <p className="mt-2 text-[11px] font-semibold text-charcoal/45">
              {t("لا توجد نتائج مطابقة.", "No matching results.")}
            </p>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line/70 bg-white px-4 py-3 text-[9.5px] text-charcoal/40">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-brand" />
          {t(
            "بيانات موثّقة في سجل ولاية سكيكدة · أكتوبر 2026",
            "Verified in the Skikda wilaya registry · October 2026",
          )}
        </span>
        <span className="no-print flex items-center gap-1.5">
          <FileDown className="size-3.5 text-brand" />
          {t(
            "يمكن تصدير هذا التقرير بصيغة CSV أو طباعته كملف PDF.",
            "Export this report as CSV or print it as a PDF.",
          )}
        </span>
      </div>
    </div>
  );
}
