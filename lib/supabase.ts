import { createClient } from "@supabase/supabase-js";
import type {
  Activity,
  ActivityType,
  AppUser,
  Campaign,
  LayoutMode,
  Post,
  PostCategory,
  Role,
  Tree,
  TreeStatus,
} from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** True when .env.local carries a full Supabase project configuration. */
export const isCloudConfigured = () =>
  supabaseUrl.startsWith("https://") && supabaseAnonKey.length > 20;

/* ------------------------------------------------------------------ */
/* Row types (snake_case as stored in PostgreSQL)                      */
/* ------------------------------------------------------------------ */

interface TreeRow {
  id: string;
  campaign_id: string | null;
  municipality_id: string;
  species_ar: string;
  species_en: string;
  planted_at: string;
  last_watered: string | null;
  row: number;
  col: number;
  status: TreeStatus;
  health: number;
  lat: number;
  lng: number;
  notes_ar: string | null;
  notes_en: string | null;
  planted_by: string | null;
  art: number;
  waterings: number;
}

interface CampaignRow {
  id: string;
  name_ar: string;
  name_en: string;
  municipality_id: string;
  date: string;
  target: number;
  planted: number;
  layout: LayoutMode;
  spacing: number;
  species_ar: string | null;
  species_en: string | null;
  lat: number;
  lng: number;
  status: Campaign["status"];
  created_at: string;
}

interface PostRow {
  id: string;
  title_ar: string;
  title_en: string;
  excerpt_ar: string | null;
  excerpt_en: string | null;
  body_ar: string;
  body_en: string | null;
  category: PostCategory;
  image_url: string | null;
  images: string[] | null;
  author: string;
  author_id: string | null;
  municipality_id: string | null;
  date: string;
  likes: number;
  art: number;
  featured: boolean | null;
  hidden: boolean | null;
}

export interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: Role;
  municipality_id: string | null;
  health_limitations: string | null;
  joined_at: string;
  avatar_color: string;
  trees_watered: number;
}

interface ActivityRow {
  id: string;
  type: ActivityType;
  text_ar: string;
  text_en: string;
  at: string;
  municipality_id: string | null;
  actor: string | null;
  tree_id: string | null;
}

/* ------------------------------------------------------------------ */
/* Row ⇄ domain mappers                                                */
/* ------------------------------------------------------------------ */

export function toTree(r: TreeRow): Tree {
  return {
    id: r.id,
    campaignId: r.campaign_id ?? undefined,
    municipalityId: r.municipality_id,
    speciesAr: r.species_ar,
    speciesEn: r.species_en,
    plantedAt: r.planted_at,
    lastWatered: r.last_watered ?? r.planted_at,
    row: r.row,
    col: r.col,
    status: r.status,
    health: r.health,
    lat: r.lat,
    lng: r.lng,
    notesAr: r.notes_ar ?? undefined,
    notesEn: r.notes_en ?? undefined,
    plantedBy: r.planted_by ?? "",
    art: r.art,
    waterings: r.waterings,
  };
}

export const treeRowOf = (t: Tree): TreeRow => ({
  id: t.id,
  campaign_id: t.campaignId ?? null,
  municipality_id: t.municipalityId,
  species_ar: t.speciesAr,
  species_en: t.speciesEn,
  planted_at: t.plantedAt,
  last_watered: t.lastWatered || null,
  row: t.row,
  col: t.col,
  status: t.status,
  health: t.health,
  lat: t.lat,
  lng: t.lng,
  notes_ar: t.notesAr ?? null,
  notes_en: t.notesEn ?? null,
  planted_by: t.plantedBy || null,
  art: t.art,
  waterings: t.waterings,
});

export function toCampaign(r: CampaignRow): Campaign {
  return {
    id: r.id,
    nameAr: r.name_ar,
    nameEn: r.name_en,
    municipalityId: r.municipality_id,
    date: r.date,
    target: r.target,
    planted: r.planted,
    layout: r.layout,
    spacing: Number(r.spacing),
    speciesAr: r.species_ar ?? "",
    speciesEn: r.species_en ?? "",
    lat: r.lat,
    lng: r.lng,
    status: r.status,
    createdAt: r.created_at,
  };
}

