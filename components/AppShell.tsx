"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Info, Sprout } from "lucide-react";
import { useApp } from "@/lib/store";
import type { ModalState } from "@/lib/types";
import { cn } from "@/lib/utils";
import AuthModal from "./AuthModal";
import TreePassport from "./TreePassport";
import CampaignSite from "./CampaignSite";
import QRScanner from "./QRScanner";
import GridSystem from "./GridSystem";
import TreeForm from "./TreeForm";
import PrintQR from "./PrintQR";
import { ComposePost, PostModal } from "./Magazine";

/* ------------------------------------------------------------------ */
/* Branded splash while local state hydrates                            */
/* ------------------------------------------------------------------ */

function Splash() {
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
      <div className="flex flex-col items-center gap-5 animate-fade-in">
        <span className="relative grid size-16 place-items-center rounded-[22px] bg-gradient-to-br from-emerald-800 to-emerald-600 text-white shadow-[0_24px_60px_-24px_rgba(6,78,59,0.85)]">
          <Sprout className="size-9" strokeWidth={1.8} />
          <span className="absolute -bottom-1 -end-1 size-4 rounded-full border-[3px] border-white bg-amber-400" />
          <span className="absolute inset-0 rounded-[22px] ring-2 ring-emerald-500/30 animate-ping" />
        </span>
        <div className="text-center">
          <p className="text-lg font-extrabold text-emerald-950">حملتي</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-700/40">
            HAMALATI
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 rounded-full bg-emerald-600/70 animate-bounce"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
        <p className="max-w-[260px] text-center text-[10.5px] leading-relaxed text-emerald-950/40">
          نُدير حملات التشجير ونوثّق مواقع الغرس حتى تنمو
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
    wrap: "border-emerald-100 bg-white",
    iconWrap: "bg-emerald-50 text-emerald-700",
    bar: "bg-emerald-600",
  },
  error: {
    icon: AlertCircle,
    wrap: "border-red-200 bg-white",
    iconWrap: "bg-red-50 text-red-600",
    bar: "bg-red-600",
  },
  info: {
    icon: Info,
    wrap: "border-amber-200 bg-white",
    iconWrap: "bg-amber-50 text-amber-700",
    bar: "bg-amber-500",
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
      className="no-print pointer-events-none fixed inset-x-0 bottom-24 z-[150] flex justify-center px-4"
    >
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-md items-start gap-3 overflow-hidden rounded-2xl border p-3 shadow-[0_28px_70px_-30px_rgba(6,78,59,0.55)] animate-fade-up",
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
          <p className="text-[12.5px] font-medium leading-snug text-emerald-950/80">
            {toast.message}
          </p>
          <p className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-emerald-950/35">
            {t("حملتي", "Hamalati")}
          </p>
        </div>
        <span className={cn("mt-1 h-8 w-1 shrink-0 rounded-full", style.bar)} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal switch                                                        */
/* ------------------------------------------------------------------ */

function ModalRouter() {
  const { modal } = useApp();
  if (!modal) return null;

  switch (modal.type) {
    case "auth":
      return <AuthModal key={`auth-${modal.mode}`} initialMode={modal.mode} />;
    case "passport":
      return <TreePassport key={modal.treeId} treeId={modal.treeId} />;
    case "site":
      return <CampaignSite key={modal.campaignId} campaignId={modal.campaignId} />;
    case "scanner":
      return <QRScanner key="scanner" />;
    case "campaign":
      return (
        <GridSystem
          key={`campaign-${modal.campaignId ?? "new"}`}
          campaignId={modal.campaignId}
        />
      );
    case "tree-form":
      return (
        <TreeForm
          key={`tree-form-${modal.campaignId ?? "new"}`}
          campaignId={modal.campaignId}
        />
      );
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

export default function AppShell({
  children,
  initialModal,
}: {
  children: React.ReactNode;
  initialModal?: ModalState;
}) {
  const { hydrated, toast, openModal } = useApp();
  const launchedModal = useRef<string | null>(null);

  useEffect(() => {
    if (hydrated) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !initialModal) return;
    const key = JSON.stringify(initialModal);
    if (launchedModal.current === key) return;
    launchedModal.current = key;
    openModal(initialModal);
  }, [hydrated, initialModal, openModal]);

  if (!hydrated) return <Splash />;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4 sm:max-w-2xl sm:px-6 sm:pt-6">
        <div className="animate-fade-up">{children}</div>
      </main>

      <ModalRouter />
      {toast && <ToastLayer />}
    </div>
  );
}
