"use client";

import { useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Sprout,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import Header from "./Header";
import Footer from "./Footer";
import Dashboard from "./Dashboard";
import Municipalities from "./Municipalities";
import Reports from "./Reports";
import Magazine, { ComposePost, PostModal } from "./Magazine";
import UserManagement from "./UserManagement";
import Profile from "./Profile";
import AuthModal from "./AuthModal";
import TreePassport from "./TreePassport";
import QRScanner from "./QRScanner";
import GridSystem from "./GridSystem";
import TreeForm from "./TreeForm";
import PrintQR from "./PrintQR";

/* ------------------------------------------------------------------ */
/* Branded splash shown while local state hydrates                     */
/* ------------------------------------------------------------------ */

function Splash() {
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-cream">
      <div className="flex flex-col items-center gap-5 animate-fade-in">
        <span className="relative grid size-16 place-items-center rounded-[22px] bg-forest text-mint shadow-[0_24px_60px_-24px_rgba(18,59,42,0.85)]">
          <Sprout className="size-9" strokeWidth={1.8} />
          <span className="absolute -bottom-1 -end-1 size-4 rounded-full border-[3px] border-cream bg-brand" />
          <span className="absolute inset-0 rounded-[22px] ring-2 ring-brand/30 animate-ping" />
        </span>
        <div className="text-center">
          <p className="font-display text-lg font-extrabold text-forest">
            شجرتي بصمتي
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-charcoal/35">
            SHAJARATI BASMATI
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 rounded-full bg-brand/70 animate-bounce"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
        <p className="max-w-[240px] text-center text-[10.5px] leading-relaxed text-charcoal/40">
          لا نغرس شجرة ونرحل، بل نتابعها حتى تنمو
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    wrap: "border-brand/25 bg-white",
    iconWrap: "bg-mint-soft text-brand",
    bar: "bg-brand",
  },
  error: {
    icon: AlertCircle,
    wrap: "border-[#B03636]/25 bg-white",
    iconWrap: "bg-[#FBE7E7] text-[#B03636]",
    bar: "bg-[#B03636]",
  },
  info: {
    icon: Info,
    wrap: "border-[#8A6516]/25 bg-white",
    iconWrap: "bg-[#FBF2DC] text-[#8A6516]",
    bar: "bg-gold",
  },
} as const;

function ToastLayer() {
  const { toast, t } = useApp();
  if (!toast) return null;
  const style = TOAST_STYLES[toast.tone];
  const Icon = style.icon;
  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className="no-print pointer-events-none fixed inset-x-0 bottom-5 z-[150] flex justify-center px-4"
    >
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-md items-start gap-3 overflow-hidden rounded-2xl border p-3 shadow-[0_28px_70px_-30px_rgba(18,59,42,0.55)] animate-fade-up",
          style.wrap,
        )}
      >
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl",
            style.iconWrap,
          )}
        >
          <Icon className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[12.5px] font-medium leading-snug text-charcoal/80">
            {toast.message}
          </p>
          <p className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-charcoal/35">
            {t("شجرتي بصمتي", "Shajarati Basmati")}
          </p>
        </div>
        <span className={cn("mt-1 h-8 w-1 shrink-0 rounded-full", style.bar)} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* View switch                                                         */
/* ------------------------------------------------------------------ */

function ViewRouter() {
  const { view, user, isAdmin, isStateAdmin } = useApp();

  // Hard RBAC guard in case state was restored from storage
  if (view === "users" && !isStateAdmin) return <Magazine />;
  if (view === "profile" && !user) return <Magazine />;
  if (view === "reports" && !isAdmin) return <Dashboard />;

  switch (view) {
    case "municipalities":
      return <Municipalities />;
    case "reports":
      return <Reports />;
    case "magazine":
      return <Magazine />;
    case "users":
      return <UserManagement />;
    case "profile":
      return <Profile />;
    case "dashboard":
    default:
      return <Dashboard />;
  }
}

/* ------------------------------------------------------------------ */
/* Modal switch                                                        */
/* ------------------------------------------------------------------ */

function ModalRouter() {
  const { modal } = useApp();
  if (!modal) return null;

  switch (modal.type) {
    case "auth":
      return (
        <AuthModal key={`auth-${modal.mode}`} initialMode={modal.mode} />
      );
    case "passport":
      return <TreePassport key={modal.treeId} treeId={modal.treeId} />;
    case "scanner":
      return <QRScanner key="scanner" />;
    case "campaign":
      return <GridSystem key="campaign" />;
    case "tree-form":
      return <TreeForm key="tree-form" />;
    case "print":
      return <PrintQR key={modal.campaignId} campaignId={modal.campaignId} />;
    case "compose":
      return <ComposePost key={modal.postId ?? "compose"} postId={modal.postId} />;
    case "post":
      return <PostModal key={modal.postId} postId={modal.postId} />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

export default function AppShell() {
  const { hydrated, view, toast } = useApp();

  // Lock body scroll while the splash is visible.
  useEffect(() => {
    if (hydrated) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [hydrated]);

  if (!hydrated) return <Splash />;

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <Header />

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div key={view} className="animate-fade-up">
          <ViewRouter />
        </div>
      </main>

      <Footer />

      <ModalRouter />
      {toast && <ToastLayer />}
    </div>
  );
}