export const campaignRowOf = (c: Campaign): CampaignRow => ({
  id: c.id,
  name_ar: c.nameAr,
  name_en: c.nameEn,
  municipality_id: c.municipalityId,
  date: c.date,
  target: c.target,
  planted: c.planted,
  layout: c.layout,
  spacing: c.spacing,
  species_ar: c.speciesAr || null,
  species_en: c.speciesEn || null,
  lat: c.lat,
  lng: c.lng,
  status: c.status,
  created_at: c.createdAt,
});

export function toPost(r: PostRow): Post {
  return {
    id: r.id,
    titleAr: r.title_ar,
    titleEn: r.title_en,
    excerptAr: r.excerpt_ar ?? "",
    excerptEn: r.excerpt_en ?? "",
    bodyAr: r.body_ar,
    bodyEn: r.body_en ?? "",
    category: r.category,
    author: r.author,
    authorId: r.author_id ?? undefined,
    municipalityId: r.municipality_id ?? "",
    date: r.date,
    likes: r.likes,
    art: r.art,
    imageUrl: r.image_url ?? undefined,
    images: r.images ?? undefined,
    featured: r.featured ?? false,
    hidden: r.hidden ?? false,
  };
}

export const postRowOf = (p: Post): PostRow => ({
  id: p.id,
  title_ar: p.titleAr,
  title_en: p.titleEn,
  excerpt_ar: p.excerptAr || null,
  excerpt_en: p.excerptEn || null,
  body_ar: p.bodyAr,
  body_en: p.bodyEn || null,
  category: p.category,
  image_url: p.imageUrl ?? null,
  images: p.images ?? null,
  author: p.author,
  author_id: p.authorId ?? null,
  municipality_id: p.municipalityId || null,
  date: p.date,
  likes: p.likes,
  art: p.art,
  featured: p.featured ?? false,
  hidden: p.hidden ?? false,
});

export function toUser(r: UserRow): AppUser {
  return {
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email,
    password: r.password,
    role: r.role,
    municipalityId: r.municipality_id ?? undefined,
    healthLimitations: r.health_limitations ?? undefined,
    joinedAt: r.joined_at,
    avatarColor: r.avatar_color,
    treesWatered: r.trees_watered,
  };
}

export const userRowOf = (u: AppUser): UserRow => ({
  id: u.id,
  first_name: u.firstName,
  last_name: u.lastName,
  email: u.email,
  password: u.password,
  role: u.role,
  municipality_id: u.municipalityId ?? null,
  health_limitations: u.healthLimitations ?? null,
  joined_at: u.joinedAt,
  avatar_color: u.avatarColor,
  trees_watered: u.treesWatered,
});

export function toActivity(r: ActivityRow): Activity {
  return {
    id: r.id,
    type: r.type,
    textAr: r.text_ar,
    textEn: r.text_en,
    at: r.at,
    municipalityId: r.municipality_id ?? undefined,
    actor: r.actor ?? "",
  };
}

export const activityRowOf = (
  a: Omit<Activity, "id" | "at"> & { treeId?: string },
): ActivityRow => ({
  id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  type: a.type,
  text_ar: a.textAr,
  text_en: a.textEn,
  at: new Date().toISOString(),
  municipality_id: a.municipalityId ?? null,
  actor: a.actor ?? null,
  tree_id: a.treeId ?? null,
});

/* ------------------------------------------------------------------ */
/* fetchCloudData — one call that loads the whole wilaya state         */
/* ------------------------------------------------------------------ */

export interface CloudData {
  trees: Tree[];
  campaigns: Campaign[];
  posts: Post[];
  users: AppUser[];
  activities: Activity[];
  /** unix ms when this snapshot was taken */
  fetchedAt: number;
}

/**
 * Fetches trees, campaigns, posts, users and recent activities from
 * Supabase in parallel. Throws when the remote is unreachable — callers
 * should fall back to the last-known local snapshot.
 */
