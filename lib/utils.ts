import type { Lang } from "./types";

export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const pad3 = (n: number) => String(n).padStart(3, "0");

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function formatDate(iso: string, lang: Lang, withYear = true) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ" : "en-GB", {
    day: "numeric",
    month: "long",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(d);
}

export function formatShortDate(iso: string, lang: Lang) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ" : "en-GB", {
    day: "2-digit",
    month: "short",
  }).format(d);
}

export function formatNumber(n: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "ar" ? "ar-DZ" : "en-US").format(n);
}

export function relativeTime(iso: string, lang: Lang) {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const diff = Date.now() - d;
  const minutes = Math.round(diff / 60000);
  const hours = Math.round(diff / 3600000);
  const days = Math.round(diff / 86400000);
  if (minutes < 1) return lang === "ar" ? "الآن" : "just now";
  if (minutes < 60)
    return lang === "ar" ? `منذ ${minutes} د` : `${minutes}m ago`;
  if (hours < 24) return lang === "ar" ? `منذ ${hours} س` : `${hours}h ago`;
  if (days < 30) return lang === "ar" ? `منذ ${days} ي` : `${days}d ago`;
  return formatShortDate(iso, lang);
}

export function daysSince(iso: string) {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return 0;
  return Math.max(0, Math.floor((Date.now() - d) / 86400000));
}

export function initials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.trim() || "ش";
}

export function downloadCSV(
  filename: string,
  rows: Array<Array<string | number>>,
) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function sequenceFromId(id: string) {
  const match = id.match(/-(\d{3})$/);
  return match ? Number(match[1]) : 0;
}
