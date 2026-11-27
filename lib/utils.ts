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

const EARTH_RADIUS_M = 6_371_008.8;

/**
 * Approximate area of a [lat, lng] ring in square metres. Coordinates are
 * projected around the ring's mean latitude, which is accurate enough for
 * the small campaign sites drawn on the map.
 */
export function polygonAreaSqm(points: [number, number][]): number {
  if (points.length < 3) return 0;
  const meanLat = points.reduce((sum, p) => sum + p[0], 0) / points.length;
  const metresPerDegLat = (Math.PI * EARTH_RADIUS_M) / 180;
  const metresPerDegLng = metresPerDegLat * Math.cos((meanLat * Math.PI) / 180);
  let twiceArea = 0;
  for (let i = 0; i < points.length; i++) {
    const [lat1, lng1] = points[i];
    const [lat2, lng2] = points[(i + 1) % points.length];
    const x1 = lng1 * metresPerDegLng;
    const y1 = lat1 * metresPerDegLat;
    const x2 = lng2 * metresPerDegLng;
    const y2 = lat2 * metresPerDegLat;
    twiceArea += x1 * y2 - x2 * y1;
  }
  return Math.abs(twiceArea) / 2;
}

/** Human-readable site area: hectares for large sites, m² otherwise. */
export function formatArea(areaSqm?: number, lang: Lang = "ar") {
  if (!areaSqm || areaSqm <= 0) return "—";
  const locale = lang === "ar" ? "ar-DZ" : "en-US";
  const num = (value: number, digits = 0) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(
      value,
    );
  if (areaSqm >= 10_000) {
    return `${num(areaSqm / 10_000, 2)} ${lang === "ar" ? "هكتار" : "ha"}`;
  }
  return `${num(Math.round(areaSqm))} m²`;
}
