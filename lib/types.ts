export type Lang = "ar" | "en";

export type Role = "state_admin" | "municipality_admin" | "volunteer";

export type TreeStatus = "stable" | "monitoring" | "risk" | "critical";

export type MunicipalityStatus = TreeStatus;

export type View =
  | "dashboard"
  | "municipalities"
  | "reports"
  | "magazine"
  | "users"
  | "profile";

export type LayoutMode = "grid" | "rows";

export interface Municipality {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  lat: number;
  lng: number;
  trees: number;
  planted: number;
  alive: number;
  needsAttention: number;
  volunteers: number;
  status: MunicipalityStatus;
  coastal?: boolean;
  adminName: string;
  population: number;
}

export interface Tree {
  id: string;
  campaignId?: string;
  municipalityId: string;
  speciesAr: string;
  speciesEn: string;
  plantedAt: string;
  lastWatered: string;
  row: number;
  col: number;
  status: TreeStatus;
  health: number;
  lat: number;
  lng: number;
  notesAr?: string;
  notesEn?: string;
  plantedBy: string;
  art: number;
  waterings: number;
  photo?: string;
}

export interface Campaign {
  id: string;
  nameAr: string;
  nameEn: string;
  municipalityId: string;
  date: string;
  target: number;
  planted: number;
  layout: LayoutMode;
  spacing: number;
  speciesAr: string;
  speciesEn: string;
  lat: number;
  lng: number;
  status: "planned" | "active" | "completed";
  createdAt: string;
}

export type PostCategory = "campaign" | "news" | "gallery" | "tip";

export interface Post {
  id: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  bodyAr: string;
  bodyEn: string;
  category: PostCategory;
  author: string;
  authorId?: string;
  municipalityId: string;
  date: string;
  likes: number;
  art: number;
  imageUrl?: string;  // الصورة الرئيسية للمقال
  images?: string[];  // ألبوم صور متعدد للمعرض التفاعلي (Gallery)
  featured?: boolean;
  hidden?: boolean;
}

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  municipalityId?: string;
  healthLimitations?: string;
  joinedAt: string;
  avatarColor: string;
  treesWatered: number;
}

export type ActivityType =
  | "water"
  | "plant"
  | "campaign"
  | "issue"
  | "role"
  | "join";

export interface Activity {
  id: string;
  type: ActivityType;
  textAr: string;
  textEn: string;
  at: string;
  municipalityId?: string;
  actor: string;
  /** الشجرة المستهدفة — تُغذّي سجل السقاية في جواز السفر */
  treeId?: string;
}

export type ModalState =
  | { type: "auth"; mode: "login" | "signup" }
  | { type: "passport"; treeId: string }
  | { type: "scanner" }
  | { type: "campaign" }
  | { type: "tree-form" }
  | { type: "print"; campaignId: string }
  | { type: "compose"; postId?: string }
  | { type: "post"; postId: string }
  | null;

export interface CampaignInput {
  nameAr: string;
  nameEn: string;
  municipalityId: string;
  date: string;
  count: number;
  layout: LayoutMode;
  spacing: number;
  speciesAr: string;
  speciesEn: string;
  lat: number;
  lng: number;
}

export interface TreeInput {
  municipalityId: string;
  speciesAr: string;
  speciesEn: string;
  plantedAt: string;
  row: number;
  col: number;
  lat: number;
  lng: number;
  notesAr?: string;
  notesEn?: string;
}

export interface PostInput {
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  bodyAr: string;
  bodyEn: string;
  category: PostCategory;
  municipalityId: string;
  imageUrl?: string;
  images?: string[]; // إمكانية إدخال مصفوفة صور المعرض
}