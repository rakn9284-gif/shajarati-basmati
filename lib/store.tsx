"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  Activity,
  AppUser,
  Campaign,
  CampaignInput,
  Lang,
  ModalState,
  Municipality,
  Post,
  PostInput,
  Role,
  Tree,
  TreeInput,
  View,
} from "./types";
import {
  getSpecies,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} from "./data";
import { computeMunicipalities, municipalityById } from "./municipalities";
import { pad3, sequenceFromId, todayISO } from "./utils";
import {
  cloudDeletePost,
  cloudInsertActivity,
  cloudInsertUser,
  cloudInsertTrees,
  cloudUpdateUser,
  cloudUpsertCampaign,
  cloudUpsertPost,
  cloudUpsertTree,
  cloudUpsertUser,
  cloudWaterTree,
  fetchCloudData,
  isCloudConfigured,
  supabase,
  toUser,
  activityRowOf,
} from "./supabase";
import type { UserRow } from "./supabase";

const STORAGE_KEY = "shajarati-basmati-v2";
const LEGACY_STORAGE_KEY = "shajarati-basmati-v1";

type Toast = { id: number; message: string; tone: "success" | "error" | "info" };

export type CloudStatus = "checking" | "online" | "offline";

type PersistedState = {
  lang: Lang;
  user: AppUser | null;
  users: AppUser[];
  trees: Tree[];
  campaigns: Campaign[];
  posts: Post[];
  activities: Activity[];
  likedPosts: string[];
};

type Stats = {
  totalTrees: number;
  planted: number;
  alive: number;
  needsAttention: number;
  volunteers: number;
  survivalRate: number;
  waterings: number;
  campaigns: number;
};

type AppContextValue = {
  /* I18n / UI */
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (ar: string, en: string) => string;
  hydrated: boolean;
  toast: Toast | null;
  notify: (
    ar: string,
    en?: string | Toast["tone"],
    tone?: Toast["tone"],
  ) => void;

  /* Cloud (Supabase) */
  cloudStatus: CloudStatus;
  refreshCloud: () => Promise<void>;

  /* Data */
  user: AppUser | null;
  users: AppUser[];
  trees: Tree[];
  campaigns: Campaign[];
  posts: Post[];
  activities: Activity[];
  likedPosts: string[];
  municipalities: Municipality[];
  stats: Stats;
  findTree: (id: string) => Tree | undefined;

  /* RBAC helpers */
  isAdmin: boolean;
  isStateAdmin: boolean;
  canManagePost: (post: Post) => boolean;

  /* Navigation */
  view: View;
  setView: (view: View) => void;
  modal: ModalState;
  openModal: (modal: ModalState) => void;
  closeModal: () => void;
  activeMunicipality: string | null;
  setActiveMunicipality: (id: string | null) => void;

  /* Auth */
  login: (email: string, password: string) => boolean;
  signup: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    municipalityId: string;
    healthLimitations?: string;
  }) => boolean;
  logout: () => void;

  /* Mutations */
  waterTree: (treeId: string) => boolean;
  escalateTree: (treeId: string, note: string) => void;
  createCampaign: (input: CampaignInput) => string | null;
  addTree: (input: TreeInput) => string | null;
  savePost: (input: PostInput, postId?: string) => void;
  deletePost: (postId: string) => void;
  togglePostVisibility: (postId: string) => void;
  likePost: (postId: string) => void;
  assignRole: (
    userId: string,
    role: Role,
    municipalityId?: string,
  ) => void;
  updateProfile: (patch: Partial<AppUser>) => void;
};

