"use client";

import React, { useEffect, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/data";
import type { TreeStatus } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

const sizeMap: Record<ModalSize, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-3xl",
  xl: "sm:max-w-5xl",
  full: "sm:max-w-6xl",
};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  size = "lg",
  bare = false,
  className,
  bodyClassName,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  bare?: boolean;
  className?: string;
  bodyClassName?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-forest/45 p-0 backdrop-blur-[3px] animate-fade-in sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Dialog"}
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[30px] bg-cream shadow-[0_40px_120px_-30px_rgba(18,59,42,0.65)] animate-fade-up sm:rounded-[30px]",
          sizeMap[size],
          className,
        )}
      >
        {!bare && (
          <div className="flex items-start justify-between gap-4 border-b border-line/80 bg-white/70 px-5 py-4 backdrop-blur sm:px-7">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-mint-soft text-brand">
                  {icon}
                </div>
              )}
              <div>
                <h2 className="font-display text-lg font-bold leading-tight text-forest sm:text-xl">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-0.5 text-xs text-charcoal/55 sm:text-[13px]">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-white text-charcoal/60 transition hover:bg-sand hover:text-forest"
            >
              <X className="size-4.5" />
            </button>
          </div>
        )}
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto",
            !bare && "px-5 py-5 sm:px-7 sm:py-6",
            bodyClassName,
          )}
        >
          {children}
        </div>
        {footer && (
          <div className="border-t border-line/80 bg-white/80 px-5 py-4 backdrop-blur sm:px-7">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */

type BadgeTone =
  | "forest"
  | "mint"
  | "amber"
  | "orange"
  | "red"
  | "neutral"
  | "white";

const badgeTones: Record<BadgeTone, string> = {
  forest: "bg-forest text-white",
  mint: "bg-mint-soft text-brand-dark",
  amber: "bg-[#FBF2DC] text-[#8A6516]",
  orange: "bg-[#FDEEE2] text-[#B45A12]",
  red: "bg-[#FBE7E7] text-[#B03636]",
  neutral: "bg-sand text-charcoal/70",
  white: "bg-white/15 text-white ring-1 ring-white/25",
};

export function Badge({
  children,
  tone = "mint",
  className,
  dot,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
  dot?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none",
        badgeTones[tone],
        className,
      )}
    >
      {dot && (
        <span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: dot }}
        />
      )}
      {children}
    </span>
  );
}

export function StatusPill({
  status,
  lang,
  className,
}: {
  status: TreeStatus;
  lang: "ar" | "en";
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none",
        className,
      )}
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {lang === "ar" ? meta.ar : meta.en}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Progress                                                            */
/* ------------------------------------------------------------------ */

export function Progress({
  value,
  className,
  barClassName,
  color = "#16865B",
}: {
  value: number;
  className?: string;
  barClassName?: string;
  color?: string;
}) {
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-sand",
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-700", barClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section heading                                                     */
/* ------------------------------------------------------------------ */

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-xl font-bold text-forest sm:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-charcoal/55">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

export function Avatar({
  first,
  last,
  color = "#16865B",
  size = "md",
  className,
}: {
  first: string;
  last: string;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    xs: "size-7 text-[10px]",
    sm: "size-9 text-xs",
    md: "size-11 text-sm",
    lg: "size-14 text-base",
    xl: "size-20 text-2xl",
  };
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-bold text-white ring-2 ring-white/70",
        sizes[size],
        className,
      )}
      style={{
        background: `linear-gradient(145deg, ${color}, #123B2A)`,
      }}
      aria-hidden
    >
      {`${first?.[0] ?? ""}${last?.[0] ?? ""}`.trim() || "ش"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Copy button                                                         */
/* ------------------------------------------------------------------ */

export function CopyButton({
  value,
  labelAr = "نسخ",
  labelEn = "Copy",
  lang = "ar",
  className,
}: {
  value: string;
  labelAr?: string;
  labelEn?: string;
  lang?: "ar" | "en";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-charcoal/65 transition hover:border-brand/40 hover:text-brand",
        className,
      )}
    >
      {copied ? <Check className="size-3.5 text-brand" /> : <Copy className="size-3.5" />}
      {copied ? (lang === "ar" ? "تم النسخ" : "Copied") : lang === "ar" ? labelAr : labelEn}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white/60 px-6 py-12 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-mint-soft text-brand">
        {icon}
      </div>
      <p className="mt-4 font-display text-base font-bold text-forest">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-[13px] text-charcoal/55">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mini metric                                                         */
/* ------------------------------------------------------------------ */

export function MiniMetric({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl bg-cream/80 px-3 py-2.5", className)}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-charcoal/45">
        {icon}
        {label}
      </div>
      <p className="mt-1 font-display text-lg font-bold leading-none text-forest">
        {value}
      </p>
    </div>
  );
}
