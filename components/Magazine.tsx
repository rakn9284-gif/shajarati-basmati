"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  EyeOff,
  Heart,
  ImagePlus,
  Images,
  LayoutGrid,
  Lightbulb,
  MapPin,
  Newspaper,
  Pencil,
  Plus,
  Share2,
  Sparkles,
  Sprout,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { getMunicipality, municipalities } from "@/lib/municipalities";
import { cn, formatDate, formatNumber } from "@/lib/utils";
import { Badge } from "./ui";
import type { PostCategory } from "@/lib/types";
import { Modal, SectionHeading } from "./ui";
import { TreeArt } from "./TreeArt";

const CATEGORIES = [
  { id: "all", ar: "الكل", en: "All", icon: LayoutGrid },
  { id: "campaign", ar: "حملات", en: "Campaigns", icon: Sprout },
  { id: "news", ar: "أخبار", en: "News", icon: Newspaper },
  { id: "gallery", ar: "معرض الصور", en: "Gallery", icon: Images },
  { id: "tip", ar: "نصائح", en: "Tips", icon: Lightbulb },
] as const;

const CATEGORY_META: Record<
  PostCategory,
  { ar: string; en: string; color: string; bg: string }
> = {
  campaign: { ar: "حملة", en: "Campaign", color: "#0F6B47", bg: "#DDF2E8" },
  news: { ar: "خبر", en: "News", color: "#123B2A", bg: "#E4F4EA" },
  gallery: { ar: "معرض", en: "Gallery", color: "#8A6516", bg: "#FBF2DC" },
  tip: { ar: "نصيحة", en: "Tip", color: "#B45A12", bg: "#FDEEE2" },
};

function CategoryPill({
  category,
  lang,
  className,
}: {
  category: PostCategory;
  lang: "ar" | "en";
  className?: string;
}) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold leading-none",
        className,
      )}
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      {lang === "ar" ? meta.ar : meta.en}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Post detail modal                                                   */
/* ------------------------------------------------------------------ */