const DEFAULT_USERS: AppUser[] = [];

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");
  const [user, setUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>(DEFAULT_USERS);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [view, setViewState] = useState<View>("dashboard");
  const [modal, setModal] = useState<ModalState>(null);
  const [activeMunicipality, setActiveMunicipality] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>(() =>
    typeof window !== "undefined" && isCloudConfigured() ? "checking" : "offline",
  );
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        if (parsed.lang === "ar" || parsed.lang === "en") setLangState(parsed.lang);
        if (parsed.user) setUser(parsed.user);
        if (Array.isArray(parsed.users) && parsed.users.length > 0) {
          setUsers(parsed.users);
        } else {
          setUsers(DEFAULT_USERS);
        }
        if (Array.isArray(parsed.trees)) setTrees(parsed.trees);
        if (Array.isArray(parsed.campaigns)) setCampaigns(parsed.campaigns);
        if (Array.isArray(parsed.posts)) setPosts(parsed.posts);
        if (Array.isArray(parsed.activities)) setActivities(parsed.activities);
        if (Array.isArray(parsed.likedPosts)) setLikedPosts(parsed.likedPosts);
      }
    } catch {
      setUsers(DEFAULT_USERS);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: PersistedState = {
        lang,
        user,
        users,
        trees,
        campaigns,
        posts,
        activities,
        likedPosts,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [
    hydrated,
    lang,
    user,
    users,
    trees,
    campaigns,
    posts,
    activities,
    likedPosts,
  ]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const t = useCallback(
    (ar: string, en: string) => (lang === "ar" ? ar : en),
    [lang],
  );

  const notify = useCallback(
    (
      ar: string,
      en?: string | Toast["tone"],
      toneArg?: Toast["tone"],
    ) => {
      const enIsTone = en === "success" || en === "error" || en === "info";
      const tone: Toast["tone"] = enIsTone ? en : toneArg ?? "success";
      const message = enIsTone || en === undefined
        ? ar
        : lang === "ar"
          ? ar
          : en;
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast({ id: Date.now(), message, tone });
      toastTimer.current = setTimeout(() => setToast(null), 3800);
    },
    [lang],
  );

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleLang = useCallback(
    () => setLangState((prev) => (prev === "ar" ? "en" : "ar")),
    [],
  );

  const refreshCloud = useCallback(async () => {
    if (!isCloudConfigured()) {
      setCloudStatus("offline");
      return;
    }
    setCloudStatus((prev) => (prev === "online" ? prev : "checking"));
    try {
      const snapshot = await fetchCloudData();
      setTrees(snapshot.trees);
      setCampaigns(snapshot.campaigns);
      setPosts(snapshot.posts);
      setUsers(snapshot.users);
      setActivities(snapshot.activities);
      setCloudStatus("online");
    } catch {
      setCloudStatus("offline");
      notify(
        "تعذّر الاتصال بالسحابة — يُعرض آخر نسخة محفوظة محلياً.",
        "Cloud unreachable — showing the last locally cached snapshot.",
        "error",
      );
    }
  }, [notify]);

  useEffect(() => {
    if (!hydrated) return;
    if (isCloudConfigured()) void refreshCloud();
  }, [hydrated, refreshCloud]);

  /* 📡 مستمع لحظي لجدول users — تصل الترقية أو التعديلات لهاتف المستهدف
     فورًا عبر Realtime دون انتظار إعادة تحميل الصفحة. */
  useEffect(() => {
    if (!hydrated || !isCloudConfigured()) return;

    const channel = supabase
      .channel("users-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const removedId = (payload.old as { id?: string }).id;
            if (removedId) {
              setUsers((prev) => prev.filter((u) => u.id !== removedId));
              setUser((cur) => (cur?.id === removedId ? null : cur));
            }
            return;
          }
          const row = (payload.new as UserRow | null) ?? null;
          if (!row?.id) return;
          const incoming = toUser(row);
          setUsers((prev) =>
            prev.some((u) => u.id === incoming.id)
              ? prev.map((u) => (u.id === incoming.id ? incoming : u))
              : [incoming, ...prev],
          );
          // الهاتف المستهدف: يُحدَّث المستخدم الحالي لحظيًا إذا كان هو الهدف.
          setUser((cur) =>
            cur && cur.id === incoming.id ? { ...cur, ...incoming } : cur,
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [hydrated]);

  const isAdmin = !!user && user.role !== "volunteer";
  const isStateAdmin = user?.role === "state_admin";

  const canManagePost = useCallback(
    (post: Post) => {
      if (!user) return false;
      if (user.role === "state_admin") return true;
      if (
        user.role === "municipality_admin" &&
        user.municipalityId &&
        post.municipalityId === user.municipalityId
      ) {
        return true;
      }
      return false;
    },
    [user],
  );

  const setView = useCallback(
    (next: View) => {
      if (next === "users" && !isStateAdmin) {
        setViewState("magazine");
        notify(
          "إدارة المستخدمين متاحة لأدمن الولاية فقط.",
          "User management is reserved for the state admin.",
          "error",
        );
        return;
      }
      setViewState(next);
      if (typeof window !== "undefined")
        window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [isStateAdmin, notify],
  );

  const openModal = useCallback(
    (next: ModalState) => {
      if (!next) {
        setModal(null);
        return;
      }
      if (next.type === "scanner" && !user) {
        notify(
          "سجّل الدخول أو أنشئ حساباً متطوعاً لاستخدام الماسح.",
          "Sign in or create a volunteer account to use the scanner.",
          "info",
        );
        setModal({ type: "auth", mode: "login" });
        return;
      }
      if (
        (next.type === "campaign" ||
          next.type === "tree-form" ||
          next.type === "print" ||
          next.type === "compose") &&
        !isAdmin
      ) {
        if (!user) {
          notify(
            "هذه الوظيفة متاحة بعد تسجيل الدخول بصلاحية إدارية.",
            "This action requires an admin account.",
            "info",
          );
          setModal({ type: "auth", mode: "login" });
        } else {
          notify(
            "إنشاء المحتوى والطباعة متاحة لأدمن البلدية والولاية فقط.",
            "Creating and printing content is reserved for admins.",
            "error",
          );
        }
        return;
      }
      setModal(next);
    },
    [user, isAdmin, notify],
  );

  const closeModal = useCallback(() => setModal(null), []);

  const fullName = (u: AppUser) => `${u.firstName} ${u.lastName}`.trim();

  const municipalities = useMemo<Municipality[]>(
    () => computeMunicipalities(trees, users),
    [trees, users],
  );

  const stats = useMemo<Stats>(() => {
    const totalTrees = trees.length;
    const alive = trees.filter((tr) => tr.status !== "critical").length;
    return {
      totalTrees,
      planted: totalTrees,
      alive,
      needsAttention: trees.filter(
        (tr) => tr.status === "risk" || tr.status === "critical",
      ).length,
      volunteers: users.filter((u) => u.role !== "state_admin").length,
      survivalRate: totalTrees ? Math.round((alive / totalTrees) * 100) : 0,
      waterings: trees.reduce((sum, tr) => sum + tr.waterings, 0),
      campaigns: campaigns.length,
    };
  }, [trees, users, campaigns.length]);

  const findTree = useCallback(
    (id: string) => trees.find((tr) => tr.id === id),
    [trees],
  );

  const pushActivity = useCallback(
    (activity: Omit<Activity, "id" | "at"> & { treeId?: string }) => {
      const row = activityRowOf(activity);
      setActivities((prev) =>
        [
          {
            ...activity,
            id: row.id,
            at: row.at,
          },
          ...prev,
        ].slice(0, 60),
      );
      void cloudInsertActivity(row).catch(() => undefined);
    },
    [],
  );

  const login = useCallback(
    (email: string, password: string) => {
      const normalized = email.trim().toLowerCase();

      if (normalized === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const existing = users.find(
          (u) => u.email.toLowerCase() === normalized,
        );
        const adminUser: AppUser = existing
          ? {
              ...existing,
              firstName: "مدير",
              lastName: "الولاية",
              email: ADMIN_EMAIL,
              password: ADMIN_PASSWORD,
              role: "state_admin",
              municipalityId: "skikda-center",
            }
          : {
              id: "u-admin-skikda",
              firstName: "مدير",
              lastName: "الولاية",
              email: ADMIN_EMAIL,
              password: ADMIN_PASSWORD,
              role: "state_admin",
              municipalityId: "skikda-center",
              joinedAt: todayISO(),
              avatarColor: "#123B2A",
              treesWatered: 0,
            };
        if (!existing) {
          setUsers((prev) => [adminUser, ...prev]);
        } else {
          setUsers((prev) =>
            prev.map((u) => (u.id === adminUser.id ? adminUser : u)),
          );
        }
        void cloudUpsertUser(adminUser).catch(() => undefined);
        setUser(adminUser);
        setModal(null);
        setViewState("dashboard");
        notify(
          "مرحباً بك مدير الولاية — صلاحيات لوحة التحكم الكاملة مفعّلة.",
          "Welcome, State Admin — full dashboard permissions are active.",
        );
        return true;
      }

      const found = users.find(
        (u) =>
          u.email.toLowerCase() === normalized && u.password === password,
      );
      if (!found) {
        notify(
          "البريد أو كلمة المرور غير صحيحة. حساب الإدارة: admin@skikda.dz",
          "Incorrect email or password. Admin account: admin@skikda.dz",
          "error",
        );
        return false;
      }
      setUser(found);
      setModal(null);
      setViewState("dashboard");
      notify(
        `مرحباً بك ${found.firstName}، سعداء بعودتك.`,
        `Welcome back, ${found.firstName}.`,
      );
      return true;
    },
    [users, notify],
  );

  const signup = useCallback(
    (input: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      municipalityId: string;
      healthLimitations?: string;
    }) => {
      const normalized = input.email.trim().toLowerCase();
      if (users.some((u) => u.email.toLowerCase() === normalized)) {
        notify(
          "هذا البريد الإلكتروني مسجّل مسبقاً.",
          "This email is already registered.",
          "error",
        );
        return false;
      }
      const newUser: AppUser = {
        id: `u-${Date.now()}`,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: normalized,
        password: input.password,
        role: "volunteer",
        municipalityId: input.municipalityId,
        healthLimitations: input.healthLimitations?.trim() || undefined,
        joinedAt: todayISO(),
        avatarColor: "#16865B",
        treesWatered: 0,
      };
      setUsers((prev) => [newUser, ...prev]);
      setUser(newUser);
      void cloudInsertUser(newUser).catch(() => undefined);
      pushActivity({
        type: "join",
        textAr: `انضم متطوع جديد من بلدية ${municipalityById(input.municipalityId)?.nameAr ?? ""}`,
        textEn: `A new volunteer joined from ${municipalityById(input.municipalityId)?.nameEn ?? ""}`,
        municipalityId: input.municipalityId,
        actor: fullName(newUser),
      });
      setModal(null);
      setViewState("dashboard");
      notify(
        "تم إنشاء حسابك التطوعي بنجاح. أهلاً بك في شجرتي بصمتي!",
        "Your volunteer account is ready. Welcome to Shajarati Basmati!",
      );
      return true;
    },
    [users, notify, pushActivity],
  );

  const logout = useCallback(() => {
    setUser(null);
    setModal(null);
    setViewState("dashboard");
    notify("تم تسجيل الخروج بنجاح.", "You have been signed out.", "info");
  }, [notify]);

  const waterTree = useCallback(
    (treeId: string) => {
      if (!user) {
        notify(
          "سجّل الدخول أو أنشئ حساباً متطوعاً لتسجيل السقايات.",
          "Sign in or create a volunteer account to log waterings.",
          "info",
        );
        setModal({ type: "auth", mode: "login" });
        return false;
      }
      const tree = trees.find((tr) => tr.id === treeId);
      if (!tree) {
        notify("لم يتم العثور على الشجرة.", "Tree not found.", "error");
        return false;
      }
      const today = todayISO();
      const waterPatch = {
        waterings: tree.waterings + 1,
        lastWatered: today,
        health: Math.min(100, tree.health + 2),
        status:
          tree.status === "critical" || tree.status === "risk"
            ? ("monitoring" as const)
            : tree.status,
      };
      const wateredTotal = user.treesWatered + 1;

      setTrees((prev) =>
        prev.map((tr) => (tr.id === treeId ? { ...tr, ...waterPatch } : tr)),
      );
      setUser((prev) =>
        prev ? { ...prev, treesWatered: wateredTotal } : prev,
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, treesWatered: wateredTotal } : u,
        ),
      );
      pushActivity({
        type: "water",
        textAr: `${fullName(user)} سقت الشجرة ${treeId}`,
        textEn: `${fullName(user)} watered tree ${treeId}`,
        municipalityId: tree.municipalityId,
        actor: fullName(user),
        treeId,
      });
      void cloudWaterTree(treeId, waterPatch)
        .then(() => cloudUpdateUser(user.id, { treesWatered: wateredTotal }))
        .then(({ error }) => {
          if (error) throw error;
        })
        .catch(() =>
          notify(
            "تم التسجيل محلياً — سيُزامَن مع السحابة عند عودة الاتصال.",
            "Logged locally — it will sync to the cloud when back online.",
            "info",
          ),
        );
      notify(
        "تم تسجيل السقاية اليوم. شكراً لعنايتك بالشجرة!",
        "Watering logged for today. Thank you for caring for this tree!",
      );
      return true;
    },
    [user, trees, notify, pushActivity],
  );

  const escalateTree = useCallback(
    (treeId: string, note: string) => {
      if (!user) {
        setModal({ type: "auth", mode: "login" });
        return;
      }
      if (user.role === "volunteer") {
        notify(
          "التصعيد متاح لأدمن البلدية أو الولاية.",
          "Escalation is available to municipality or state admins.",
          "error",
        );
        return;
      }
      const tree = trees.find((tr) => tr.id === treeId);
      if (!tree) return;
      setTrees((prev) =>
        prev.map((tr) =>
          tr.id === treeId
            ? {
                ...tr,
                status: "critical",
                notesAr: note || tr.notesAr,
                notesEn: note || tr.notesEn,
              }
            : tr,
        ),
      );
      pushActivity({
        type: "issue",
        textAr: `تم تصعيد حالة الشجرة ${treeId} إلى الولاية`,
        textEn: `Tree ${treeId} was escalated to the state team`,
        municipalityId: tree.municipalityId,
        actor: fullName(user),
      });
      notify(
        "تم تصعيد الحالة إلى أدمن الولاية بنجاح.",
        "The issue has been escalated to the state admin.",
      );
    },
    [user, trees, notify, pushActivity],
  );

  const nextSequence = useCallback(
    (municipalityId: string) => {
      const maxTreeSeq = trees
        .filter((tr) => tr.municipalityId === municipalityId)
        .reduce((max, tr) => Math.max(max, sequenceFromId(tr.id)), 0);
      const maxCampaignSeq = campaigns
        .filter((c) => c.municipalityId === municipalityId)
        .reduce((max, c) => Math.max(max, sequenceFromId(c.id)), 0);
      return Math.max(maxTreeSeq, maxCampaignSeq) + 1;
    },
    [trees, campaigns],
  );

  const createCampaign = useCallback(
    (input: CampaignInput) => {
      if (!user || user.role !== "state_admin") {
        if (
          !(
            user?.role === "municipality_admin" &&
            user.municipalityId === input.municipalityId
          )
        ) {
          notify(
            user
              ? "إنشاء الحملات متاح لأدمن البلدية (في بلديتك) وأدمن الولاية."
              : "سجّل الدخول بصلاحية إدارية لإنشاء حملة.",
            user
              ? "Campaign creation is available to admins only (municipality admins in their own municipality)."
              : "Sign in with an admin account to create a campaign.",
            "error",
          );
          return null;
        }
      }
      if (
        user.role === "municipality_admin" &&
        user.municipalityId !== input.municipalityId
      ) {
        notify(
          "يمكنك إنشاء حملات لبلديتك فقط.",
          "You can only create campaigns for your own municipality.",
          "error",
        );
        return null;
      }
      const muni = municipalityById(input.municipalityId);
      if (!muni) return null;

      const count = Math.max(1, Math.min(300, Math.round(input.count)));
      const cols =
        input.layout === "grid"
          ? Math.max(1, Math.ceil(Math.sqrt(count)))
          : Math.max(1, Math.min(12, count));
      const startSeq = nextSequence(input.municipalityId);
      const campaignId = `CMP-${muni.code}-${pad3(startSeq)}`;
      const speciesObj = getSpecies(input.speciesAr, input.speciesEn);

      const newTrees: Tree[] = Array.from({ length: count }, (_, i) => {
        const row = Math.floor(i / cols) + 1;
        const col = (i % cols) + 1;
        return {
          id: `SKK-${muni.code}-${pad3(startSeq + i)}`,
          campaignId,
          municipalityId: input.municipalityId,
          speciesAr: input.speciesAr,
          speciesEn: input.speciesEn,
          plantedAt: input.date,
          lastWatered: input.date,
          row,
          col,
          status: "stable",
          health: 100,
          lat: input.lat,
          lng: input.lng,
          notesAr: `صف ${row} / عمود ${col} — تباعد ${input.spacing} م`,
          notesEn: `Row ${row} / Col ${col} — ${input.spacing} m spacing`,
          plantedBy: fullName(user),
          art: speciesObj.art,
          waterings: 0,
        };
      });

      const campaign: Campaign = {
        id: campaignId,
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        municipalityId: input.municipalityId,
        date: input.date,
        target: count,
        planted: count,
        layout: input.layout,
        spacing: input.spacing,
        speciesAr: input.speciesAr,
        speciesEn: input.speciesEn,
        lat: input.lat,
        lng: input.lng,
        status: "active",
        createdAt: todayISO(),
      };

      setCampaigns((prev) => [campaign, ...prev]);
      setTrees((prev) => [...newTrees, ...prev]);
      pushActivity({
        type: "campaign",
        textAr: `حملة «${input.nameAr}»: ${count} شجرة جديدة في ${muni.nameAr}`,
        textEn: `Campaign “${input.nameEn}”: ${count} new trees in ${muni.nameEn}`,
        municipalityId: input.municipalityId,
        actor: fullName(user),
      });
      void cloudUpsertCampaign(campaign)
        .then(({ error }) => {
          if (error) throw error;
        })
        .then(() => cloudInsertTrees(newTrees))
        .catch(() =>
          notify(
            "الحملة محفوظة محلياً — سيُزامَن مع السحابة عند عودة الاتصال.",
            "Campaign saved locally — it will sync to the cloud when back online.",
            "info",
          ),
        );
      notify(
        `تم إنشاء الحملة وتسجيل ${count} شجرة برموز QR جاهزة للطباعة.`,
        `Campaign created with ${count} trees and printable QR codes.`,
      );
      return campaignId;
    },
    [user, notify, nextSequence, pushActivity],
  );

  const addTree = useCallback(
    (input: TreeInput) => {
      if (!user) {
        setModal({ type: "auth", mode: "login" });
        return null;
      }
      if (user.role === "volunteer") {
        notify(
          "تسجيل شجرة مفردة متاح لأدمن البلدية والولاية.",
          "Registering a single tree is reserved for admins.",
          "error",
        );
        return null;
      }
      if (
        user.role === "municipality_admin" &&
        user.municipalityId !== input.municipalityId
      ) {
        notify(
          "يمكنك تسجيل أشجار بلديتك فقط.",
          "You can only register trees in your own municipality.",
          "error",
        );
        return null;
      }
      const muni = municipalityById(input.municipalityId);
      if (!muni) return null;
      const seq = nextSequence(input.municipalityId);
      const id = `SKK-${muni.code}-${pad3(seq)}`;
      const speciesObj = getSpecies(input.speciesAr, input.speciesEn);
      const newTree: Tree = {
        id,
        municipalityId: input.municipalityId,
        speciesAr: input.speciesAr,
        speciesEn: input.speciesEn,
        plantedAt: input.plantedAt,
        lastWatered: input.plantedAt,
        row: Math.max(1, input.row),
        col: Math.max(1, input.col),
        status: "stable",
        health: 100,
        lat: input.lat,
        lng: input.lng,
        notesAr: input.notesAr,
        notesEn: input.notesEn,
        plantedBy: fullName(user),
        art: speciesObj.art,
        waterings: 0,
      };
      setTrees((prev) => [newTree, ...prev]);
      pushActivity({
        type: "plant",
        textAr: `تم تسجيل شجرة ${speciesObj.ar} جديدة (${id}) في ${muni.nameAr}`,
        textEn: `A new ${speciesObj.en} tree (${id}) was registered in ${muni.nameEn}`,
        municipalityId: input.municipalityId,
        actor: fullName(user),
      });
      void cloudUpsertTree(newTree).catch(() => undefined);
      notify(
        `تم تسجيل الشجرة ${id} وإصدار جوازها الرقمي.`,
        `Tree ${id} registered and its digital passport issued.`,
      );
      return id;
    },
    [user, notify, nextSequence, pushActivity],
  );

  const savePost = useCallback(
    (input: PostInput, postId?: string) => {
      if (!user) {
        notify(
          "سجّل الدخول بصلاحية إدارية للنشر.",
          "Sign in with an admin account to publish.",
          "info",
        );
        setModal({ type: "auth", mode: "login" });
        return;
      }
      if (user.role === "volunteer") {
        notify(
          "النشر والتعديل متاحان لأدمن البلدية والولاية.",
          "Publishing and editing are reserved for admins.",
          "error",
        );
        return;
      }
      if (postId) {
        const existing = posts.find((p) => p.id === postId);
        if (!existing || !canManagePost(existing)) {
          notify(
            "لا تملك صلاحية تعديل هذا المنشور.",
            "You cannot edit this story.",
            "error",
          );
          return;
        }
        const updatedEdit: Post = { ...existing, ...input };
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, ...input } : p)),
        );
        void cloudUpsertPost(updatedEdit).catch(() => undefined);
        notify("تم حفظ تعديلات المنشور.", "Story updated.");
        return;
      }
      const post: Post = {
        id: `post-${Date.now()}`,
        ...input,
        author: fullName(user),
        authorId: user.id,
        date: todayISO(),
        likes: 0,
        art: posts.length % 10,
      };
      setPosts((prev) => [post, ...prev]);
      setModal(null);
      void cloudUpsertPost(post).catch(() => undefined);
      notify(
        "تم نشر التحديث في مجلتي.",
        "Your update has been published to My Magazine.",
      );
    },
    [user, posts, canManagePost, notify],
  );

  const deletePost = useCallback(
    (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      if (!user || !canManagePost(post)) {
        notify(
          "لا تملك صلاحية حذف هذا المنشور.",
          "You cannot delete this story.",
          "error",
        );
        return;
      }
      if (modal && "postId" in modal && modal.postId === postId) {
        setModal(null);
      }
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      void cloudDeletePost(postId).catch(() => undefined);
      notify("تم حذف المنشور نهائياً.", "Story deleted.");
    },
    [user, posts, modal, canManagePost, notify],
  );

  const togglePostVisibility = useCallback(
    (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      if (!user || !canManagePost(post)) {
        notify(
          "لا تملك صلاحية الإشراف على هذا المنشور.",
          "You cannot moderate this story.",
          "error",
        );
        return;
      }
      const hidden = !post.hidden;
      const visibilityUpdate: Post = { ...post, hidden };
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, hidden } : p)),
      );
      void cloudUpsertPost(visibilityUpdate).catch(() => undefined);
      notify(
        hidden
          ? "تم إخفاء المنشور عن الزوار والمتطوعين."
          : "تمت إعادة نشر المنشور.",
        hidden ? "The story is now hidden." : "The story was republished.",
        "info",
      );
    },
    [user, posts, canManagePost, notify],
  );

  const likePost = useCallback(
    (postId: string) => {
      if (!user) {
        setModal({ type: "auth", mode: "login" });
        return;
      }
      const liked = likedPosts.includes(postId);
      const current = posts.find((p) => p.id === postId);
      if (!current) return;

      const newLikes = liked ? Math.max(0, current.likes - 1) : current.likes + 1;
      const updatedPost = { ...current, likes: newLikes };

      setLikedPosts((prev) =>
        liked ? prev.filter((id) => id !== postId) : [...prev, postId],
      );
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? updatedPost : p)),
      );
      void cloudUpsertPost(updatedPost).catch(() => undefined);
    },
    [user, likedPosts, posts],
  );

  /* 🔄 دالة الترقية وإرسالها فوراً إلى Supabase */
  const assignRole = useCallback(
    async (userId: string, role: Role, municipalityId?: string) => {
      // 1. التحديث المحلي فوراً للأدمن
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId
            ? { ...u, role, municipalityId: municipalityId || u.municipalityId }
            : u,
        ),
      );

      if (user?.id === userId) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                role,
                municipalityId: municipalityId || prev.municipalityId,
              }
            : prev,
        );
      }

      // 2. إرسال البيانات المحدثة لقاعدة بيانات Supabase ليتلقاها هاتف المستهدف فوراً
      try {
        // أيضًا نمرر بريد المستهدف كحل بديل عندما لا يطابق `id` صفًا في السحابة.
        const targetEmail = users.find((u) => u.id === userId)?.email;
        const result = await cloudUpdateUser(
          userId,
          {
            role,
            municipalityId,
          },
          targetEmail,
        );

        if (result.error) {
          notify(
            "فشل تحديث السحابة. يرجى التحقق من الاتصال.",
            "Failed to update role on cloud.",
            "error",
          );
          return;
        }

        // PostgREST يعيد نجاحاً مع مصفوفة فارغة عند عدم مطابقة أي صف.
        if (!result.data || result.data.length === 0) {
          notify(
            "لم يُعثر على الحساب في السحابة — تم التحديث محلياً فقط.",
            "Cloud account not found — updated locally only.",
            "error",
          );
          return;
        }

        notify(
          "تم تحديث صلاحيات الحساب وإرسالها للهاتف بنجاح.",
          "User role updated and synced successfully.",
        );
      } catch (err) {
        console.error("Error updating user role:", err);
      }
    },
    [user?.id, users, notify],
  );

  const updateProfile = useCallback(
    (patch: Partial<AppUser>) => {
      if (!user) return;
      const updated = { ...user, ...patch };
      setUser(updated);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? updated : u)),
      );
      void cloudUpdateUser(user.id, patch).catch(() => undefined);
      notify("تم حفظ بيانات الملف الشخصي.", "Profile updated.");
    },
    [user, notify],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang,
      toggleLang,
      t,
      hydrated,
      toast,
      notify,
      cloudStatus,
      refreshCloud,
      user,
      users,
      trees,
      campaigns,
      posts,
      activities,
      likedPosts,
      municipalities,
      stats,
      findTree,
      isAdmin,
      isStateAdmin,
      canManagePost,
      view,
      setView,
      modal,
      openModal,
      closeModal,
      activeMunicipality,
      setActiveMunicipality,
      login,
      signup,
      logout,
      waterTree,
      escalateTree,
      createCampaign,
      addTree,
      savePost,
      deletePost,
      togglePostVisibility,
      likePost,
      assignRole,
      updateProfile,
    }),
    [
      lang,
      setLang,
      toggleLang,
      t,
      hydrated,
      toast,
      notify,
      cloudStatus,
      refreshCloud,
      user,
      users,
      trees,
      campaigns,
      posts,
      activities,
      likedPosts,
      municipalities,
      stats,
      findTree,
      isAdmin,
      isStateAdmin,
      canManagePost,
      view,
      setView,
      modal,
      openModal,
      closeModal,
      activeMunicipality,
      setActiveMunicipality,
      login,
      signup,
      logout,
      waterTree,
      escalateTree,
      createCampaign,
      addTree,
      savePost,
      deletePost,
      togglePostVisibility,
      likePost,
      assignRole,
      updateProfile,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used inside an AppProvider");
  }
  return ctx;
}