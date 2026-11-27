"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store";

const TOOLS = [
  {
    href: "/admin/users",
    titleAr: "إدارة المستخدمين",
    titleEn: "User Management",
    bodyAr: "ترقية المتطوعين وإدارة صلاحيات البلديات.",
    bodyEn: "Promote volunteers and manage municipality roles.",
    icon: Users,
    adminOnly: true,
  },
  {
    href: "/admin/reports",
    titleAr: "التقارير",
    titleEn: "Reports",
    bodyAr: "إحصائيات الحملات والأشجار والبلديات.",
    bodyEn: "Campaign, tree and municipality analytics.",
    icon: BarChart3,
    adminOnly: false,
  },
  {
    href: "/admin/municipalities",
    titleAr: "البلديات - 38 بلدية",
    titleEn: "Municipalities — 38",
    bodyAr: "دليل بلديات ولاية سكيكدة ومواقع الغرس.",
    bodyEn: "Directory of Skikda municipalities and planting sites.",
    icon: Building2,
    adminOnly: false,
  },
] as const;

/** Management shortcuts placed inside the profile, never on the home screen. */
export default function ManagementTools() {
  const { t, isStateAdmin } = useApp();

  return (
    <section className="rounded-3xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
          <ShieldCheck className="size-4.5" />
        </span>
        <div>
          <h2 className="text-[14px] font-extrabold text-emerald-950">
            {t("لوحة الإدارة والأدوات", "Management & Tools")}
          </h2>
          <p className="mt-0.5 text-[10px] text-emerald-950/50">
            {t(
              "الوصول السريع إلى أقسام الإدارة والتقارير.",
              "Quick access to administration and reporting sections.",
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const locked = tool.adminOnly && !isStateAdmin;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-2xl border border-emerald-100 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md active:translate-y-0"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="grid size-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100">
                  <Icon className="size-5" strokeWidth={1.9} />
                </span>
                {locked ? (
                  <LockKeyhole className="size-3.5 text-emerald-950/35" />
                ) : (
                  <ArrowUpRight className="size-3.5 text-emerald-600/60 transition group-hover:text-emerald-700" />
                )}
              </div>
              <p className="mt-3 text-[12px] font-extrabold text-emerald-950">
                {t(tool.titleAr, tool.titleEn)}
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-emerald-950/45">
                {locked
                  ? t("متاح لأدمن الولاية فقط.", "State admin only.")
                  : t(tool.bodyAr, tool.bodyEn)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