export async function fetchCloudData(): Promise<CloudData> {
  const [trees, campaigns, posts, users, activities] = await Promise.all([
    supabase.from("trees").select("*").order("id", { ascending: false }),
    supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
    supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(120),
    supabase.from("users").select("*").order("joined_at", { ascending: false }),
    supabase.from("activities").select("*").order("at", { ascending: false }).limit(80),
  ]);

  const failed = [trees.error, campaigns.error, posts.error, users.error, activities.error]
    .find(Boolean);
  if (failed) throw new Error(failed.message);

  return {
    trees: (trees.data ?? []).map((r) => toTree(r as TreeRow)),
    campaigns: (campaigns.data ?? []).map((r) => toCampaign(r as CampaignRow)),
    posts: (posts.data ?? []).map((r) => toPost(r as PostRow)),
    users: (users.data ?? []).map((r) => toUser(r as UserRow)),
    activities: (activities.data ?? []).map((r) => toActivity(r as ActivityRow)),
    fetchedAt: Date.now(),
  };
}

/* ------------------------------------------------------------------ */
/* Mutation helpers — called right after optimistic local updates      */
/* ------------------------------------------------------------------ */

export const cloudInsertTrees = async (trees: Tree[]) =>
  supabase.from("trees").upsert(trees.map(treeRowOf));

export const cloudUpsertTree = async (tree: Tree) =>
  supabase.from("trees").upsert(treeRowOf(tree));

/**
 * One-click watering: increments the counter, stamps today and relaxes
 * the status — exactly what the passport modal shows afterwards.
 */
export const cloudWaterTree = async (
  treeId: string,
  patch: Pick<Tree, "waterings" | "lastWatered" | "health" | "status">,
) =>
  supabase
    .from("trees")
    .update({
      waterings: patch.waterings,
      last_watered: patch.lastWatered || null,
      health: patch.health,
      status: patch.status,
    })
    .eq("id", treeId);

export const cloudUpsertCampaign = async (campaign: Campaign) =>
  supabase.from("campaigns").upsert(campaignRowOf(campaign));

export const cloudUpsertPost = async (post: Post) =>
  supabase.from("posts").upsert(postRowOf(post));

export const cloudDeletePost = async (postId: string) =>
  supabase.from("posts").delete().eq("id", postId);

export const cloudInsertUser = async (user: AppUser) =>
  supabase.from("users").insert(userRowOf(user));

/** Full upsert — used by the fixed state-admin account bootstrap. */
export const cloudUpsertUser = async (user: AppUser) =>
  supabase.from("users").upsert(userRowOf(user));

/** Field ⇄ column mapping for partial user updates. */
const USER_FIELD_COLUMN: Partial<Record<keyof AppUser, string>> = {
  firstName: "first_name",
  lastName: "last_name",
  email: "email",
  password: "password",
  role: "role",
  municipalityId: "municipality_id",
  healthLimitations: "health_limitations",
  avatarColor: "avatar_color",
  treesWatered: "trees_watered",
};

/**
 * Partial user update aimed at the Supabase row. The row is matched by
 * `id` first; when that matches nothing (e.g. device-local id drift) the
 * caller may pass the target's `email` as a secondary key. PostgREST
 * reports 0 matched rows as *success with an empty array*, so we inspect
 * `data.length` rather than `error` to detect the miss.
 */
export const cloudUpdateUser = async (
  userId: string,
  patch: Partial<AppUser>,
  fallbackEmail?: string,
) => {
  const row: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(USER_FIELD_COLUMN)) {
    if (key in patch) {
      const value = (patch as Record<string, unknown>)[key];
      row[column] = value === undefined ? null : value;
    }
  }

  // Primary attempt: exact id match.
  const byId = await supabase.from("users").update(row).eq("id", userId).select("id");
  if (!byId.error && (byId.data?.length ?? 0) > 0) return byId;

  const email = fallbackEmail ?? patch.email;
  if (!email) return byId;

  // Fallback: the email column is unique in the schema.
  return supabase.from("users").update(row).eq("email", email).select("id");
};

export const cloudInsertActivity = async (activity: ActivityRow) =>
  supabase.from("activities").insert(activity);
