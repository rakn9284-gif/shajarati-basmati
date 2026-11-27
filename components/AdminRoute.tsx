"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/store";
import Header from "./Header";

export default function AdminRoute({
  titleAr,
  titleEn,
  subtitleAr,
  subtitleEn,
  children,
}: {
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  children: ReactNode;
}) {
  const { t } = useApp();

  return (
    <div className="space-y-4">
      <Header />

      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-[10.5px] font-bold text-emerald-700 shadow-sm transition hover:border-emerald-300"
      >
        <ArrowRight className="size-3.5" />
        {t("العودة لحسابي", "Back to profile")}
      </Link>

      <div className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
            <ShieldCheck className="size-4.5" />
          </span>
          <div>
            <h1 className="text-[15px] font-extrabold text-emerald-950">
              {t(titleAr, titleEn)}
            </h1>
            <p className="mt-0.5 text-[10px] text-emerald-950/50">
              {t(subtitleAr, subtitleEn)}
            </p>
          </div>
        </div>
      </div>

      <div className="animate-fade-up space-y-5">{children}</div>
    </div>
  );
}
