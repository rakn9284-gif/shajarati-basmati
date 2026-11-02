import type {
  Activity,
  AppUser,
  Campaign,
  Post,
  Tree,
  TreeStatus,
} from "./types";

export const SPECIES = [
  { ar: "زيتون", en: "Olive", art: 0 },
  { ar: "صنوبر حلبي", en: "Aleppo Pine", art: 1 },
  { ar: "خروب", en: "Carob", art: 2 },
  { ar: "أرز أطلسي", en: "Atlas Cedar", art: 3 },
  { ar: "بلوط فليني", en: "Cork Oak", art: 4 },
  { ar: "سرو", en: "Cypress", art: 5 },
  { ar: "تين", en: "Fig", art: 6 },
  { ar: "كالتوس", en: "Eucalyptus", art: 7 },
  { ar: "أكاسيا", en: "Acacia", art: 8 },
  { ar: "رمان", en: "Pomegranate", art: 9 },
] as const;

export type SpeciesMeta = { ar: string; en: string; art: number };

/**
 * Resolves a species by its Arabic or English name. Any manually
 * entered ("نوع آخر / Other") name falls through to a generic meta
 * object with the default illustration (`art: 0`) instead of being
 * silently replaced by the first preset species.
 */
export const getSpecies = (ar: string, en: string): SpeciesMeta => {
  const preset = SPECIES.find((s) => s.ar === ar || s.en === en);
  if (preset) return preset;
  const name = ar.trim() || en.trim();
  if (!name) return SPECIES[0];
  const EnglishMatch = SPECIES.find(
    (s) => s.en.toLowerCase() === en.trim().toLowerCase() && en.trim() !== "",
  );
  if (EnglishMatch) return EnglishMatch;
  return { ar: name, en: en.trim() || name, art: 0 };
};

/* ------------------------------------------------------------------ */
/* Fixed state-admin credentials — verified in the login screen.       */
/* The account is upserted into the cloud `users` table on sign-in.    */
/* ------------------------------------------------------------------ */

export const ADMIN_EMAIL = "admin@skikda.dz";
export const ADMIN_PASSWORD = "Admin@Skikda2026";

export const ROLE_META = {
  state_admin: {
    ar: "أدمن الولاية",
    en: "State Admin",
    color: "#123B2A",
    bg: "#E4F4EA",
  },
  municipality_admin: {
    ar: "أدمن البلدية",
    en: "Municipality Admin",
    color: "#0F6B47",
    bg: "#DDF2E8",
  },
  volunteer: {
    ar: "متطوع",
    en: "Volunteer",
    color: "#8A6516",
    bg: "#FBF2DC",
  },
} as const;

export const STATUS_META: Record<
  TreeStatus,
  { ar: string; en: string; color: string; bg: string }
> = {
  stable: {
    ar: "مستقرة",
    en: "Stable",
    color: "#16865B",
    bg: "#E4F4EA",
  },
  monitoring: {
    ar: "تحت المراقبة",
    en: "Monitoring",
    color: "#B07A12",
    bg: "#FBF2DC",
  },
  risk: {
    ar: "في خطر",
    en: "At Risk",
    color: "#C96A1E",
    bg: "#FDEEE2",
  },
  critical: {
    ar: "حرجة",
    en: "Critical",
    color: "#C0392B",
    bg: "#FBE7E7",
  },
};

/* ------------------------------------------------------------------ */
/* Zero baseline — the platform starts completely empty.               */
/* Every metric in the UI reflects the real persisted database state.  */
/* ------------------------------------------------------------------ */

export const seedTrees: Tree[] = [];
export const seedCampaigns: Campaign[] = [];
export const seedPosts: Post[] = [];
export const seedUsers: AppUser[] = [];
export const seedActivities: Activity[] = [];

/* ------------------------------------------------------------------ */
/* Derived chart data — computed from the live tree database.          */
/* ------------------------------------------------------------------ */

const MONTH_LABELS = [
  { ar: "جانفي", en: "Jan" },
  { ar: "فيفري", en: "Feb" },
  { ar: "مارس", en: "Mar" },
  { ar: "أفريل", en: "Apr" },
  { ar: "ماي", en: "May" },
  { ar: "جوان", en: "Jun" },
  { ar: "جويلية", en: "Jul" },
  { ar: "أوت", en: "Aug" },
  { ar: "سبتمبر", en: "Sep" },
  { ar: "أكتوبر", en: "Oct" },
  { ar: "نوفمبر", en: "Nov" },
  { ar: "ديسمبر", en: "Dec" },
];

export interface MonthlyPoint {
  ar: string;
  en: string;
  value: number;
}

/** Trees planted per calendar month (all years combined) from real data. */
export function monthlyPlanting(trees: Tree[]): MonthlyPoint[] {
  const counts = new Array<number>(12).fill(0);
  for (const tree of trees) {
    const month = Number(tree.plantedAt?.slice(5, 7));
    if (Number.isInteger(month) && month >= 1 && month <= 12) {
      counts[month - 1] += 1;
    }
  }
  return MONTH_LABELS.map((label, i) => ({ ...label, value: counts[i] }));
}

export interface SpeciesPoint {
  ar: string;
  en: string;
  value: number;
  color: string;
}

const SPECIES_CHART_COLORS = [
  "#16865B",
  "#123B2A",
  "#4FA97A",
  "#8CC7A5",
  "#CBE8D7",
  "#0F6B47",
  "#E0A526",
  "#4FA97A",
  "#EE8B3A",
  "#B8E6CE",
];

/** Species distribution from the real trees, ordered most-planted first. */
export function speciesDistribution(trees: Tree[]): SpeciesPoint[] {
  const counts = new Map<string, { ar: string; en: string; value: number }>();
  for (const tree of trees) {
    const key = tree.speciesEn || tree.speciesAr;
    const current = counts.get(key);
    if (current) current.value += 1;
    else counts.set(key, { ar: tree.speciesAr, en: tree.speciesEn, value: 1 });
  }
  return [...counts.values()]
    .sort((a, b) => b.value - a.value)
    .map((entry, i) => ({
      ar: entry.ar,
      en: entry.en,
      value: entry.value,
      color: SPECIES_CHART_COLORS[i % SPECIES_CHART_COLORS.length],
    }));
}
