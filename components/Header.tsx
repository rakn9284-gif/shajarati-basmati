"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  ChevronDown,
  Droplets,
  Globe,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Newspaper,
  Plus,
  ScanLine,
  ShieldCheck,
  Sprout,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { cn, relativeTime } from "@/lib/utils";
import { getMunicipality, municipalityName } from "@/lib/municipalities";
import { ROLE_META } from "@/lib/data";
import { Avatar, Badge } from "./ui";
import type { View } from "@/lib/types";

type NavItem = {
  view: View;
  ar: string;
  arAlt?: string;
  en: string;
  enAlt?: string;
  icon: typeof LayoutDashboard;
  /** Shown only to municipality and state admins */
  adminOnly?: boolean;
  /** Shown only to the state admin */
  stateOnly?: boolean;
  /** Hidden from guests */
  authOnly?: boolean;
};

const NAV: NavItem[] = [
  {
    view: "dashboard",
    ar: "لوحة التحكم",
    arAlt: "الرئيسية",
    en: "Dashboard",
    enAlt: "Home",
    icon: LayoutDashboard,
  },
  { view: "municipalities", ar: "البلديات", en: "Municipalities", icon: MapPin },
  {
    view: "reports",
    ar: "التقارير",
    en: "Reports",
    icon: BarChart3,
    adminOnly: true,
  },
  { view: "magazine", ar: "مجلتي", en: "My Magazine", icon: Newspaper },
  {
    view: "users",
    ar: "إدارة المستخدمين",
    en: "User management",
    icon: Users,
    stateOnly: true,
  },
  {
    view: "profile",
    ar: "حسابي",
    en: "Profile",
    icon: UserRound,
    authOnly: true,
  },
];

const ACTIVITY_ICONS = {
  water: Droplets,
  plant: Sprout,
  campaign: Users,
  issue: ShieldCheck,
  role: ShieldCheck,
  join: UserRound,
};

