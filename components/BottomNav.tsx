"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, MapPin, QrCode, User } from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  icon: typeof Home;
};

const LINKS: NavLink[] = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/map", label: "الخريطة", icon: MapPin },
  { href: "/magazine", label: "المجلة", icon: BookOpen },
  { href: "/profile", label: "حسابي", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="no-print fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md rounded-t-3xl border-t border-emerald-100 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md"
    >
      <div className="grid grid-cols-5 items-end">
        {LINKS.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-col items-center justify-center gap-1 py-1.5"
            >
              <Icon
                className={cn(
                  "size-5 transition",
                  active ? "text-emerald-700" : "text-emerald-950/45",
                )}
                strokeWidth={active ? 2.4 : 1.9}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold transition",
                  active ? "text-emerald-700" : "text-emerald-950/50",
                )}
              >
                {item.label}
              </span>
              {active && (
                <span className="absolute -bottom-0.5 h-0.5 w-6 rounded-full bg-emerald-700" />
              )}
            </Link>
          );
        })}

        {/* زر المسح العائم في المنتصف */}
        <div className="relative -top-6 flex flex-col items-center">
          <Link
            href="/scan"
            aria-label="مسح كو آر"
            className={cn(
              "grid size-16 place-items-center rounded-full bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white shadow-lg ring-4 ring-white outline outline-2 outline-amber-400 transition active:scale-95",
              pathname === "/scan" && "from-emerald-950 to-emerald-700",
            )}
          >
            <QrCode className="size-7" strokeWidth={2} />
          </Link>
          <span className="mt-1.5 rounded-full bg-emerald-950 px-2.5 py-0.5 text-[9px] font-bold leading-tight text-white shadow-sm">
            مسح كو آر
          </span>
        </div>

        {LINKS.slice(2).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-col items-center justify-center gap-1 py-1.5"
            >
              <Icon
                className={cn(
                  "size-5 transition",
                  active ? "text-emerald-700" : "text-emerald-950/45",
                )}
                strokeWidth={active ? 2.4 : 1.9}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold transition",
                  active ? "text-emerald-700" : "text-emerald-950/50",
                )}
              >
                {item.label}
              </span>
              {active && (
                <span className="absolute -bottom-0.5 h-0.5 w-6 rounded-full bg-emerald-700" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
