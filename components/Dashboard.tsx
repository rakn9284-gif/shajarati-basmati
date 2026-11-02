"use client";

import { useId, useMemo } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Droplets,
  Heart,
  Leaf,
  MapPin,
  Newspaper,
  Plus,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sprout,
  TrendingUp,
  TreePine,
  Trophy,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { cn, formatNumber, formatShortDate, relativeTime } from "@/lib/utils";
import { getMunicipality, municipalityName } from "@/lib/municipalities";
import { STATUS_META, monthlyPlanting } from "@/lib/data";
import { Badge, Progress, SectionHeading, StatusPill } from "./ui";
import { TreeArt } from "./TreeArt";
import Hero from "./Hero";
import MapView from "./MapView";

/* ------------------------------------------------------------------ */
/* Cloud sync chip                                                     */
/* ------------------------------------------------------------------ */

function CloudSyncChip() {
  const { t, cloudStatus, refreshCloud } = useApp();
  if (cloudStatus === "online") {
    return (
      <span className="ms-auto inline-flex items-center gap-1.5 rounded-full bg-mint-soft px-2.5 py-1 text-[9px] font-bold text-brand-dark">
        <span className="size-1.5 animate-pulse rounded-full bg-brand" />
        {t("السحابة متصلة — بيانات حية", "Cloud connected — live data")}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "ms-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold",
        cloudStatus === "checking"
          ? "bg-white text-charcoal/50 ring-1 ring-line"
          : "bg-[#FBF2DC] text-[#8A6516]",
      )}
    >
      {cloudStatus === "checking" ? (
        <>
          <span className="size-1.5 animate-pulse rounded-full bg-[#8A6516]" />
          {t("جارٍ جلب بيانات السحابة…", "Fetching cloud data…")}
        </>
      ) : (
        <>
          <AlertTriangle className="size-3" />
          {t("دون اتصال — آخر نسخة محفوظة", "Offline — last cached snapshot")}
        </>
      )}
      <button
        onClick={() => void refreshCloud()}
        className="rounded-full bg-white px-1.5 py-0.5 text-[8.5px] font-bold text-forest ring-1 ring-line transition hover:text-brand"
      >
        {t("تحديث", "Refresh")}
      </button>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Sparkline                                                           */
/* ------------------------------------------------------------------ */

function Sparkline({ color, values }: { color: string; values: number[] }) {
  const uid = useId().replace(/:/g, "");
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 116 + 2;
    const y = 30 - ((v - min) / range) * 24;
    return `${x},${y}`;
  });
  return (
    <svg
      viewBox="0 0 120 34"
      className="h-9 w-[104px] max-w-full shrink-0"
      aria-hidden
    >
      <defs>
        <linearGradient id={`sp-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`2,34 ${points.join(" ")} 118,34`}
        fill={`url(#sp-${uid})`}
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={points[points.length - 1].split(",")[0]}
        cy={points[points.length - 1].split(",")[1]}
        r="2.6"
        fill={color}
        stroke="#fff"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* KPI cards                                                           */
/* ------------------------------------------------------------------ */

function KpiCards() {
  const { lang, t, stats, trees } = useApp();

  const monthly = monthlyPlanting(trees).map((m) => m.value);
  const criticalCount = trees.filter((tr) => tr.status === "critical").length;
  const thisMonth = trees.filter(
    (tr) => tr.plantedAt?.slice(0, 7) === new Date().toISOString().slice(0, 7),
  ).length;

  const cards = [
    {
      label: t("أشجار مسجلة", "Registered trees"),
      value: stats.totalTrees,
      sub: t("في 38 بلدية", "across 38 municipalities"),
      icon: TreePine,
      color: "#123B2A",
      bg: "#E4F4EA",
      trend: `+${thisMonth}`,
      trendLabel: t("هذا الشهر", "this month"),
      spark: monthly,
    },
    {
      label: t("أشجار مغروسة", "Planted trees"),
      value: stats.planted,
      sub: t("موثوقة بإحداثيات جغرافية", "verified with geo-coordinates"),
      icon: Sprout,
      color: "#16865B",
      bg: "#DDF2E8",
      trend: `${stats.campaigns}`,
      trendLabel: t("حملات غرس", "planting campaigns"),
      spark: monthly,
    },
    {
      label: t("أشجار مستقرة", "Stable trees"),
      value: stats.alive,
      sub: `${stats.survivalRate}% ${t("معدل الاستقرار", "stability rate")}`,
      icon: ShieldCheck,
      color: "#0F6B47",
      bg: "#DDF2E8",
      trend: `${stats.waterings}`,
      trendLabel: t("سقايات موثقة", "verified waterings"),
      spark: monthly,
    },
    {
      label: t("بحاجة لعناية", "Needs attention"),
      value: stats.needsAttention,
      sub: criticalCount
        ? ` منها ${criticalCount} ${t("حالة حرجة", "critical cases")}`
        : t("لا حالات حرجة", "no critical cases"),
      icon: AlertTriangle,
      color: "#C96A1E",
      bg: "#FDEEE2",
      trend: criticalCount ? `${criticalCount}!` : "—",
      trendLabel: t("لاإداري", "state view"),
      spark: monthly,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="card-surface group relative overflow-hidden p-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-40px_rgba(18,59,42,0.6)] sm:p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-charcoal/50">
                  {card.label}
                </p>
                <p className="mt-2 font-display text-[27px] font-extrabold leading-none tracking-tight text-forest sm:text-[30px]">
                  {formatNumber(card.value, lang)}
                </p>
                <p className="mt-1.5 text-[10px] text-charcoal/40">{card.sub}</p>
              </div>
              <span
                className="grid size-10 place-items-center rounded-2xl transition group-hover:scale-105"
                style={{ backgroundColor: card.bg, color: card.color }}
              >
                <Icon className="size-5" strokeWidth={2} />
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-1 text-[10px] font-semibold text-charcoal/55">
                <TrendingUp className="size-3 text-brand" />
                <span className="text-brand">{card.trend}</span>
                {card.trendLabel}
              </span>
              <Sparkline color={card.color} values={card.spark} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Quick actions                                                       */
/* ------------------------------------------------------------------ */

function QuickActions() {
  const { t, user, openModal, setView, notify } = useApp();

  const campaign = () => {
    if (user && user.role !== "volunteer") {
      openModal({ type: "campaign" });
      return;
    }
    notify(
      "سجّل الدخول كأدمن بلدية أو ولاية لإنشاء حملة.",
      "Sign in as a municipality or state admin to create a campaign.",
      "info",
    );
    openModal({ type: "auth", mode: "login" });
  };

  const registerTree = () => {
    if (user && user.role !== "volunteer") {
      openModal({ type: "tree-form" });
      return;
    }
    notify(
      "تسجيل شجرة مفردة متاح لأدمن البلدية والولاية.",
      "Single tree registration is reserved for admins.",
      "info",
    );
    openModal({ type: "auth", mode: "login" });
  };

  const actions = [
    {
      label: t("مسح رمز QR", "Scan QR"),
      sub: t("افتح جواز الشجرة", "Open a tree passport"),
      icon: ScanLine,
      color: "#16865B",
      bg: "#E4F4EA",
      onClick: () => openModal({ type: "scanner" }),
    },
    {
      label: t("حملة تشجير", "Planting campaign"),
      sub: t("غرس جماعي منظم", "Coordinated batch planting"),
      icon: Plus,
      color: "#123B2A",
      bg: "#DDF2E8",
      onClick: campaign,
    },
    {
      label: t("تسجيل شجرة", "Register tree"),
      sub: t("جواز رقمي فوري", "Instant digital passport"),
      icon: Sprout,
      color: "#0F6B47",
      bg: "#E4F4EA",
      onClick: registerTree,
    },
    {
      label: t("مجلتي", "My Magazine"),
      sub: t("أخبار وصور البلديات", "Municipal news & photos"),
      icon: Newspaper,
      color: "#8A6516",
      bg: "#FBF2DC",
      onClick: () => setView("magazine"),
    },
  ];

  return (
    <section className="card-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-forest">
          {t("إجراءات سريعة", "Quick actions")}
        </h2>
        <span className="rounded-full bg-mint-soft px-2 py-1 text-[9px] font-bold text-brand">
          {t("مباشر", "LIVE")}
        </span>
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-2.5">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              onClick={a.onClick}
              className="group rounded-2xl border border-line/80 bg-cream/60 p-3 text-start transition hover:-translate-y-0.5 hover:border-brand/30 hover:bg-white hover:shadow-md"
            >
              <span
                className="grid size-9 place-items-center rounded-xl transition group-hover:scale-105"
                style={{ backgroundColor: a.bg, color: a.color }}
              >
                <Icon className="size-4.5" />
              </span>
              <p className="mt-2.5 text-[11.5px] font-bold text-forest">{a.label}</p>
              <p className="mt-0.5 text-[9.5px] leading-tight text-charcoal/45">
                {a.sub}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Attention list                                                      */
/* ------------------------------------------------------------------ */

function AttentionList() {
  const { t, lang, trees, stats, openModal, setView } = useApp();
  const urgent = [...trees]
    .filter((tr) => tr.status === "critical" || tr.status === "risk")
    .sort((a, b) => a.health - b.health)
    .slice(0, 3);

  return (
    <section className="card-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-[#FDEEE2] text-[#C96A1E]">
            <AlertTriangle className="size-4" />
          </span>
          <div>
            <h2 className="font-display text-sm font-bold text-forest">
              {t("بحاجة لعناية عاجلة", "Needs urgent care")}
            </h2>
            <p className="text-[9.5px] text-charcoal/45">
              {formatNumber(stats.needsAttention, lang)} {t("حالة نشطة", "active cases")}
            </p>
          </div>
        </div>
        <button
          onClick={() => setView("reports")}
          className="text-[10px] font-semibold text-brand hover:underline"
        >
          {t("عرض الكل", "View all")}
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {urgent.map((tree) => {
          const meta = STATUS_META[tree.status];
          return (
            <button
              key={tree.id}
              onClick={() => openModal({ type: "passport", treeId: tree.id })}
              className="flex w-full items-center gap-2.5 rounded-2xl border border-line/60 bg-cream/60 p-2.5 text-start transition hover:border-brand/30 hover:bg-white"
            >
              <span
                className="grid size-8 shrink-0 place-items-center rounded-lg text-[10px] font-bold"
                style={{ backgroundColor: meta.bg, color: meta.color }}
              >
                {tree.health}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[10.5px] font-bold text-forest">
                  {tree.id}
                </p>
                <p className="truncate text-[9.5px] text-charcoal/45">
                  {lang === "ar" ? tree.speciesAr : tree.speciesEn} ·{" "}
                  {municipalityName(tree.municipalityId, lang)}
                </p>
              </div>
              <StatusPill status={tree.status} lang={lang} />
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#FBF2DC] px-2.5 py-2 text-[9.5px] leading-snug text-[#8A6516]">
        <Clock className="size-3.5 shrink-0" />
        {t(
          "يُصعّد أدمن البلدية الحالات الحرجة إلى الولاية تلقائياً.",
          "Municipality admins automatically escalate critical cases.",
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Campaigns                                                           */
/* ------------------------------------------------------------------ */

function CampaignsCard() {
  const { t, lang, campaigns, openModal, user, setView } = useApp();
  const visible = campaigns.slice(0, 4);

  return (
    <section className="card-surface p-5 sm:p-6">
      <SectionHeading
        eyebrow={t("ميدانياً", "IN THE FIELD")}
        title={t("حملات التشجير الجارية", "Active planting campaigns")}
        subtitle={t(
          "متابعة الغرس والسقاية وحالة الأشجار في كل بلدية.",
          "Track planting, watering and tree health in each municipality.",
        )}
        action={
          <button
            onClick={() => setView("reports")}
            className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-2 text-[11px] font-semibold text-forest hover:bg-mint-soft"
          >
            {t("كل الحملات", "All campaigns")}
            <ArrowUpRight className="size-3.5" />
          </button>
        }
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {visible.map((campaign) => {
          const muni = getMunicipality(campaign.municipalityId);
          const percent = Math.round((campaign.planted / campaign.target) * 100);
          return (
            <article
              key={campaign.id}
              className="group rounded-2xl border border-line/80 bg-cream/50 p-4 transition hover:border-brand/30 hover:bg-white hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-forest text-mint">
                    <TreePine className="size-4.5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-[12px] font-bold text-forest">
                      {lang === "ar" ? campaign.nameAr : campaign.nameEn}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[9.5px] text-charcoal/45">
                      <MapPin className="size-2.5" />
                      {lang === "ar" ? muni.nameAr : muni.nameEn} ·{" "}
                      {formatShortDate(campaign.date, lang)}
                    </p>
                  </div>
                </div>
                <Badge
                  tone={
                    campaign.status === "active"
                      ? "mint"
                      : campaign.status === "completed"
                        ? "neutral"
                        : "amber"
                  }
                >
                  {campaign.status === "active"
                    ? t("جارية", "Active")
                    : campaign.status === "completed"
                      ? t("مكتملة", "Completed")
                      : t("مخططة", "Planned")}
                </Badge>
              </div>

              <div className="mt-3 flex items-center justify-between text-[9.5px] text-charcoal/50">
                <span>
                  <span className="font-bold text-forest">
                    {formatNumber(campaign.planted, lang)}
                  </span>{" "}
                  / {formatNumber(campaign.target, lang)} {t("شجرة", "trees")}
                </span>
                <span className="font-bold text-brand">{percent}%</span>
              </div>
              <Progress value={percent} className="mt-1.5 h-1.5" />

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[9.5px] text-charcoal/45">
                  <CalendarDays className="size-3" />
                  {campaign.layout === "grid"
                    ? t("شبكة مصفوفة", "Grid layout")
                    : t("خطوط مستقيمة", "Straight rows")}
                  <span className="text-charcoal/25">·</span>
                  {campaign.spacing} {t("م", "m")}
                </div>
                <button
                  onClick={() =>
                    openModal({ type: "print", campaignId: campaign.id })
                  }
                  className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[9.5px] font-semibold text-forest ring-1 ring-line transition hover:bg-mint-soft"
                >
                  <QrCode className="size-3" />
                  {t("رموز QR", "QR codes")}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {user?.role === "state_admin" && (
        <button
          onClick={() => openModal({ type: "campaign" })}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-brand/30 bg-mint-soft/40 py-2.5 text-[11px] font-semibold text-brand transition hover:bg-mint-soft"
        >
          <Plus className="size-3.5" />
          {t("إضافة حملة تشجير جديدة", "Add a new planting campaign")}
        </button>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Leaderboard                                                         */
/* ------------------------------------------------------------------ */

function Leaderboard() {
  const { t, lang, trees } = useApp();
  const rows = [...trees]
    .reduce<
      Array<{ id: string; nameAr: string; nameEn: string; waterings: number }>
    >((acc, tree) => {
      const found = acc.find((a) => a.id === tree.municipalityId);
      if (found) found.waterings += tree.waterings;
      else {
        const muni = getMunicipality(tree.municipalityId);
        acc.push({
          id: muni.id,
          nameAr: muni.nameAr,
          nameEn: muni.nameEn,
          waterings: tree.waterings,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.waterings - a.waterings)
    .slice(0, 6);
  const max = rows[0]?.waterings || 1;

  return (
    <section className="card-surface p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-xl bg-[#FBF2DC] text-[#8A6516]">
          <Trophy className="size-4.5" />
        </span>
        <div>
          <h2 className="font-display text-base font-bold text-forest">
            {t("أبطال السقاية", "Watering champions")}
          </h2>
          <p className="text-[10px] text-charcoal/45">
            {t("أكثر البلديات عناية هذا الموسم", "Most caring municipalities this season")}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((row, i) => (
          <div key={row.id} className="flex items-center gap-2.5">
            <span
              className={`grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                i === 0
                  ? "bg-[#F3D68B] text-[#6E4B0C]"
                  : i === 1
                    ? "bg-sand text-charcoal/60"
                    : i === 2
                      ? "bg-[#F4E0CE] text-[#9A5A2B]"
                      : "bg-cream text-charcoal/40"
              }`}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="truncate font-semibold text-charcoal/70">
                  {lang === "ar" ? row.nameAr : row.nameEn}
                </span>
                <span className="ms-2 shrink-0 font-bold text-brand">
                  {row.waterings}
                </span>
              </div>
              <Progress
                value={(row.waterings / max) * 100}
                className="mt-1 h-1.5"
                color={i === 0 ? "#E0A526" : "#16865B"}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-forest px-3.5 py-3 text-white">
        <div>
          <p className="text-[9px] text-white/55">{t("إجمالي السقايات الموثقة", "Verified waterings")}</p>
          <p className="font-display text-lg font-bold">
            {formatNumber(
              trees.reduce((sum, tr) => sum + tr.waterings, 0),
              lang,
            )}
          </p>
        </div>
        <Droplets className="size-7 text-mint/80" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Magazine preview                                                    */
/* ------------------------------------------------------------------ */

function MagazinePreview() {
  const { t, lang, posts, setView, openModal, canManagePost } = useApp();
  const visiblePosts = useMemo(
    () => posts.filter((p) => !p.hidden || canManagePost(p)),
    [posts, canManagePost],
  );
  const featured = visiblePosts.slice(0, 3);

  return (
    <section>
      <SectionHeading
        eyebrow={t("مجلتي", "MY MAGAZINE")}
        title={t("حكايات من غابات سكيكدة", "Stories from Skikda's green spaces")}
        subtitle={t(
          "صور وتحديثات من البلديات، ومقالات يكتبها المتطوعون.",
          "Photos and updates from municipalities, written by volunteers.",
        )}
        action={
          <button
            onClick={() => setView("magazine")}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-forest ring-1 ring-line transition hover:bg-mint-soft"
          >
            {t("تصفح المجلة", "Browse magazine")}
            <ArrowLeft className="size-3.5" />
          </button>
        }
      />
      {featured.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-dashed border-line bg-white/60 px-6 py-10 text-center">
          <p className="text-[12px] font-semibold text-charcoal/55">
            {t("لا توجد مقالات منشورة بعد.", "No stories published yet.")}
          </p>
          <p className="mt-1 text-[10px] text-charcoal/35">
            {t(
              "التقارير والصور تظهر هنا فور نشر أدمن البلديات أو الولاية.",
              "Reports and photos appear here as soon as admins publish them.",
            )}
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((post) => (
          <button
            key={post.id}
            onClick={() => openModal({ type: "post", postId: post.id })}
            className="group overflow-hidden rounded-[24px] border border-line/80 bg-white text-start shadow-sm transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-40px_rgba(18,59,42,0.55)]"
          >
            <div className="relative h-36 overflow-hidden">
              {post.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.imageUrl}
                  alt={lang === "ar" ? post.titleAr : post.titleEn}
                  className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <TreeArt
                  seed={post.art}
                  className="transition duration-700 group-hover:scale-105"
                />
              )}
              <span className="absolute start-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[9px] font-bold text-forest backdrop-blur">
                {post.category === "campaign"
                  ? t("حملة", "Campaign")
                  : post.category === "news"
                    ? t("خبر", "News")
                    : post.category === "gallery"
                      ? t("معرض", "Gallery")
                      : t("نصيحة", "Tip")}
              </span>
            </div>
            <div className="p-4">
              <h3 className="line-clamp-2 font-display text-[13.5px] font-bold leading-snug text-forest transition group-hover:text-brand">
                {lang === "ar" ? post.titleAr : post.titleEn}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-[10.5px] leading-relaxed text-charcoal/50">
                {lang === "ar" ? post.excerptAr : post.excerptEn}
              </p>
              <div className="mt-3 flex items-center justify-between text-[9.5px] text-charcoal/40">
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3" />
                  {formatShortDate(post.date, lang)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="size-3" />
                  {post.likes}
                </span>
              </div>
            </div>
          </button>
        ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Activity feed                                                       */
/* ------------------------------------------------------------------ */

function ActivityFeed() {
  const { t, lang, activities } = useApp();
  return (
    <section className="card-surface p-5 sm:p-6">
      <SectionHeading
        eyebrow={t("نبض الميدان", "FIELD PULSE")}
        title={t("آخر النشاطات", "Recent activity")}
        subtitle={t(
          "سقايات، غرس، تصعيد حالات، وانضمام متطوعين — لحظة بلحظة.",
          "Waterings, plantings, escalations and new volunteers — in real time.",
        )}
      />
      <div className="mt-4 space-y-0">
        {activities.slice(0, 5).map((activity, i) => {
          const icons = {
            water: Droplets,
            plant: Sprout,
            campaign: TreePine,
            issue: AlertTriangle,
            role: ShieldCheck,
            join: Users,
          };
          const colors = {
            water: "#16865B",
            plant: "#16865B",
            campaign: "#123B2A",
            issue: "#C96A1E",
            role: "#8A6516",
            join: "#0F6B47",
          };
          const Icon = icons[activity.type];
          return (
            <div key={activity.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-full"
                  style={{
                    backgroundColor: `${colors[activity.type]}14`,
                    color: colors[activity.type],
                  }}
                >
                  <Icon className="size-3.5" />
                </span>
                {i < Math.min(activities.length, 5) - 1 && (
                  <span className="my-1 h-full w-px flex-1 bg-line" />
                )}
              </div>
              <div className="pb-4">
                <p className="text-[11.5px] font-medium leading-snug text-charcoal/75">
                  {lang === "ar" ? activity.textAr : activity.textEn}
                </p>
                <p className="mt-0.5 text-[9.5px] text-charcoal/40">
                  {relativeTime(activity.at, lang)}
                  {activity.municipalityId
                    ? ` · ${municipalityName(activity.municipalityId, lang)}`
                    : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Join card                                                           */
/* ------------------------------------------------------------------ */

function JoinCard() {
  const { t, lang, user, openModal, setView, stats } = useApp();
  return (
    <section className="relative flex flex-col justify-between overflow-hidden rounded-[28px] bg-gradient-to-br from-forest via-forest-700 to-brand-dark p-6 text-white">
      <div className="hero-pattern pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -end-10 -top-10 size-40 rounded-full bg-mint/15 blur-2xl" />
      <div className="relative">
        <span className="grid size-11 place-items-center rounded-2xl bg-white/10 text-mint ring-1 ring-white/15">
          <Leaf className="size-5" />
        </span>
        <h2 className="mt-4 font-display text-xl font-extrabold leading-snug">
          {t("كن جزءاً من الظل القادم", "Be part of the coming shade")}
        </h2>
        <p className="mt-2 text-[11.5px] leading-relaxed text-white/60">
          {t(
            "ساعة واحدة من وقتك تكفي لسقاية شجرة، وتوثيق بصمة تبقى لعشرات السنين.",
            "One hour of your time is enough to water a tree and leave a mark for decades.",
          )}
        </p>
        <div className="mt-4 flex items-center gap-4 text-[10px]">
          <div>
            <p className="font-display text-lg font-bold text-mint">
              {formatNumber(stats.volunteers, lang)}
            </p>
            <p className="text-white/45">{t("متطوع", "volunteers")}</p>
          </div>
          <div className="h-7 w-px bg-white/15" />
          <div>
            <p className="font-display text-lg font-bold text-mint">38</p>
            <p className="text-white/45">{t("بلدية", "municipalities")}</p>
          </div>
        </div>
      </div>
      <div className="relative mt-6 flex flex-col gap-2">
        {user ? (
          <button
            onClick={() => setView("profile")}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-mint px-4 py-2.5 text-[12px] font-bold text-forest transition hover:bg-white"
          >
            {t("مساهماتي", "My contributions")}
            <ArrowUpRight className="size-3.5" />
          </button>
        ) : (
          <button
            onClick={() => openModal({ type: "auth", mode: "signup" })}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-mint px-4 py-2.5 text-[12px] font-bold text-forest transition hover:bg-white"
          >
            {t("تطوع معنا الآن", "Join as a volunteer")}
            <Sprout className="size-3.5" />
          </button>
        )}
        <button
          onClick={() => openModal({ type: "scanner" })}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/10 px-4 py-2.5 text-[11.5px] font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
        >
          <ScanLine className="size-3.5" />
          {t("جرّب مسح شجرة", "Try scanning a tree")}
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const { t, isAdmin } = useApp();

  // Admins get the full operations dashboard; guests and volunteers get
  // the public home experience (hero, map, magazine and join card).
  if (isAdmin) {
    return (
      <div className="space-y-6">
        <Hero />
        <div className="relative z-10 -mt-9 px-1 sm:-mt-11 sm:px-4">
          <KpiCards />
          <div className="mt-2 flex justify-end">
            <CloudSyncChip />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MapView />
          </div>
          <div className="flex flex-col gap-5">
            <QuickActions />
            <AttentionList />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CampaignsCard />
          </div>
          <Leaderboard />
        </div>

        <MagazinePreview />

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActivityFeed />
          </div>
          <JoinCard />
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-charcoal/35">
          <CheckCircle2 className="size-3.5 text-brand" />
          {t(
            "كل شجرة مسجلة تحمل جوازاً رقمياً فريداً — يمكن التحقق منه في أي وقت.",
            "Every registered tree carries a unique, verifiable digital passport.",
          )}
          <span className="hidden text-charcoal/20 sm:inline">·</span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="hidden items-center gap-1 font-semibold text-brand hover:underline sm:flex"
          >
            {t("العودة للأعلى", "Back to top")}
            <ChevronLeft className="size-3 rotate-90" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Hero />
      <div className="relative z-10 -mt-9 px-1 sm:-mt-11 sm:px-4">
        <PublicHomeStats />
      </div>

      <MapView />

      <MagazinePreview />
      <JoinCard />
    </div>
  );
}

function PublicHomeStats() {
  const { lang, t, stats } = useApp();
  const items = [
    { label: t("شجرة مسجلة", "Registered tree"), value: stats.totalTrees },
    { label: t("حملة غرس", "Planting campaign"), value: stats.campaigns },
    { label: t("بلدية", "municipality"), value: 38 },
    { label: t("سقاية موثقة", "verified watering"), value: stats.waterings },
  ];
  return (
    <div className="space-y-2.5">
      <CloudSyncChip />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="card-surface p-4 text-center">
          <p className="text-[10px] font-semibold text-charcoal/45">
            {item.label}
          </p>
          <p className="mt-1.5 font-display text-2xl font-extrabold leading-none text-forest">
            {formatNumber(item.value, lang)}
          </p>
        </div>
      ))}
      </div>
    </div>
  );
}