export default function Header() {
  const {
    lang,
    toggleLang,
    t,
    user,
    view,
    setView,
    openModal,
    activities,
    logout,
    isAdmin,
    isStateAdmin,
  } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setNotifOpen(false);
    setUserOpen(false);
  }, [view]);

  const go = (next: View) => {
    setView(next);
    setMobileOpen(false);
  };

  const navItems = NAV.filter(
    (item) =>
      (!item.stateOnly || isStateAdmin) &&
      (!item.adminOnly || isAdmin) &&
      (!item.authOnly || !!user),
  );

  const role = user ? ROLE_META[user.role] : null;
  const muni = user ? getMunicipality(user.municipalityId) : null;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-300",
          scrolled
            ? "border-line/90 bg-white/85 shadow-[0_10px_40px_-30px_rgba(18,59,42,0.55)] backdrop-blur-xl"
            : "border-transparent bg-cream/70 backdrop-blur-md",
        )}
      >
        <div className="mx-auto flex h-[74px] max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <button
            onClick={() => go("dashboard")}
            className="group flex shrink-0 items-center gap-2.5 text-start"
            aria-label={t("شجرتي بصمتي — الصفحة الرئيسية", "Shajarati Basmati — Home")}
          >
            <span className="relative grid size-11 place-items-center rounded-2xl bg-forest text-mint shadow-[0_10px_24px_-12px_rgba(18,59,42,0.8)] transition group-hover:rotate-3">
              <Sprout className="size-6" strokeWidth={1.9} />
              <span className="absolute -bottom-0.5 -end-0.5 size-3 rounded-full border-2 border-cream bg-brand" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[17px] font-extrabold tracking-tight text-forest sm:text-lg">
                {t("شجرتي بصمتي", "Shajarati Basmati")}
              </span>
              <span className="mt-0.5 hidden max-w-[230px] truncate text-[10px] font-medium text-charcoal/50 md:block">
                {t(
                  "لا نغرس شجرة ونرحل، بل نتابعها حتى تنمو",
                  "Every tree has an identity",
                )}
              </span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="mx-auto hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.view;
              const label =
                item.view === "dashboard" && !isAdmin
                  ? t(item.arAlt ?? item.ar, item.enAlt ?? item.en)
                  : t(item.ar, item.en);
              return (
                <button
                  key={item.view}
                  onClick={() => go(item.view)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold transition",
                    active
                      ? "bg-forest text-white shadow-[0_10px_24px_-16px_rgba(18,59,42,0.9)]"
                      : "text-charcoal/65 hover:bg-mint-soft hover:text-forest",
                  )}
                >
                  <Icon className="size-4" strokeWidth={active ? 2.3 : 1.9} />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="ms-auto flex items-center gap-1.5 lg:ms-0">
            <button
              onClick={toggleLang}
              className="hidden h-9 items-center gap-1.5 rounded-full border border-line bg-white/80 px-3 text-[11px] font-bold text-forest transition hover:border-brand/40 hover:bg-mint-soft sm:flex"
              aria-label={t("تغيير اللغة", "Switch language")}
              title={t("التبديل إلى الإنجليزية", "Switch to Arabic")}
            >
              <Globe className="size-3.5 text-brand" />
              {lang === "ar" ? "EN" : "AR"}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setUserOpen(false);
                }}
                className="relative grid size-9 place-items-center rounded-full border border-line bg-white/80 text-charcoal/60 transition hover:border-brand/40 hover:text-brand"
                aria-label={t("الإشعارات", "Notifications")}
              >
                <Bell className="size-4" />
                {activities.length > 0 && (
                  <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-[#D64545] ring-2 ring-white" />
                )}
              </button>
              {notifOpen && (
                <>
                  <button
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label="close"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div className="absolute end-0 top-12 z-50 w-[330px] overflow-hidden rounded-3xl border border-line bg-white shadow-[0_30px_80px_-30px_rgba(18,59,42,0.5)] animate-fade-up">
                    <div className="flex items-center justify-between border-b border-line/80 px-4 py-3">
                      <div>
                        <p className="font-display text-sm font-bold text-forest">
                          {t("آخر التحديثات", "Latest updates")}
                        </p>
                        <p className="text-[10px] text-charcoal/45">
                          {t("نشاط ميداني مباشر", "Live field activity")}
                        </p>
                      </div>
                      <Badge tone="mint">{activities.length}</Badge>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {activities.slice(0, 5).map((a) => {
                        const Icon = ACTIVITY_ICONS[a.type] ?? Activity;
                        return (
                          <div
                            key={a.id}
                            className="flex gap-3 border-b border-line/50 px-4 py-3 last:border-0 hover:bg-cream/70"
                          >
                            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-mint-soft text-brand">
                              <Icon className="size-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[12px] font-medium leading-snug text-charcoal/80">
                                {lang === "ar" ? a.textAr : a.textEn}
                              </p>
                              <p className="mt-1 text-[10px] text-charcoal/40">
                                {relativeTime(a.at, lang)}
                                {a.municipalityId
                                  ? ` · ${municipalityName(a.municipalityId, lang)}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        go("dashboard");
                      }}
                      className="w-full bg-cream/70 py-2.5 text-center text-[11px] font-semibold text-brand hover:bg-mint-soft"
                    >
                      {t("عرض كل النشاط", "View all activity")}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Auth / profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserOpen((v) => !v);
                    setNotifOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-full border border-line bg-white/80 p-1 pe-2 transition hover:border-brand/40"
                  aria-label={t("قائمة الحساب", "Account menu")}
                >
                  <Avatar
                    first={user.firstName}
                    last={user.lastName}
                    color={user.avatarColor}
                    size="sm"
                  />
                  <span className="hidden max-w-[90px] truncate text-[12px] font-semibold text-forest md:block">
                    {user.firstName}
                  </span>
                  <ChevronDown className="size-3.5 text-charcoal/40" />
                </button>
                {userOpen && (
                  <>
                    <button
                      className="fixed inset-0 z-40 cursor-default"
                      aria-label="close"
                      onClick={() => setUserOpen(false)}
                    />
                    <div className="absolute end-0 top-12 z-50 w-[280px] overflow-hidden rounded-3xl border border-line bg-white shadow-[0_30px_80px_-30px_rgba(18,59,42,0.5)] animate-fade-up">
                      <div className="bg-gradient-to-br from-forest to-brand p-4 text-white">
                        <div className="flex items-center gap-3">
                          <Avatar
                            first={user.firstName}
                            last={user.lastName}
                            color={user.avatarColor}
                            size="md"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-display text-sm font-bold">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="truncate text-[10px] text-white/65">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {role && (
                            <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold ring-1 ring-white/20">
                              {lang === "ar" ? role.ar : role.en}
                            </span>
                          )}
                          {muni && (
                            <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold ring-1 ring-white/20">
                              {muni.nameAr} · {muni.code}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-1.5">
                        <button
                          onClick={() => {
                            setUserOpen(false);
                            go("profile");
                          }}
                          className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[12px] font-medium text-charcoal/75 hover:bg-cream"
                        >
                          <UserRound className="size-4 text-brand" />
                          {t("حسابي وجوازات أشجاري", "My profile & tree passports")}
                        </button>
                        <button
                          onClick={() => {
                            setUserOpen(false);
                            openModal({ type: "scanner" });
                          }}
                          className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[12px] font-medium text-charcoal/75 hover:bg-cream"
                        >
                          <ScanLine className="size-4 text-brand" />
                          {t("مسح رمز QR", "Scan a QR code")}
                        </button>
                        {user.role !== "volunteer" && (
                          <button
                            onClick={() => {
                              setUserOpen(false);
                              openModal({ type: "campaign" });
                            }}
                            className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[12px] font-medium text-charcoal/75 hover:bg-cream"
                          >
                            <Plus className="size-4 text-brand" />
                            {t("حملة تشجير جديدة", "New planting campaign")}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setUserOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[12px] font-medium text-[#B03636] hover:bg-[#FBE7E7]"
                        >
                          <LogOut className="size-4" />
                          {t("تسجيل الخروج", "Sign out")}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-1.5 sm:flex">
                <button
                  onClick={() => openModal({ type: "auth", mode: "login" })}
                  className="rounded-full px-3 py-2 text-[12px] font-semibold text-forest transition hover:bg-mint-soft"
                >
                  {t("تسجيل الدخول", "Sign in")}
                </button>
                <button
                  onClick={() => openModal({ type: "auth", mode: "signup" })}
                  className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-[12px] font-semibold text-white shadow-[0_12px_28px_-18px_rgba(18,59,42,0.9)] transition hover:bg-brand-dark"
                >
                  <Sprout className="size-4" />
                  {t("تطوع معنا", "Volunteer")}
                </button>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              className="grid size-9 place-items-center rounded-full border border-line bg-white/80 text-forest lg:hidden"
              aria-label={t("القائمة", "Menu")}
            >
              <Menu className="size-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            className="absolute inset-0 bg-forest/40 backdrop-blur-sm"
            aria-label="close"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-0 top-0 rounded-b-[32px] bg-cream p-5 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-2xl bg-forest text-mint">
                  <Sprout className="size-5" />
                </span>
                <div>
                  <p className="font-display text-base font-extrabold text-forest">
                    {t("شجرتي بصمتي", "Shajarati Basmati")}
                  </p>
                  <p className="text-[10px] text-charcoal/45">
                    {t("سكيكدة · 38 بلدية", "Skikda · 38 municipalities")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="grid size-9 place-items-center rounded-full border border-line bg-white text-charcoal/60"
                aria-label={t("إغلاق", "Close")}
              >
                <X className="size-4.5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = view === item.view;
                const label =
                  item.view === "dashboard" && !isAdmin
                    ? t(item.arAlt ?? item.ar, item.enAlt ?? item.en)
                    : t(item.ar, item.en);
                return (
                  <button
                    key={item.view}
                    onClick={() => go(item.view)}
                    className={cn(
                      "flex items-center gap-2 rounded-2xl px-3 py-3 text-[13px] font-semibold transition",
                      active
                        ? "bg-forest text-white"
                        : "bg-white text-charcoal/70",
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={toggleLang}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-2xl border border-line bg-white text-[12px] font-bold text-forest"
              >
                <Globe className="size-4 text-brand" />
                {lang === "ar" ? "English" : "العربية"}
              </button>
              {user ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    go("profile");
                  }}
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-forest text-[12px] font-semibold text-white"
                >
                  <UserRound className="size-4" />
                  {t("حسابي", "My profile")}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    openModal({ type: "auth", mode: "signup" });
                  }}
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-forest text-[12px] font-semibold text-white"
                >
                  <Sprout className="size-4" />
                  {t("تطوع معنا", "Volunteer")}
                </button>
              )}
            </div>
            {!user && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openModal({ type: "auth", mode: "login" });
                }}
                className="mt-2 w-full rounded-2xl border border-line bg-white py-2.5 text-[12px] font-semibold text-forest"
              >
                {t("تسجيل الدخول", "Sign in")}
              </button>
            )}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-charcoal/40">
              <ShieldCheck className="size-3.5 text-brand" />
              {t(
                "منصة معتمدة لمتابعة الغطاء النباتي بولاية سكيكدة",
                "Official tree-tracking platform for Skikda Wilaya",
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
