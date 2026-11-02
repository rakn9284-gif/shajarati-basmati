"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  Droplets,
  Grid3X3,
  MapPin,
  Plus,
  Printer,
  Search,
  Sprout,
  TreePine,
  Users,
  X,
} from "lucide-react";
import { useApp } from "@/lib/store";
import {
  STATUS_COLORS,
} from "@/lib/municipalities";
import { STATUS_META } from "@/lib/data";
import {
  downloadCSV,
  formatDate,
  formatNumber,
  formatShortDate,
} from "@/lib/utils";
import {
  Badge,
  EmptyState,
  MiniMetric,
  Progress,
  SectionHeading,
  StatusPill,
} from "./ui";

const STATUS_FILTERS = [
  { id: "all", ar: "الكل", en: "All" },
  { id: "stable", ar: "مستقرة", en: "Stable" },
  { id: "monitoring", ar: "تحت المراقبة", en: "Monitoring" },
  { id: "risk", ar: "في خطر", en: "At risk" },
  { id: "critical", ar: "حرجة", en: "Critical" },
] as const;

export default function Municipalities() {
  const {
    t,
    lang,
    user,
    trees,
    campaigns,
    municipalities,
    openModal,
    activeMunicipality,
    setActiveMunicipality,
    notify,
    stats,
  } = useApp();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]["id"]>("all");
  const [sort, setSort] = useState<"trees" | "name" | "attention">("trees");

  const active = activeMunicipality
    ? municipalities.find((m) => m.id === activeMunicipality) ?? null
    : null;
  const activeTrees = active
    ? trees.filter((tr) => tr.municipalityId === active.id)
    : [];
  const activeCampaign = active
    ? campaigns.find((c) => c.municipalityId === active.id)
    : null;

  const filtered = useMemo(() => {
    const list = municipalities.filter((m) => {
      const matchesQuery =
        !query.trim() ||
        m.nameAr.includes(query.trim()) ||
        m.nameEn.toLowerCase().includes(query.trim().toLowerCase()) ||
        m.code.toLowerCase().includes(query.trim().toLowerCase()) ||
        m.adminName.includes(query.trim());
      const matchesStatus = status === "all" || m.status === status;
      return matchesQuery && matchesStatus;
    });
    return [...list].sort((a, b) => {
      if (sort === "name") return a.nameAr.localeCompare(b.nameAr, "ar");
      if (sort === "attention") return b.needsAttention - a.needsAttention;
      return b.trees - a.trees;
    });
  }, [query, status, sort]);

  const canManage =
    !!user &&
    !!active &&
    (user.role === "state_admin" ||
      (user.role === "municipality_admin" && user.municipalityId === active.id));

  const newCampaign = () => {
    if (!user) {
      openModal({ type: "auth", mode: "login" });
      return;
    }
    if (user.role === "volunteer") {
      notify(
        "إنشاء الحملات متاح لأدمن البلدية والولاية.",
        "Campaign creation is reserved for municipality and state admins.",
        "info",
      );
      openModal({ type: "auth", mode: "login" });
      return;
    }
    if (active) setActiveMunicipality(active.id);
    openModal({ type: "campaign" });
  };

  const printCampaign = () => {
    if (activeCampaign) {
      openModal({ type: "print", campaignId: activeCampaign.id });
    } else {
      notify(
        "لا توجد حملة مطبوعة لهذه البلدية بعد. أنشئ حملة أولاً.",
        "No campaign to print for this municipality yet. Create one first.",
        "info",
      );
    }
  };

  const exportCSV = () => {
    const rows: Array<Array<string | number>> = [
      [
        "Code",
        "Municipality AR",
        "Municipality EN",
        "Trees",
        "Planted",
        "Alive",
        "Needs attention",
        "Volunteers",
        "Status",
        "Admin",
      ],
      ...municipalities.map((m) => [
        m.code,
        m.nameAr,
        m.nameEn,
        m.trees,
        m.planted,
        m.alive,
        m.needsAttention,
        m.volunteers,
        m.status,
        m.adminName,
      ]),
    ];
    downloadCSV("shajarati-municipalities-skikda.csv", rows);
    notify(t("تم تصدير دليل البلديات.", "Municipality directory exported."));
  };

  return (
    <div className="space-y-5">
      <section className="card-surface overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-br from-forest via-forest-700 to-brand-dark p-5 text-white sm:p-7">
          <div className="hero-pattern pointer-events-none absolute inset-0 opacity-50" />
          <div className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-mint/15 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-mint/60">
                <Building2 className="size-3.5" />
                {t("دليل البلديات", "MUNICIPALITY DIRECTORY")}
              </p>
              <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-[32px]">
                {t("بلديات سكيكدة الثماني والثلاثون", "Skikda's 38 municipalities")}
              </h1>
              <p className="mt-1.5 max-w-2xl text-[12px] leading-relaxed text-white/55">
                {t(
                  "من القل إلى المرسى — تابع مؤشرات الغرس والسقاية وحالة الأشجار في كل بلدية، وافتح السجل المحلي لإدارة الحملات.",
                  "From Collo to El Marsa — track planting, watering and tree condition in every municipality, and open local registries.",
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-2xl bg-white/10 px-3.5 py-2 ring-1 ring-white/15 backdrop-blur">
                <p className="text-[8.5px] text-white/45">{t("أشجار مسجلة", "Registered trees")}</p>
                <p className="font-display text-lg font-bold text-mint">
                  {formatNumber(stats.totalTrees, lang)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 px-3.5 py-2 ring-1 ring-white/15 backdrop-blur">
                <p className="text-[8.5px] text-white/45">{t("بحاجة لعناية", "Need attention")}</p>
                <p className="font-display text-lg font-bold text-[#F3D68B]">
                  {formatNumber(stats.needsAttention, lang)}
                </p>
              </div>
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-1.5 rounded-full bg-mint px-4 py-2.5 text-[11px] font-bold text-forest transition hover:bg-white"
              >
                <Download className="size-3.5" />
                {t("تصدير CSV", "Export CSV")}
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5 p-4 sm:p-5">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-charcoal/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("ابحث عن بلدية، رمز، أو أدمن…", "Search municipality, code or admin…")}
              className="w-full rounded-2xl border border-line bg-white py-2.5 pe-3.5 ps-10 text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setStatus(f.id)}
                className={`rounded-full border px-3 py-2 text-[10.5px] font-semibold transition ${
                  status === f.id
                    ? "border-forest bg-forest text-white"
                    : "border-line bg-white text-charcoal/50 hover:border-brand/30"
                }`}
              >
                {lang === "ar" ? f.ar : f.en}
                {f.id !== "all" && (
                  <span className="ms-1 text-[9px] opacity-60">
                    {municipalities.filter((m) => m.status === f.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="appearance-none rounded-2xl border border-line bg-white py-2.5 pe-8 ps-3.5 text-[10.5px] font-semibold text-charcoal/60 outline-none focus:border-brand"
            >
              <option value="trees">{t("الأكثر أشجاراً", "Most trees")}</option>
              <option value="name">{t("أبجدياً", "Alphabetical")}</option>
              <option value="attention">{t("الأكثر احتياجاً", "Most attention")}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2 text-charcoal/35" />
          </div>
        </div>
      </section>

      {/* Selected municipality */}
      {active && (
        <section className="card-surface overflow-hidden border-brand/20 ring-1 ring-brand/10 animate-fade-up">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line/70 bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <span
                className="grid size-11 place-items-center rounded-2xl text-white"
                style={{ backgroundColor: STATUS_COLORS[active.status] }}
              >
                <MapPin className="size-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-forest">
                    {lang === "ar" ? active.nameAr : active.nameEn}
                  </h2>
                  <span className="rounded-full bg-cream px-2 py-0.5 font-mono text-[9px] font-bold text-charcoal/45">
                    {active.code}
                  </span>
                  <StatusPill status={active.status} lang={lang} />
                  {user?.municipalityId === active.id && (
                    <Badge tone="mint">{t("بلديتك", "Your municipality")}</Badge>
                  )}
                </div>
                <p className="mt-0.5 text-[10px] text-charcoal/45">
                  {t("أدمن البلدية", "Admin")}: {active.adminName} ·{" "}
                  {formatNumber(active.population, lang)} {t("نسمة", "residents")} ·{" "}
                  {formatNumber(active.volunteers, lang)} {t("متطوع", "volunteers")}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={newCampaign}
                className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-2 text-[10.5px] font-semibold text-white transition hover:bg-brand-dark"
              >
                <Plus className="size-3.5" />
                {t("حملة جديدة", "New campaign")}
              </button>
              <button
                onClick={printCampaign}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[10.5px] font-semibold text-forest transition hover:bg-mint-soft"
              >
                <Printer className="size-3.5" />
                {t("طباعة QR", "Print QR")}
              </button>
              <button
                onClick={() => setActiveMunicipality(null)}
                className="grid size-8 place-items-center rounded-full border border-line bg-white text-charcoal/45 transition hover:text-forest"
                aria-label={t("إغلاق", "Close")}
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-4 p-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                <MiniMetric
                  label={t("مسجلة", "Registered")}
                  value={formatNumber(active.trees, lang)}
                  icon={<TreePine className="size-3" />}
                />
                <MiniMetric
                  label={t("مغروسة", "Planted")}
                  value={formatNumber(active.planted, lang)}
                  icon={<Sprout className="size-3" />}
                />
                <MiniMetric
                  label={t("حية", "Alive")}
                  value={formatNumber(active.alive, lang)}
                  icon={<CheckCircle2 className="size-3" />}
                />
                <MiniMetric
                  label={t("بحاجة لعناية", "Attention")}
                  value={formatNumber(active.needsAttention, lang)}
                  icon={<Droplets className="size-3" />}
                />
              </div>
              <div className="mt-3 rounded-2xl border border-line/70 bg-white p-3.5">
                <div className="flex items-center justify-between text-[10px] text-charcoal/50">
                  <span>{t("نسبة البقاء", "Survival rate")}</span>
                  <span className="font-bold text-brand">
                    {Math.round((active.alive / active.trees) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(active.alive / active.trees) * 100}
                  color={STATUS_COLORS[active.status]}
                  className="mt-1.5"
                />
                <div className="mt-2 flex items-center justify-between text-[9px] text-charcoal/35">
                  <span>
                    {activeCampaign
                      ? t("آخر حملة", "Latest campaign")
                      : t("لا توجد حملة", "No campaign")}
                  </span>
                  <span>
                    {activeCampaign
                      ? `${lang === "ar" ? activeCampaign.nameAr : activeCampaign.nameEn} · ${formatShortDate(activeCampaign.date, lang)}`
                      : "—"}
                  </span>
                </div>
              </div>
              {canManage && (
                <div className="mt-3 flex items-start gap-2 rounded-2xl bg-mint-soft/60 p-3 text-[9.5px] leading-relaxed text-brand-dark/70">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
                  {t(
                    "لديك صلاحية إدارة هذه البلدية: إنشاء الحملات، تسجيل الأشجار، وتصعيد الحالات.",
                    "You can manage this municipality: create campaigns, register trees and escalate issues.",
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-line/70 bg-white">
              <div className="flex items-center justify-between border-b border-line/60 px-3.5 py-2.5">
                <p className="flex items-center gap-1.5 text-[10.5px] font-bold text-forest">
                  <Grid3X3 className="size-3.5 text-brand" />
                  {t("سجل الأشجار المحلي", "Local tree registry")}
                </p>
                <Badge tone="neutral">{activeTrees.length}</Badge>
              </div>
              {activeTrees.length > 0 ? (
                <div className="divide-y divide-line/60">
                  {activeTrees.slice(0, 5).map((tree) => (
                    <button
                      key={tree.id}
                      onClick={() => openModal({ type: "passport", treeId: tree.id })}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-start transition hover:bg-cream/70"
                    >
                      <span className="grid size-7 place-items-center rounded-lg bg-mint-soft text-brand">
                        <TreePine className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[10px] font-bold text-forest">
                          {tree.id}
                        </p>
                        <p className="truncate text-[9px] text-charcoal/40">
                          {lang === "ar" ? tree.speciesAr : tree.speciesEn} · R
                          {tree.row}/C{tree.col} · {formatDate(tree.lastWatered, lang)}
                        </p>
                      </div>
                      <StatusPill status={tree.status} lang={lang} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3.5 py-6 text-center">
                  <TreePine className="mx-auto size-7 text-charcoal/20" />
                  <p className="mt-2 text-[10.5px] font-semibold text-charcoal/45">
                    {t("لا توجد سجلات فردية محمّلة", "No individual records loaded")}
                  </p>
                  <p className="mt-1 text-[9px] leading-relaxed text-charcoal/35">
                    {t(
                      "أنشئ حملة تشجير لإصدار جوازات وأرقام QR لهذه البلدية.",
                      "Create a campaign to issue passports and QR IDs for this municipality.",
                    )}
                  </p>
                </div>
              )}
              {activeCampaign && (
                <button
                  onClick={printCampaign}
                  className="flex w-full items-center justify-center gap-1.5 border-t border-line/60 py-2.5 text-[10px] font-semibold text-brand hover:bg-mint-soft/50"
                >
                  <Printer className="size-3" />
                  {t("فتح ورقة رموز QR", "Open QR sheet")}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="flex items-center justify-between">
        <SectionHeading
          eyebrow={t("38 بلدية", "38 MUNICIPALITIES")}
          title={t("دليل البلديات", "Municipality directory")}
          subtitle={t(
            "انقر على أي بلدية لعرض سجلها المحلي وحملاتها.",
            "Click any municipality to open its local registry and campaigns.",
          )}
        />
        <p className="hidden text-[10px] text-charcoal/40 sm:block">
          {filtered.length} / {municipalities.length}
        </p>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((m) => {
          const meta = STATUS_META[m.status];
          const isActive = active?.id === m.id;
          const isMine = user?.municipalityId === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMunicipality(m.id)}
              className={`group relative overflow-hidden rounded-[24px] border bg-white p-4 text-start transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-38px_rgba(18,59,42,0.6)] ${
                isActive
                  ? "border-brand ring-2 ring-brand/15"
                  : "border-line/80 hover:border-brand/30"
              }`}
            >
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: meta.color }}
              />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="grid size-9 place-items-center rounded-xl text-[10px] font-extrabold"
                    style={{ backgroundColor: meta.bg, color: meta.color }}
                  >
                    {m.code}
                  </span>
                  <div>
                    <h3 className="font-display text-[13.5px] font-bold text-forest">
                      {lang === "ar" ? m.nameAr : m.nameEn}
                    </h3>
                    <p className="text-[8.5px] text-charcoal/35">
                      {m.coastal ? t("ساحلية", "Coastal") : t("داخلية", "Inland")} ·{" "}
                      {formatNumber(m.population, lang)} {t("نسمة", "res.")}
                    </p>
                  </div>
                </div>
                <StatusPill status={m.status} lang={lang} />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1.5">
                <div className="rounded-lg bg-cream/80 px-2 py-1.5">
                  <p className="text-[8px] text-charcoal/35">{t("أشجار", "Trees")}</p>
                  <p className="text-[11px] font-bold text-forest">{m.trees}</p>
                </div>
                <div className="rounded-lg bg-cream/80 px-2 py-1.5">
                  <p className="text-[8px] text-charcoal/35">{t("حية", "Alive")}</p>
                  <p className="text-[11px] font-bold text-brand">
                    {Math.round((m.alive / m.trees) * 100)}%
                  </p>
                </div>
                <div className="rounded-lg bg-cream/80 px-2 py-1.5">
                  <p className="text-[8px] text-charcoal/35">{t("متطوع", "Vol.")}</p>
                  <p className="text-[11px] font-bold text-forest">{m.volunteers}</p>
                </div>
              </div>

              <div className="mt-2.5">
                <Progress
                  value={(m.alive / m.trees) * 100}
                  className="h-1.5"
                  color={meta.color}
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[8.5px] text-charcoal/40">
                  <Users className="size-2.5" />
                  {m.adminName}
                  {isMine && (
                    <span className="ms-1 rounded-full bg-mint-soft px-1.5 py-0.5 text-[7px] font-bold text-brand">
                      {t("أنت", "You")}
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-0.5 text-[9px] font-semibold text-brand opacity-0 transition group-hover:opacity-100">
                  {t("عرض", "Open")}
                  <ArrowUpRight className="size-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={<Search className="size-6" />}
          title={t("لا توجد نتائج", "No results")}
          description={t(
            "جرّب تعديل كلمة البحث أو إزالة فلتر الحالة.",
            "Try a different search term or clear the status filter.",
          )}
          action={
            <button
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
              className="rounded-full bg-forest px-4 py-2 text-[11px] font-semibold text-white"
            >
              {t("إعادة تعيين", "Reset filters")}
            </button>
          }
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line/70 bg-white px-4 py-3 text-[9.5px] text-charcoal/40">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5 text-brand" />
          {t(
            "بيانات محدّثة · أكتوبر 2026 · ولاية سكيكدة",
            "Data updated · October 2026 · Skikda Wilaya",
          )}
        </span>
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="size-3.5 text-[#C96A1E]" />
          {t(
            "الحالات الحرجة تُصعّد تلقائياً إلى أدمن الولاية.",
            "Critical cases are automatically escalated to the state admin.",
          )}
        </span>
      </div>
    </div>
  );
}
