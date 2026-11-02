"use client";

import {
  ArrowUpRight,
  Building2,
  Camera,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Newspaper,
  Phone,
  ScanLine,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import { useApp } from "@/lib/store";
import type { View } from "@/lib/types";

const PLATFORM_LINKS: Array<{ view: View; ar: string; en: string }> = [
  { view: "dashboard", ar: "لوحة التحكم", en: "Dashboard" },
  { view: "municipalities", ar: "البلديات", en: "Municipalities" },
  { view: "reports", ar: "التقارير", en: "Reports" },
  { view: "magazine", ar: "مجلتي", en: "My Magazine" },
  { view: "profile", ar: "حسابي", en: "Profile" },
];

export default function Footer() {
  const { t, lang, setView, openModal, user } = useApp();

  return (
    <footer className="no-print mt-10 border-t border-line/80 bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr_0.7fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative grid size-11 place-items-center rounded-2xl bg-forest text-mint">
                <Sprout className="size-6" strokeWidth={1.9} />
                <span className="absolute -bottom-0.5 -end-0.5 size-3 rounded-full border-2 border-white bg-brand" />
              </span>
              <div>
                <p className="font-display text-lg font-extrabold text-forest">
                  {t("شجرتي بصمتي", "Shajarati Basmati")}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-charcoal/35">
                  SHAJARATI BASMATI
                </p>
              </div>
            </div>
            <p className="mt-3 max-w-sm text-[11px] leading-relaxed text-charcoal/50">
              {t(
                "منصة رقمية لمتابعة الأشجار في ولاية سكيكدة: جواز رقمي لكل شجرة، حملات تشجير منظمة، وخرائط تفاعلية للبلديات الثماني والثلاثين.",
                "A digital platform for tracking trees across Skikda Wilaya: a passport for every tree, organised planting campaigns and interactive maps for all 38 municipalities.",
              )}
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-mint-soft px-3 py-1.5 text-[10px] font-bold text-brand-dark">
              <Sprout className="size-3.5" />
              {t(
                "لا نغرس شجرة ونرحل، بل نتابعها حتى تنمو",
                "We don't plant and leave — we follow until it grows",
              )}
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-charcoal/40">
              {t("المنصة", "Platform")}
            </p>
            <ul className="mt-3 space-y-1.5">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.view}>
                  <button
                    onClick={() => setView(link.view)}
                    className="group inline-flex items-center gap-1 text-[11px] font-medium text-charcoal/55 transition hover:text-brand"
                  >
                    {t(link.ar, link.en)}
                    <ArrowUpRight className="size-2.5 opacity-0 transition group-hover:opacity-100" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-charcoal/40">
              {t("إجراءات", "Actions")}
            </p>
            <ul className="mt-3 space-y-1.5">
              <li>
                <button
                  onClick={() => openModal({ type: "scanner" })}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-charcoal/55 transition hover:text-brand"
                >
                  <ScanLine className="size-3.5 text-brand" />
                  {t("مسح رمز QR", "Scan QR")}
                </button>
              </li>
              {user && user.role !== "volunteer" && (
                <li>
                  <button
                    onClick={() => openModal({ type: "campaign" })}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-charcoal/55 transition hover:text-brand"
                  >
                    <Sprout className="size-3.5 text-brand" />
                    {t("حملة تشجير", "Planting campaign")}
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => setView("magazine")}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-charcoal/55 transition hover:text-brand"
                >
                  <Newspaper className="size-3.5 text-brand" />
                  {t("مجلتي", "My Magazine")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView("municipalities")}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-charcoal/55 transition hover:text-brand"
                >
                  <Building2 className="size-3.5 text-brand" />
                  {t("دليل البلديات", "Municipality directory")}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-charcoal/40">
              {t("تواصل معنا", "Contact")}
            </p>
            <ul className="mt-3 space-y-2 text-[10.5px] text-charcoal/55">
              <li className="flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0 text-brand" />
                {t("ولاية سكيكدة، الجزائر", "Skikda Wilaya, Algeria")}
              </li>
              <li className="flex items-center gap-1.5">
                <Mail className="size-3.5 shrink-0 text-brand" />
                <span dir="ltr">contact@shajarati.dz</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Phone className="size-3.5 shrink-0 text-brand" />
                <span dir="ltr">+213 (0) 38 00 00 00</span>
              </li>
            </ul>
            <div className="mt-3 flex items-center gap-1.5">
              {[MessageCircle, Camera].map((Icon, i) => (
                <span
                  key={i}
                  className="grid size-8 place-items-center rounded-full border border-line bg-cream text-charcoal/45"
                  aria-hidden
                >
                  <Icon className="size-3.5" />
                </span>
              ))}
              <span className="ms-1 rounded-full bg-mint-soft px-2.5 py-1 text-[9px] font-bold text-brand">
                {lang === "ar" ? "قريباً" : "Soon"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-4 text-[9.5px] text-charcoal/35">
          <p>
            © {new Date().getFullYear()}{" "}
            {t(
              "شجرتي بصمتي — ولاية سكيكدة. جميع الحقوق محفوظة.",
              "Shajarati Basmati — Skikda Wilaya. All rights reserved.",
            )}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-soft px-2.5 py-1 font-bold text-brand-dark">
              <Leaf className="size-3 text-brand" />
              {t("من إنتاج نادي العقل الأخضر", "Produced by Green Mind Club")}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-brand" />
              {t("منصة معتمدة", "Official platform")}
            </span>
            <span className="text-charcoal/20">·</span>
            <span>{t("38 بلدية", "38 municipalities")}</span>
            <span className="text-charcoal/20">·</span>
            <span>{t("أكتوبر 2026", "October 2026")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
