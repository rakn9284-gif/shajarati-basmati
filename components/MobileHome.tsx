"use client";

import Link from "next/link";
import { Calendar, Camera, Leaf, MapPin, Plus, Trees, Users } from "lucide-react";
import { isPrivilegedRole } from "@/lib/data";
import { useApp } from "@/lib/store";
import Header from "./Header";

export default function MobileHome() {
  const { stats, user } = useApp();

  // Add-campaign is strictly admin-only: Super Admin (or legacy state admin)
  // and Municipality Admin. Volunteers and guests never see the CTA.
  const canAddCampaign = isPrivilegedRole(user?.role);

  const successRate = stats.survivalRate || 100;
  const volunteerCount = stats.volunteers || 32;
  const treeCount = stats.totalTrees || 64;

  return (
    <div className="space-y-5">
      <Header />

      {/* Main hero card */}
      <section className="relative overflow-hidden rounded-3xl bg-emerald-950 p-5 text-white shadow-xl">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=85")',
            backgroundPosition: "22% center",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-emerald-900/80 to-emerald-800/40"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(252,211,77,0.10),transparent_45%)]"
        />

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

          <h1 className="mt-5 text-[26px] font-extrabold leading-[1.35] tracking-tight drop-shadow-sm sm:text-[32px]">
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

          <p className="mt-4 text-[12px] leading-relaxed text-emerald-50/85 drop-shadow-sm">
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
            {canAddCampaign && (
              <Link
                href="/campaigns/new"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-emerald-300/50 bg-emerald-950/40 px-5 py-3 text-[12.5px] font-bold text-white backdrop-blur-sm transition hover:bg-emerald-950/60 active:scale-[0.99]"
              >
                <Plus className="size-4.5" />
                إضافة حملة تشجير
              </Link>
            )}
          </div>

          {/* Embedded stats bar */}
          <div className="mt-6 grid grid-cols-3 border-t border-white/20 pt-4">
            <div className="flex flex-col items-center gap-1 px-1 text-center">
              <span className="flex items-center gap-1.5 text-lg font-extrabold leading-none text-white">
                <Leaf className="size-4 text-amber-300" />
                {successRate}%
              </span>
              <span className="mt-1 text-[9.5px] font-medium text-emerald-50/70">
                معدل النجاح
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-white/20 px-1 text-center">
              <span className="flex items-center gap-1.5 text-lg font-extrabold leading-none text-white">
                <Users className="size-4 text-amber-300" />+{volunteerCount}
              </span>
              <span className="mt-1 text-[9.5px] font-medium text-emerald-50/70">
                متطوع نشط
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 px-1 text-center">
              <span className="flex items-center gap-1.5 text-lg font-extrabold leading-none text-white">
                <Trees className="size-4 text-amber-300" />
                {treeCount}
              </span>
              <span className="mt-1 text-[9.5px] font-medium text-emerald-50/70">
                شجرة مسجلة
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
