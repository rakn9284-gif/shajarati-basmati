"use client";

import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Plus,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Sprout,
  TreePine,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import { Avatar } from "./ui";
import { TreeEmblem } from "./TreeArt";

export default function Hero() {
  const { lang, t, stats, user, users, openModal, notify } = useApp();

  const requireAdmin = () => {
    if (user && user.role !== "volunteer") {
      openModal({ type: "campaign" });
      return;
    }
    notify(
      "سجّل الدخول كأدمن بلدية أو ولاية لإنشاء حملة تشجير.",
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

  return (
    <section className="relative overflow-hidden rounded-[30px] bg-forest text-white shadow-[0_40px_100px_-50px_rgba(18,59,42,0.9)] sm:rounded-[36px]">
      <div className="hero-pattern pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -top-28 start-1/3 size-[420px] rounded-full bg-brand/30 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -end-20 size-[380px] rounded-full bg-mint/20 blur-[90px]" />
      <div className="pointer-events-none absolute -start-24 top-1/3 size-[280px] rounded-full bg-mint/10 blur-[70px]" />

      <div className="relative grid items-center gap-8 p-6 sm:p-9 lg:grid-cols-[1.18fr_0.82fr] lg:p-12">
        <div className="animate-fade-up">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-mint ring-1 ring-white/15">
              <MapPin className="size-3.5" />
              {t("ولاية سكيكدة · 38 بلدية", "Skikda Wilaya · 38 municipalities")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/15 px-3 py-1.5 text-[11px] font-semibold text-mint ring-1 ring-mint/20">
              <Sparkles className="size-3.5" />
              {t("برنامج التشجير الذكي 2026", "Smart Planting Program 2026")}
            </span>
          </div>

          {user && (
            <p className="mt-4 text-[12px] font-medium text-mint/80">
              {t(
                `أهلاً ${user.firstName}، بصمتك اليوم تصنع ظلاً غداً.`,
                `Welcome ${user.firstName}, your mark today is tomorrow's shade.`,
              )}
            </p>
          )}

          <h1 className="mt-3 max-w-[640px] font-display text-[28px] font-extrabold leading-[1.28] tracking-tight sm:text-[38px] lg:text-[45px]">
            {t("لا نغرس شجرة ونرحل،", "We don't plant a tree and leave,")}
            <br className="hidden sm:block" />{" "}
            <span className="relative inline-block text-mint">
              {t("بل نتابعها حتى تنمو", "we follow it until it grows")}
              <svg
                viewBox="0 0 240 12"
                className="absolute -bottom-2 start-0 h-2.5 w-full max-w-full text-brand-soft/70"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M2 9 C 60 2, 150 2, 238 8"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-5 max-w-[540px] text-[13px] leading-relaxed text-white/65 sm:text-sm">
            {t(
              "منصة رقمية موحّدة لمتابعة كل شجرة في ولاية سكيكدة: جواز رقمي، خرائط تفاعلية، سقاية موثقة، وحملات تشجير منسقة بين 38 بلدية.",
              "One digital platform to track every tree in Skikda: a digital passport, interactive maps, verified watering, and coordinated planting campaigns across 38 municipalities.",
            )}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => openModal({ type: "scanner" })}
              className="group inline-flex items-center gap-2 rounded-full bg-mint px-5 py-3 text-[13px] font-bold text-forest shadow-[0_16px_36px_-18px_rgba(184,230,206,0.9)] transition hover:bg-white"
            >
              <ScanLine className="size-4.5" />
              {t("امسح رمز الـ QR", "Scan QR code")}
              <ArrowLeft className="size-4 transition group-hover:-translate-x-0.5 rtl:rotate-0 ltr:rotate-180" />
            </button>
            <button
              onClick={requireAdmin}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-[13px] font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15"
            >
              <Plus className="size-4.5" />
              {t("إضافة حملة تشجير", "Add planting campaign")}
            </button>
            <button
              onClick={registerTree}
              className="inline-flex items-center gap-2 rounded-full px-3 py-3 text-[12px] font-semibold text-mint/85 transition hover:text-white"
            >
              <Sprout className="size-4" />
              {t("تسجيل شجرة مفردة", "Register a single tree")}
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-5">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {(users.length ? users.slice(0, 4) : []).map((u) => (
                  <Avatar
                    key={u.id}
                    first={u.firstName}
                    last={u.lastName}
                    color={u.avatarColor}
                    size="xs"
                    className="ring-forest"
                  />
                ))}
                {users.length === 0 && (
                  <span className="grid size-7 place-items-center rounded-full bg-mint/25 text-[9px] font-bold text-mint ring-2 ring-forest">
                    +1
                  </span>
                )}
              </div>
              <div className="text-[11px] leading-tight">
                <p className="font-bold text-white">
                  {formatNumber(stats.volunteers, lang)}+
                </p>
                <p className="text-white/50">{t("متطوع نشط", "active volunteers")}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-[11px] leading-tight">
              <TreePine className="size-5 text-mint" />
              <div>
                <p className="font-bold text-white">
                  {formatNumber(stats.totalTrees, lang)}
                </p>
                <p className="text-white/50">{t("شجرة مسجلة", "trees registered")}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-[11px] leading-tight">
              <CheckCircle2 className="size-5 text-mint" />
              <div>
                <p className="font-bold text-white">{stats.survivalRate}%</p>
                <p className="text-white/50">{t("معدل البقاء", "survival rate")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual */}
        <div className="relative hidden min-h-[340px] lg:block">
          <div className="absolute inset-0 grid place-items-center">
            <div className="animate-float">
              <TreeEmblem className="max-h-[330px]" />
            </div>
          </div>

          <div className="absolute end-0 top-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 p-2.5 pe-3.5 backdrop-blur-md">
            <span className="grid size-9 place-items-center rounded-xl bg-mint/20 text-mint">
              <ShieldCheck className="size-4.5" />
            </span>
            <div className="text-[10px] leading-tight">
              <p className="font-bold text-white">{stats.survivalRate}%</p>
              <p className="text-white/55">{t("أشجار حية مؤكدة", "verified alive")}</p>
            </div>
          </div>

          <div className="absolute bottom-8 start-0 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/10 p-2.5 pe-4 backdrop-blur-md">
            <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-mint">
              <QrCode className="size-4.5" />
            </span>
            <div className="text-[10px] leading-tight">
              <p className="font-mono text-[11px] font-bold tracking-wide text-white">
                SKK-COL-043
              </p>
              <p className="text-white/55">{t("جواز الشجرة الرقمي", "digital tree passport")}</p>
            </div>
          </div>

          <div className="absolute bottom-24 end-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 p-2.5 pe-3.5 backdrop-blur-md">
            <span className="grid size-9 place-items-center rounded-xl bg-[#FBF2DC]/15 text-[#F3D68B]">
              <Users className="size-4.5" />
            </span>
            <div className="text-[10px] leading-tight">
              <p className="font-bold text-white">{stats.campaigns}</p>
              <p className="text-white/55">{t("حملة جارية", "active campaigns")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
