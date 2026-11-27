"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Bell, Sprout, UserRound } from "lucide-react";
import { useApp } from "@/lib/store";
import { Avatar } from "./ui";

/** Mobile-first brand header used on the home dashboard and inner pages. */
export default function Header() {
  const { lang, toggleLang, user, activities } = useApp();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="mb-4 flex items-center justify-between gap-3">
      <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="حملتي — الرئيسية">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-emerald-100 bg-white/95 text-emerald-600 shadow-sm">
          <Sprout className="size-6" strokeWidth={2.2} />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-lg font-extrabold tracking-tight text-emerald-950">
            حملتي
          </span>
          <span className="mt-0.5 block truncate text-[10px] font-semibold text-emerald-700/70">
            — منصة ولاية سكيكدة —
          </span>
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={toggleLang}
          aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          title={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          className="rounded-full border border-emerald-100 bg-white/95 px-2.5 py-1.5 text-[10px] font-extrabold leading-none text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          {lang === "ar" ? "EN" : "عربي"}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((value) => !value)}
            aria-label="الإشعارات"
            aria-expanded={notificationsOpen}
            className="relative grid size-10 place-items-center rounded-full border border-emerald-100 bg-white text-emerald-900 shadow-sm transition hover:border-emerald-300"
          >
            <Bell className="size-[18px]" strokeWidth={1.9} />
            {activities.length > 0 && (
              <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {notificationsOpen && (
            <>
              <button
                type="button"
                aria-label="إغلاق الإشعارات"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute end-0 top-12 z-50 w-[280px] overflow-hidden rounded-3xl border border-emerald-100 bg-white p-3 shadow-xl animate-fade-up">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-950">
                  <Activity className="size-3.5 text-emerald-600" />
                  آخر التحديثات
                </p>
                {activities.length === 0 ? (
                  <p className="py-4 text-center text-[10.5px] text-emerald-950/45">
                    لا توجد تحديثات حالياً.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {activities.slice(0, 4).map((item) => (
                      <p
                        key={item.id}
                        className="rounded-2xl bg-emerald-50/70 px-3 py-2 text-[10.5px] leading-snug text-emerald-950/70"
                      >
                        {item.textAr}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <Link
          href="/profile"
          aria-label="حسابي"
          className="rounded-full p-0.5 ring-2 ring-emerald-500"
        >
          {user ? (
            <Avatar
              first={user.firstName}
              last={user.lastName}
              color={user.avatarColor}
              size="sm"
              className="ring-0"
            />
          ) : (
            <span className="grid size-9 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <UserRound className="size-4.5" />
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