export function PostModal({ postId }: { postId: string }) {
  const {
    t,
    lang,
    posts,
    likedPosts,
    likePost,
    closeModal,
    openModal,
    notify,
    canManagePost,
    togglePostVisibility,
    deletePost,
  } = useApp();
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return (
      <Modal
        open
        onClose={closeModal}
        title={t("مقال المجلة", "Magazine story")}
        icon={<Newspaper className="size-5" />}
        size="sm"
      >
        <p className="py-8 text-center text-[12px] text-charcoal/50">
          {t("لم يتم العثور على المقال.", "Story not found.")}
        </p>
      </Modal>
    );
  }

  const muni = getMunicipality(post.municipalityId);
  const liked = likedPosts.includes(post.id);
  const canModerate = canManagePost(post);
  const related = posts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 2);

  const share = async () => {
    const text = `${lang === "ar" ? post.titleAr : post.titleEn} — ${t("شجرتي بصمتي", "Shajarati Basmati")}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.titleAr, text });
      } else {
        await navigator.clipboard.writeText(text);
        notify(t("تم نسخ رابط المقال.", "Story link copied."));
      }
    } catch {
      notify(t("تعذّرت المشاركة.", "Sharing is unavailable."), "error");
    }
  };

  return (
    <Modal
      open
      onClose={closeModal}
      size="lg"
      bare
      bodyClassName="p-0"
      className="overflow-hidden"
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="relative h-52 overflow-hidden sm:h-64">
          {post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt={lang === "ar" ? post.titleAr : post.titleEn}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <TreeArt seed={post.art} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/10 to-transparent" />
          <button
            onClick={closeModal}
            className="absolute end-4 top-4 grid size-9 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25"
            aria-label={t("إغلاق", "Close")}
          >
            <X className="size-4.5" />
          </button>
          <div className="absolute inset-x-4 bottom-4 sm:inset-x-6">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryPill category={post.category} lang={lang} />
              {post.featured && (
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white ring-1 ring-white/25 backdrop-blur">
                  {t("مقال مميز", "Featured")}
                </span>
              )}
            </div>
            <h2 className="mt-2 max-w-2xl font-display text-xl font-extrabold leading-snug text-white sm:text-2xl">
              {lang === "ar" ? post.titleAr : post.titleEn}
            </h2>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 pb-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-charcoal/45">
              <span className="flex items-center gap-1.5">
                <UserRound className="size-3.5 text-brand" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-brand" />
                {lang === "ar" ? muni.nameAr : muni.nameEn}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-brand" />
                {formatDate(post.date, lang)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => likePost(post.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10.5px] font-semibold transition",
                  liked
                    ? "border-[#F3C7C7] bg-[#FBE7E7] text-[#B03636]"
                    : "border-line bg-white text-charcoal/55 hover:border-brand/30 hover:text-brand",
                )}
              >
                <Heart className={cn("size-3.5", liked && "fill-current")} />
                {formatNumber(post.likes, lang)}
              </button>
              <button
                onClick={share}
                className="grid size-8 place-items-center rounded-full border border-line bg-white text-charcoal/55 transition hover:border-brand/30 hover:text-brand"
                aria-label={t("مشاركة", "Share")}
              >
                <Share2 className="size-3.5" />
              </button>
            </div>
          </div>

          {canModerate && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-brand/30 bg-white px-3.5 py-2.5">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-brand-dark">
                <Sparkles className="size-3.5 text-brand" />
                {t("أدوات الإدارة", "Admin tools")}
              </span>
              {post.hidden && (
                <Badge tone="amber">
                  {t("مخفي حالياً", "Currently hidden")}
                </Badge>
              )}
              <div className="ms-auto flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => openModal({ type: "compose", postId: post.id })}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream/70 px-3 py-1.5 text-[10px] font-semibold text-forest transition hover:bg-mint-soft"
                >
                  <Pencil className="size-3" />
                  {t("تعديل", "Edit")}
                </button>
                <button
                  onClick={() => togglePostVisibility(post.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream/70 px-3 py-1.5 text-[10px] font-semibold text-forest transition hover:bg-mint-soft"
                >
                  {post.hidden ? (
                    <Check className="size-3" />
                  ) : (
                    <EyeOff className="size-3" />
                  )}
                  {post.hidden ? t("إعادة النشر", "Republish") : t("إخفاء", "Hide")}
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        t(
                          "هل أنت متأكد من حذف هذا المنشور نهائياً؟",
                          "Permanently delete this story?",
                        ),
                      )
                    ) {
                      deletePost(post.id);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#F3C7C7] bg-[#FBE7E7] px-3 py-1.5 text-[10px] font-semibold text-[#B03636] transition hover:bg-[#f8dcdc]"
                >
                  <Trash2 className="size-3" />
                  {t("حذف", "Delete")}
                </button>
              </div>
            </div>
          )}

          <p className="mt-4 rounded-2xl bg-mint-soft/50 px-4 py-3 text-[12px] font-medium leading-relaxed text-brand-dark/80">
            {lang === "ar" ? post.excerptAr : post.excerptEn}
          </p>
          <p className="mt-4 whitespace-pre-line text-[12.5px] leading-[1.9] text-charcoal/70">
            {lang === "ar" ? post.bodyAr : post.bodyEn}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line/70 bg-cream/70 px-4 py-3">
            <span className="flex items-center gap-1.5 text-[9.5px] text-charcoal/45">
              <Sparkles className="size-3.5 text-brand" />
              {t(
                "مقال من مجلة شجرتي بصمتي المجتمعية.",
                "A story from the Shajarati Basmati community magazine.",
              )}
            </span>
            <button
              onClick={closeModal}
              className="rounded-full bg-forest px-3.5 py-1.5 text-[10px] font-bold text-white transition hover:bg-brand-dark"
            >
              {t("إغلاق", "Close")}
            </button>
          </div>

          {related.length > 0 && (
            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-charcoal/40">
                {t("مقالات ذات صلة", "Related stories")}
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {related.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => openModal({ type: "post", postId: item.id })}
                    className="group flex items-center gap-2.5 rounded-2xl border border-line/70 bg-white p-2 text-start transition hover:border-brand/30 hover:shadow-sm"
                  >
                    <span className="h-12 w-16 shrink-0 overflow-hidden rounded-xl">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={lang === "ar" ? item.titleAr : item.titleEn}
                          className="size-full object-cover"
                        />
                      ) : (
                        <TreeArt seed={item.art} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block text-[10.5px] font-bold leading-snug text-forest group-hover:text-brand">
                        {lang === "ar" ? item.titleAr : item.titleEn}
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-[8.5px] text-charcoal/40">
                        <Heart className="size-2.5" />
                        {formatNumber(item.likes, lang)}
                      </span>
                    </span>
                    <ArrowUpRight className="size-3.5 shrink-0 text-brand opacity-0 transition group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Compose modal                                                       */
/* ------------------------------------------------------------------ */

export function ComposePost({ postId }: { postId?: string }) {
  const { t, lang, user, posts, savePost, closeModal, openModal } = useApp();
  const editing = posts.find((p) => p.id === postId);
  const [titleAr, setTitleAr] = useState(editing?.titleAr ?? "");
  const [titleEn, setTitleEn] = useState(editing?.titleEn ?? "");
  const [excerptAr, setExcerptAr] = useState(editing?.excerptAr ?? "");
  const [excerptEn, setExcerptEn] = useState(editing?.excerptEn ?? "");
  const [bodyAr, setBodyAr] = useState(editing?.bodyAr ?? "");
  const [bodyEn, setBodyEn] = useState(editing?.bodyEn ?? "");
  const [category, setCategory] = useState<PostCategory>(
    editing?.category ?? "news",
  );
  const [municipalityId, setMunicipalityId] = useState(
    user?.role === "municipality_admin"
      ? user.municipalityId ?? "skikda"
      : editing?.municipalityId ?? user?.municipalityId ?? "skikda",
  );
  const [imageUrl, setImageUrl] = useState(editing?.imageUrl ?? "");
  const [imageError, setImageError] = useState("");
  const [error, setError] = useState("");

  const MAX_IMAGE_BYTES = 1_500_000; // ~1.5 MB, keeps local storage safe

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError(
        t("يجب اختيار ملف صورة.", "The file must be an image."),
      );
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError(
        t(
          "حجم الصورة كبير جداً — الحد الأقصى 1.5 ميغابايت.",
          "The image is too large — the maximum is 1.5 MB.",
        ),
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result ?? ""));
    reader.onerror = () =>
      setImageError(t("تعذّر تحميل الصورة.", "Could not read the image."));
    reader.readAsDataURL(file);
  };

  if (!user || user.role === "volunteer") {
    return (
      <Modal
        open
        onClose={closeModal}
        title={t("نشر في المجلة", "Publish to the magazine")}
        icon={<Newspaper className="size-5" />}
        size="sm"
      >
        <div className="py-4 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#FBF2DC] text-[#8A6516]">
            <UserRound className="size-6" />
          </div>
          <p className="mt-4 font-display text-base font-bold text-forest">
            {t("النشر متاح للأدمن", "Publishing is reserved for admins")}
          </p>
          <p className="mx-auto mt-1 max-w-xs text-[12px] leading-relaxed text-charcoal/50">
            {t(
              "سجّل الدخول بحساب أدمن بلدية أو ولاية لنشر التحديثات والصور.",
              "Sign in as a municipality or state admin to publish updates and photos.",
            )}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => {
                closeModal();
                openModal({ type: "auth", mode: "login" });
              }}
              className="rounded-full bg-forest px-4 py-2 text-[11.5px] font-bold text-white"
            >
              {t("تسجيل الدخول", "Sign in")}
            </button>
            <button
              onClick={closeModal}
              className="rounded-full border border-line bg-white px-4 py-2 text-[11.5px] font-semibold text-forest"
            >
              {t("إلغاء", "Cancel")}
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  const submit = () => {
    setError("");
    if (!titleAr.trim() || !bodyAr.trim()) {
      setError(
        t(
          "يرجى إدخال العنوان والنص بالعربية على الأقل.",
          "Enter at least the Arabic title and body.",
        ),
      );
      return;
    }
    savePost(
      {
        titleAr: titleAr.trim(),
        titleEn: titleEn.trim() || titleAr.trim(),
        excerptAr: excerptAr.trim() || bodyAr.trim().slice(0, 140),
        excerptEn: excerptEn.trim() || bodyEn.trim().slice(0, 140) || excerptAr.trim().slice(0, 140),
        bodyAr: bodyAr.trim(),
        bodyEn: bodyEn.trim() || bodyAr.trim(),
        category,
        municipalityId,
        imageUrl: imageUrl.trim() || undefined,
      },
      editing?.id,
    );
  };

  return (
    <Modal
      open
      onClose={closeModal}
      title={
        editing
          ? t("تعديل المنشور", "Edit the story")
          : t("نشر تحديث جديد", "Publish a new update")
      }
      subtitle={t(
        "شارك خبراً أو صورة أو نصيحة مع مجتمع شجرتي بصمتي.",
        "Share a story, photo or tip with the Shajarati Basmati community.",
      )}
      icon={<Newspaper className="size-5" />}
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-2">
          <p className="hidden text-[10px] text-charcoal/40 sm:block">
            {t(
              "سيظهر المقال فوراً في المجلة.",
              "The story appears instantly in the magazine.",
            )}
          </p>
          <div className="flex gap-2">
            <button
              onClick={closeModal}
              className="rounded-full border border-line bg-white px-4 py-2.5 text-[11.5px] font-semibold text-charcoal/55 hover:bg-sand"
            >
              {t("إلغاء", "Cancel")}
            </button>
            <button
              onClick={submit}
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-[11.5px] font-bold text-white transition hover:bg-brand-dark"
            >
              <Plus className="size-3.5" />
              {editing ? t("حفظ التعديلات", "Save changes") : t("نشر المقال", "Publish story")}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
            {t("نوع المقال", "Story category")}
          </label>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {CATEGORIES.filter((c) => c.id !== "all").map((item) => {
              const Icon = item.icon;
              const active = category === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCategory(item.id as PostCategory)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[10.5px] font-semibold transition",
                    active
                      ? "border-brand bg-mint-soft text-brand-dark"
                      : "border-line bg-white text-charcoal/55 hover:border-brand/30",
                  )}
                >
                  <Icon className="size-3.5" />
                  {lang === "ar" ? item.ar : item.en}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
              {t("العنوان (عربي)", "Title (Arabic)")}
            </label>
            <input
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              placeholder={t("عنوان الخبر…", "Story headline…")}
              className="w-full rounded-2xl border border-line bg-white px-3.5 py-2.5 text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
              {t("العنوان (إنجليزي)", "Title (English)")}
            </label>
            <input
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              dir="ltr"
              placeholder="Story headline…"
              className="w-full rounded-2xl border border-line bg-white px-3.5 py-2.5 text-start text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
              {t("البلدية", "Municipality")}
            </label>
            <div className="relative">
              <select
                value={municipalityId}
                onChange={(e) => setMunicipalityId(e.target.value)}
                disabled={user.role === "municipality_admin"}
                className="w-full appearance-none rounded-2xl border border-line bg-white px-3.5 py-2.5 pe-9 text-[12px] outline-none transition focus:border-brand disabled:bg-cream disabled:text-charcoal/50"
              >
                {municipalities.map((m) => (
                  <option key={m.id} value={m.id}>
                    {lang === "ar" ? m.nameAr : m.nameEn} — {m.code}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-charcoal/35" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
              {t("مقتطف قصير (عربي)", "Short excerpt (Arabic)")}
            </label>
            <input
              value={excerptAr}
              onChange={(e) => setExcerptAr(e.target.value)}
              placeholder={t("جملة تلخّص المقال…", "One line that sums it up…")}
              className="w-full rounded-2xl border border-line bg-white px-3.5 py-2.5 text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
              {t("مقتطف قصير (إنجليزي)", "Short excerpt (English)")}
            </label>
            <input
              value={excerptEn}
              onChange={(e) => setExcerptEn(e.target.value)}
              dir="ltr"
              placeholder="One line that sums it up…"
              className="w-full rounded-2xl border border-line bg-white px-3.5 py-2.5 text-start text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
              {t("النص (عربي)", "Body (Arabic)")}
            </label>
            <textarea
              value={bodyAr}
              onChange={(e) => setBodyAr(e.target.value)}
              rows={5}
              placeholder={t("اكتب تفاصيل الخبر أو النصيحة…", "Write the full story or tip…")}
              className="w-full resize-none rounded-2xl border border-line bg-white px-3.5 py-2.5 text-[11.5px] leading-relaxed outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
              {t("النص (إنجليزي)", "Body (English)")}
            </label>
            <textarea
              value={bodyEn}
              onChange={(e) => setBodyEn(e.target.value)}
              rows={5}
              dir="ltr"
              placeholder="Write the full story or tip…"
              className="w-full resize-none rounded-2xl border border-line bg-white px-3.5 py-2.5 text-start text-[11.5px] leading-relaxed outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-line/80 bg-white/70 p-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-charcoal/65">
            <ImagePlus className="size-3.5 text-brand" />
            {t("إضافة صورة", "Add photo / image")}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {imageUrl ? (
              <div className="relative size-20 overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={t("معاينة الصورة", "Image preview")}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute end-1 top-1 grid size-5 place-items-center rounded-full bg-forest/80 text-white"
                  aria-label={t("حذف الصورة", "Remove image")}
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line bg-cream/70 px-3 py-2.5 text-[10.5px] font-semibold text-charcoal/55 transition hover:border-brand/40 hover:bg-mint-soft/50">
                <Images className="size-4 text-brand" />
                {t("اختر صورة من جهازك", "Choose an image from your device")}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickImage}
                />
              </label>
            )}
            <p className="text-[8.5px] leading-snug text-charcoal/40">
              {t(
                "اختياري · JPG/PNG/WebP — حتى 1.5 ميغابايت.",
                "Optional · JPG / PNG / WebP — up to 1.5 MB.",
              )}
            </p>
          </div>
          {imageError && (
            <p className="mt-1.5 rounded-lg bg-[#FBE7E7] px-2.5 py-1.5 text-[9.5px] font-medium text-[#B03636]">
              {imageError}
            </p>
          )}
        </div>

        {error && (
          <p className="rounded-xl bg-[#FBE7E7] px-3 py-2 text-[10.5px] font-medium text-[#B03636]">
            {error}
          </p>
        )}

        <div className="flex items-start gap-2 rounded-2xl bg-mint-soft/60 p-3 text-[10px] leading-relaxed text-brand-dark/70">
          <Check className="mt-0.5 size-3.5 shrink-0" />
          {t(
            "سيُنشر المقال باسمك ودورك الحالي في المنصة.",
            "The story will be published under your name and current platform role.",
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Magazine page                                                       */
/* ------------------------------------------------------------------ */

export default function Magazine() {
  const {
    t,
    lang,
    posts,
    user,
    likedPosts,
    likePost,
    openModal,
    setView,
    canManagePost,
  } = useApp();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>(
    "all",
  );
  const [query, setQuery] = useState("");

  // Hidden posts stay visible to their managing admins only
  const visiblePosts = useMemo(
    () => posts.filter((p) => !p.hidden || canManagePost(p)),
    [posts, canManagePost],
  );

  const featured = visiblePosts.find((p) => p.featured) ?? visiblePosts[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visiblePosts.filter((p) => {
      const matchesCategory = category === "all" || p.category === category;
      const matchesQuery =
        !q ||
        p.titleAr.includes(query.trim()) ||
        p.titleEn.toLowerCase().includes(q) ||
        p.author.includes(query.trim());
      return matchesCategory && matchesQuery;
    });
  }, [visiblePosts, category, query]);

  const totalLikes = visiblePosts.reduce((sum, p) => sum + p.likes, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="card-surface overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-br from-forest via-forest-700 to-brand-dark p-5 text-white sm:p-7">
          <div className="hero-pattern pointer-events-none absolute inset-0 opacity-50" />
          <div className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-mint/15 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-mint/60">
                <Newspaper className="size-3.5" />
                {t("مجلتي المجتمعية", "MY MAGAZINE")}
              </p>
              <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-[32px]">
                {t("حكايات من غابات سكيكدة", "Stories from Skikda's green spaces")}
              </h1>
              <p className="mt-1.5 max-w-2xl text-[12px] leading-relaxed text-white/55">
                {t(
                  "أخبار الحملات، صور ميدانية، ونصائح العناية بالأشجار — من 38 بلدية إلى شاشتك.",
                  "Campaign news, field photos and tree-care tips — from all 38 municipalities to your screen.",
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-2xl bg-white/10 px-3.5 py-2 ring-1 ring-white/15 backdrop-blur">
                <p className="text-[8.5px] text-white/45">{t("مقالات منشورة", "Published stories")}</p>
                <p className="font-display text-lg font-bold text-mint">
                  {formatNumber(visiblePosts.length, lang)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 px-3.5 py-2 ring-1 ring-white/15 backdrop-blur">
                <p className="text-[8.5px] text-white/45">{t("تفاعلات", "Interactions")}</p>
                <p className="font-display text-lg font-bold text-mint">
                  {formatNumber(totalLikes, lang)}
                </p>
              </div>
              {user && user.role !== "volunteer" && (
                <button
                  onClick={() => openModal({ type: "compose" })}
                  className="inline-flex items-center gap-1.5 rounded-full bg-mint px-4 py-2.5 text-[11px] font-bold text-forest transition hover:bg-white"
                >
                  <Plus className="size-3.5" />
                  {t("نشر تحديث", "Publish update")}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="card-surface overflow-hidden">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <button
              onClick={() => openModal({ type: "post", postId: featured.id })}
              className="group relative h-64 overflow-hidden text-start sm:h-72 lg:h-full lg:min-h-[300px]"
            >
              {featured.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.imageUrl}
                  alt={lang === "ar" ? featured.titleAr : featured.titleEn}
                  className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <TreeArt
                  seed={featured.art}
                  className="transition duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/20 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center gap-2">
                <CategoryPill category={featured.category} lang={lang} />
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white ring-1 ring-white/25 backdrop-blur">
                  {t("مميز", "Featured")}
                </span>
              </div>
            </button>
            <div className="flex flex-col justify-between p-5 sm:p-6">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand">
                  <Sparkles className="size-3.5" />
                  {t("قصة الغلاف", "COVER STORY")}
                </p>
                <h2 className="mt-2 font-display text-xl font-extrabold leading-snug text-forest sm:text-2xl">
                  {lang === "ar" ? featured.titleAr : featured.titleEn}
                </h2>
                <p className="mt-2 text-[12px] leading-relaxed text-charcoal/55">
                  {lang === "ar" ? featured.excerptAr : featured.excerptEn}
                </p>
              </div>
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-charcoal/40">
                  <span className="flex items-center gap-1">
                    <UserRound className="size-3" />
                    {featured.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {lang === "ar"
                      ? getMunicipality(featured.municipalityId).nameAr
                      : getMunicipality(featured.municipalityId).nameEn}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3" />
                    {formatDate(featured.date, lang)}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => openModal({ type: "post", postId: featured.id })}
                    className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-[11px] font-bold text-white transition hover:bg-brand-dark"
                  >
                    {t("اقرأ القصة", "Read the story")}
                    <ArrowUpRight className="size-3.5" />
                  </button>
                  <button
                    onClick={() => likePost(featured.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[10.5px] font-semibold transition",
                      likedPosts.includes(featured.id)
                        ? "border-[#F3C7C7] bg-[#FBE7E7] text-[#B03636]"
                        : "border-line bg-white text-charcoal/50 hover:border-brand/30 hover:text-brand",
                    )}
                  >
                    <Heart
                      className={cn(
                        "size-3.5",
                        likedPosts.includes(featured.id) && "fill-current",
                      )}
                    />
                    {formatNumber(featured.likes, lang)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="card-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1">
            <Newspaper className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-charcoal/25" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("ابحث في المجلة…", "Search the magazine…")}
              className="w-full rounded-2xl border border-line bg-white py-2.5 pe-3.5 ps-10 text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((item) => {
              const Icon = item.icon;
              const active = category === item.id;
              const count =
                item.id === "all"
                  ? visiblePosts.length
                  : visiblePosts.filter((p) => p.category === item.id).length;
              return (
                <button
                  key={item.id}
                  onClick={() => setCategory(item.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[10.5px] font-semibold transition",
                    active
                      ? "border-forest bg-forest text-white"
                      : "border-line bg-white text-charcoal/50 hover:border-brand/30",
                  )}
                >
                  <Icon className="size-3.5" />
                  {lang === "ar" ? item.ar : item.en}
                  <span className={cn("text-[9px]", active ? "text-mint/80" : "text-charcoal/30")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid */}
      <div>
        <SectionHeading
          eyebrow={t("آخر المنشورات", "LATEST STORIES")}
          title={t("من البلديات إلى المجلة", "From municipalities to the magazine")}
          subtitle={t(
            "كل قصة موثقة بمكانها وتاريخها، ويمكن التفاعل معها مباشرة.",
            "Every story is tied to its place and date, and can be liked instantly.",
          )}
          action={
            <p className="text-[10px] text-charcoal/40">
              {filtered.length} / {posts.length}
            </p>
          }
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => {
            const muni = getMunicipality(post.municipalityId);
            const liked = likedPosts.includes(post.id);
            return (
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-[24px] border border-line/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-40px_rgba(18,59,42,0.55)]"
              >
                <div className="relative h-40 overflow-hidden">
                  <button
                    onClick={() => openModal({ type: "post", postId: post.id })}
                    className="absolute inset-0 text-start"
                    aria-label={lang === "ar" ? post.titleAr : post.titleEn}
                  >
                    {post.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.imageUrl}
                        alt={lang === "ar" ? post.titleAr : post.titleEn}
                        className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <TreeArt
                        seed={post.art}
                        className="transition duration-700 group-hover:scale-105"
                      />
                    )}
                    <span className="absolute start-3 top-3">
                      <CategoryPill category={post.category} lang={lang} />
                    </span>
                    <span className="absolute end-3 top-3 rounded-full bg-white/85 px-2 py-1 text-[8.5px] font-bold text-forest backdrop-blur">
                      {muni.code}
                    </span>
                  </button>
                  {(post.hidden || canManagePost(post)) && (
                    <span className="absolute end-3 bottom-3 flex items-center gap-1.5">
                      {post.hidden && (
                        <span className="rounded-full bg-[#FBF2DC] px-2 py-1 text-[8.5px] font-bold text-[#8A6516] backdrop-blur">
                          {t("مخفي", "Hidden")}
                        </span>
                      )}
                      {canManagePost(post) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal({ type: "compose", postId: post.id });
                          }}
                          className="grid size-7 place-items-center rounded-full bg-white/85 text-forest backdrop-blur transition hover:bg-forest hover:text-white"
                          aria-label={t("تعديل المنشور", "Edit story")}
                        >
                          <Pencil className="size-3" />
                        </button>
                      )}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <button
                    onClick={() => openModal({ type: "post", postId: post.id })}
                    className="text-start"
                  >
                    <h3 className="line-clamp-2 font-display text-[13.5px] font-bold leading-snug text-forest transition group-hover:text-brand">
                      {lang === "ar" ? post.titleAr : post.titleEn}
                    </h3>
                  </button>
                  <p className="mt-1.5 line-clamp-2 text-[10.5px] leading-relaxed text-charcoal/50">
                    {lang === "ar" ? post.excerptAr : post.excerptEn}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-3 text-[9px] text-charcoal/40">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3" />
                      {formatDate(post.date, lang)}
                    </span>
                    <button
                      onClick={() => likePost(post.id)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold transition",
                        liked
                          ? "bg-[#FBE7E7] text-[#B03636]"
                          : "text-charcoal/45 hover:bg-cream hover:text-brand",
                      )}
                      aria-label={t("إعجاب", "Like")}
                    >
                      <Heart className={cn("size-3", liked && "fill-current")} />
                      {formatNumber(post.likes, lang)}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-4 rounded-3xl border border-dashed border-line bg-white/60 px-6 py-12 text-center">
            <Newspaper className="mx-auto size-8 text-charcoal/20" />
            <p className="mt-3 font-display text-base font-bold text-forest">
              {t("لا توجد مقالات مطابقة", "No matching stories")}
            </p>
            <p className="mt-1 text-[11.5px] text-charcoal/45">
              {t(
                "جرّب تصنيفاً آخر أو امسح كلمة البحث.",
                "Try another category or clear the search.",
              )}
            </p>
            <button
              onClick={() => {
                setCategory("all");
                setQuery("");
              }}
              className="mt-3 rounded-full bg-forest px-4 py-2 text-[11px] font-semibold text-white"
            >
              {t("إعادة تعيين", "Reset filters")}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line/70 bg-white px-4 py-3 text-[9.5px] text-charcoal/40">
        <span className="flex items-center gap-1.5">
          <Newspaper className="size-3.5 text-brand" />
          {t(
            "مجلة شجرتي بصمتي · محتوى مجتمعي من ولاية سكيكدة",
            "Shajarati Basmati magazine · community content from Skikda Wilaya",
          )}
        </span>
        <button
          onClick={() => setView("dashboard")}
          className="flex items-center gap-1 font-semibold text-brand hover:underline"
        >
          {t("العودة إلى الرئيسية", "Back to home")}
          <ArrowUpRight className="size-3" />
        </button>
      </div>
    </div>
  );
}
