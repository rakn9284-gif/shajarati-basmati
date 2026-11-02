"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Award,
  Building2,
  CalendarDays,
  Check,
  Droplets,
  HeartPulse,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Save,
  ShieldCheck,
  Sprout,
  TreePine,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { ROLE_META } from "@/lib/data";
import {
  getMunicipality,
  municipalityName,
} from "@/lib/municipalities";
import { cn, formatDate, formatNumber, relativeTime } from "@/lib/utils";
import { Avatar, Progress, SectionHeading } from "./ui";
import { TreeEmblem } from "./TreeArt";

/* ------------------------------------------------------------------ */
/* Profile                                                            */
/* ------------------------------------------------------------------ */

export default function Profile() {
  const {
    t,
    lang,
    user,
    activities,
    trees,
    openModal,
    logout,
    updateProfile,
    notify,
  } = useApp();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [health, setHealth] = useState(user?.healthLimitations ?? "");

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";

  const myActivities = useMemo(
    () => activities.filter((a) => a.actor === fullName).slice(0, 6),
    [activities, fullName],
  );

  const myTrees = useMemo(
    () => trees.filter((tr) => tr.plantedBy === fullName).slice(0, 4),
    [trees, fullName],
  );

  const startEdit = () => {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setHealth(user.healthLimitations ?? "");
    setEditing(true);
  };

  const saveProfile = () => {
    if (!firstName.trim() || !lastName.trim()) {
      notify(
        "يرجى إدخال الاسم واللقب.",
        "Enter your first and last name.",
        "error",
      );
      return;
    }
    updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      healthLimitations: health.trim() || undefined,
    });
    setEditing(false);
  };

  /* ------------------------- Guest ------------------------- */
  if (!user) {
    return (
      <div className="space-y-5">
        <section className="card-surface overflow-hidden">
          <div className="grid items-center gap-4 bg-gradient-to-br from-forest via-forest-700 to-brand-dark p-6 text-white sm:p-9 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative">
              <div className="hero-pattern pointer-events-none absolute inset-0 opacity-40" />
              <div className="relative">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-mint/60">
                  <UserRound className="size-3.5" />
                  {t("حسابي", "MY PROFILE")}
                </p>
                <h1 className="mt-2 font-display text-2xl font-extrabold leading-snug sm:text-[32px]">
                  {t("بصمتك تبدأ بحساب", "Your mark starts with an account")}
                </h1>
                <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-white/60">
                  {t(
                    "سجّل الدخول لمتابعة الأشجار التي سقيتها، جوازاتك الرقمية، ومساهماتك في مجلة شجرتي بصمتي. أو انضم كمتطوع جديد في دقيقة واحدة.",
                    "Sign in to follow the trees you watered, your digital passports and your magazine contributions. Or join as a new volunteer in one minute.",
                  )}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => openModal({ type: "auth", mode: "signup" })}
                    className="inline-flex items-center gap-1.5 rounded-full bg-mint px-4 py-2.5 text-[12px] font-bold text-forest transition hover:bg-white"
                  >
                    <Sprout className="size-4" />
                    {t("تطوع معنا", "Join as a volunteer")}
                  </button>
                  <button
                    onClick={() => openModal({ type: "auth", mode: "login" })}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2.5 text-[11.5px] font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
                  >
                    <ShieldCheck className="size-4" />
                    {t("تسجيل الدخول", "Sign in")}
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-white/45">
                  <span className="flex items-center gap-1">
                    <Check className="size-3 text-mint" />
                    {t("جواز رقمي لكل شجرة", "A passport per tree")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="size-3 text-mint" />
                    {t("تتبع السقاية", "Watering tracking")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="size-3 text-mint" />
                    {t("38 بلدية", "38 municipalities")}
                  </span>
                </div>
              </div>
            </div>
            <div className="mx-auto max-w-[260px]">
              <TreeEmblem className="max-h-[230px]" />
            </div>
          </div>
        </section>

        <section className="card-surface p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: TreePine,
                title: t("جوازات أشجاري", "My tree passports"),
                body: t(
                  "كل شجرة تسقيها تُضاف إلى سجلك مع تاريخ آخر سقاية.",
                  "Every tree you water is added to your record with its last watering date.",
                ),
              },
              {
                icon: HeartPulse,
                title: t("سلامتك أولاً", "Your safety first"),
                body: t(
                  "يمكنك تسجيل أي قيود صحية ميدانية ليتكيف الفريق معها.",
                  "Record any field health limitations so the team can adapt.",
                ),
              },
              {
                icon: Award,
                title: t("بصمة موثقة", "A verified mark"),
                body: t(
                  "مساهماتك تُحتسب في تقارير الولاية ومجلة المجتمع.",
                  "Your contributions count in wilaya reports and the community magazine.",
                ),
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl bg-cream/60 p-4">
                  <span className="grid size-9 place-items-center rounded-xl bg-mint-soft text-brand">
                    <Icon className="size-4.5" />
                  </span>
                  <p className="mt-2.5 text-[12px] font-bold text-forest">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-charcoal/50">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  /* ------------------------- Signed in ------------------------- */
  const role = ROLE_META[user.role];
  const muni = getMunicipality(user.municipalityId);
  const RoleIcon =
    user.role === "state_admin"
      ? ShieldCheck
      : user.role === "municipality_admin"
        ? Building2
        : Sprout;

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="card-surface overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-br from-forest via-forest-700 to-brand-dark p-5 text-white sm:p-7">
          <div className="hero-pattern pointer-events-none absolute inset-0 opacity-50" />
          <div className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-mint/15 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <Avatar
                first={user.firstName}
                last={user.lastName}
                color={user.avatarColor}
                size="xl"
                className="ring-4 ring-white/15"
              />
              <div>
                <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.2em] text-mint/60">
                  <UserRound className="size-3.5" />
                  {t("الحساب الشخصي", "PERSONAL ACCOUNT")}
                </p>
                <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-[28px]">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10.5px] text-white/55">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3.5 text-mint" />
                    <span dir="ltr">{user.email}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5 text-mint" />
                    {lang === "ar" ? muni.nameAr : muni.nameEn} ({muni.code})
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3.5 text-mint" />
                    {t("عضو منذ", "Member since")} {formatDate(user.joinedAt, lang)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
                    style={{ backgroundColor: role.bg, color: role.color }}
                  >
                    <RoleIcon className="size-3" />
                    {lang === "ar" ? role.ar : role.en}
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-mint ring-1 ring-white/15">
                    {t("موثّق", "Verified")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={startEdit}
                className="inline-flex items-center gap-1.5 rounded-full bg-mint px-4 py-2.5 text-[11px] font-bold text-forest transition hover:bg-white"
              >
                <Pencil className="size-3.5" />
                {t("تعديل الحساب", "Edit profile")}
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2.5 text-[11px] font-semibold text-white ring-1 ring-white/15 transition hover:bg-[#FBE7E7] hover:text-[#B03636]"
              >
                <LogOut className="size-3.5" />
                {t("تسجيل الخروج", "Sign out")}
              </button>
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              {
                label: t("سقايات موثقة", "Verified waterings"),
                value: formatNumber(user.treesWatered, lang),
                icon: Droplets,
              },
              {
                label: t("أشجار سجلتها", "Trees registered"),
                value: formatNumber(myTrees.length, lang),
                icon: TreePine,
              },
              {
                label: t("نشاطاتك", "Your activities"),
                value: formatNumber(myActivities.length, lang),
                icon: Users,
              },
              {
                label: t("بلديات الولاية", "Wilaya municipalities"),
                value: "38",
                icon: MapPin,
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-white/10 backdrop-blur"
                >
                  <p className="flex items-center gap-1 text-[8.5px] text-white/45">
                    <Icon className="size-3 text-mint" />
                    {stat.label}
                  </p>
                  <p className="mt-1 font-display text-lg font-bold text-mint">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Details / edit */}
        <div className="space-y-5 lg:col-span-2">
          <section className="card-surface p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionHeading
                eyebrow={t("البيانات الشخصية", "PERSONAL DETAILS")}
                title={t("معلومات الحساب", "Account information")}
              />
              {!editing && (
                <button
                  onClick={startEdit}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-2 text-[10px] font-semibold text-forest transition hover:bg-mint-soft"
                >
                  <Pencil className="size-3" />
                  {t("تعديل", "Edit")}
                </button>
              )}
            </div>

            {editing ? (
              <div className="mt-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
                      {t("الاسم", "First name")}
                    </label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-2xl border border-line bg-white px-3.5 py-2.5 text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
                      {t("اللقب", "Last name")}
                    </label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-2xl border border-line bg-white px-3.5 py-2.5 text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
                    {t("البريد الإلكتروني", "Email address")}
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-line bg-white px-3.5 py-2.5 text-start text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  />
                </div>
                <div className="rounded-2xl border border-line/80 bg-white/70 p-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-[#FBF2DC] text-[#8A6516]">
                      <HeartPulse className="size-3.5" />
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-forest">
                        {t(
                          "هل لديك أي قيود صحية ميدانية؟",
                          "Do you have any field health limitations?",
                        )}
                      </p>
                      <p className="text-[9px] text-charcoal/40">
                        {t(
                          "اختياري — يُستخدم فقط لسلامتك أثناء العمل الميداني.",
                          "Optional — used only for your safety during field work.",
                        )}
                      </p>
                    </div>
                  </div>
                  <textarea
                    value={health}
                    onChange={(e) => setHealth(e.target.value)}
                    rows={2}
                    placeholder={t(
                      "مثال: حساسية موسمية من غبار الطلع…",
                      "e.g. seasonal pollen allergy…",
                    )}
                    className="mt-2 w-full resize-none rounded-xl border border-line bg-white px-3 py-2 text-[11px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveProfile}
                    className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2.5 text-[11.5px] font-bold text-white transition hover:bg-brand-dark"
                  >
                    <Save className="size-3.5" />
                    {t("حفظ التغييرات", "Save changes")}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2.5 text-[11.5px] font-semibold text-charcoal/55 transition hover:bg-sand"
                  >
                    <X className="size-3.5" />
                    {t("إلغاء", "Cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {[
                  {
                    icon: UserRound,
                    label: t("الاسم الكامل", "Full name"),
                    value: `${user.firstName} ${user.lastName}`,
                  },
                  {
                    icon: Mail,
                    label: t("البريد الإلكتروني", "Email"),
                    value: user.email,
                  },
                  {
                    icon: MapPin,
                    label: t("البلدية", "Municipality"),
                    value: `${lang === "ar" ? muni.nameAr : muni.nameEn} · ${muni.code}`,
                  },
                  {
                    icon: CalendarDays,
                    label: t("تاريخ الانضمام", "Joined on"),
                    value: formatDate(user.joinedAt, lang),
                  },
                  {
                    icon: RoleIcon,
                    label: t("الدور", "Role"),
                    value: lang === "ar" ? role.ar : role.en,
                  },
                  {
                    icon: Droplets,
                    label: t("السقايات الموثقة", "Verified waterings"),
                    value: `${formatNumber(user.treesWatered, lang)} ${t("مرة", "times")}`,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-line/70 bg-cream/50 p-3"
                    >
                      <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-charcoal/35">
                        <Icon className="size-3 text-brand" />
                        {item.label}
                      </p>
                      <p className="mt-1 truncate text-[11.5px] font-bold text-forest">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div
              className={cn(
                "mt-3 flex items-start gap-2 rounded-2xl p-3 text-[10px] leading-relaxed",
                user.healthLimitations
                  ? "bg-[#FBF2DC]/70 text-[#8A6516]"
                  : "bg-mint-soft/60 text-brand-dark/70",
              )}
            >
              <HeartPulse className="mt-0.5 size-3.5 shrink-0" />
              {user.healthLimitations
                ? t(
                    `قيود صحية مسجلة: ${user.healthLimitations}`,
                    `Recorded health limitations: ${user.healthLimitations}`,
                  )
                : t(
                    "لا توجد قيود صحية مسجلة. يمكنك إضافتها في أي وقت من تعديل الحساب.",
                    "No health limitations recorded. You can add them anytime from Edit profile.",
                  )}
            </div>
          </section>

          {/* Contributions */}
          <section className="card-surface p-5 sm:p-6">
            <SectionHeading
              eyebrow={t("مساهماتي", "MY CONTRIBUTIONS")}
              title={t("أثرك في الميدان", "Your impact in the field")}
              subtitle={t(
                "آخر النشاطات المسجلة باسمك، والأشجار التي ساهمت في غرسها.",
                "Your latest recorded activity and the trees you helped plant.",
              )}
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-charcoal/40">
                  {t("آخر النشاطات", "Recent activity")}
                </p>
                {myActivities.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {myActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-2 rounded-2xl border border-line/60 bg-cream/50 p-2.5"
                      >
                        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-mint-soft text-brand">
                          <Droplets className="size-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10.5px] leading-snug text-charcoal/70">
                            {lang === "ar" ? activity.textAr : activity.textEn}
                          </p>
                          <p className="mt-0.5 text-[8.5px] text-charcoal/35">
                            {relativeTime(activity.at, lang)}
                            {activity.municipalityId
                              ? ` · ${municipalityName(activity.municipalityId, lang)}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 rounded-2xl border border-dashed border-line bg-white/60 p-4 text-center">
                    <Droplets className="mx-auto size-5 text-charcoal/20" />
                    <p className="mt-1.5 text-[10.5px] font-semibold text-charcoal/45">
                      {t("لا توجد نشاطات بعد", "No activity yet")}
                    </p>
                    <button
                      onClick={() => openModal({ type: "scanner" })}
                      className="mt-2 rounded-full bg-forest px-3 py-1.5 text-[9.5px] font-bold text-white"
                    >
                      {t("امسح شجرة وسقها", "Scan and water a tree")}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-charcoal/40">
                  {t("أشجار سجلتها", "Trees you registered")}
                </p>
                {myTrees.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {myTrees.map((tree) => (
                      <button
                        key={tree.id}
                        onClick={() =>
                          openModal({ type: "passport", treeId: tree.id })
                        }
                        className="flex w-full items-center gap-2 rounded-2xl border border-line/60 bg-cream/50 p-2.5 text-start transition hover:border-brand/30 hover:bg-white"
                      >
                        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-mint-soft text-brand">
                          <TreePine className="size-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[10px] font-bold text-forest">
                            {tree.id}
                          </p>
                          <p className="truncate text-[8.5px] text-charcoal/40">
                            {lang === "ar" ? tree.speciesAr : tree.speciesEn} ·{" "}
                            {municipalityName(tree.municipalityId, lang)}
                          </p>
                        </div>
                        <ArrowUpRight className="size-3 text-brand" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 rounded-2xl border border-dashed border-line bg-white/60 p-4 text-center">
                    <TreePine className="mx-auto size-5 text-charcoal/20" />
                    <p className="mt-1.5 text-[10.5px] font-semibold text-charcoal/45">
                      {t("لم تسجل أشجاراً بعد", "No trees registered yet")}
                    </p>
                    <p className="mt-1 text-[9px] leading-relaxed text-charcoal/35">
                      {t(
                        "تسجيل الأشجار متاح لأدمن البلدية والولاية.",
                        "Tree registration is available to municipality and state admins.",
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-forest px-4 py-3 text-white">
              <div>
                <p className="text-[9px] text-white/50">
                  {t("معدل العناية الشخصي", "Personal care score")}
                </p>
                <p className="font-display text-lg font-bold text-mint">
                  {Math.min(100, Math.round((user.treesWatered / 30) * 100))}%
                </p>
              </div>
              <div className="w-1/2 max-w-[180px]">
                <Progress
                  value={Math.min(100, Math.round((user.treesWatered / 30) * 100))}
                  color="#B8E6CE"
                  className="bg-white/15"
                />
                <p className="mt-1 text-end text-[8px] text-white/40">
                  {t("الهدف: 30 سقاية", "Goal: 30 waterings")}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <section className="card-surface p-5">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-mint-soft text-brand">
                <ShieldCheck className="size-4.5" />
              </span>
              <div>
                <h2 className="font-display text-sm font-bold text-forest">
                  {t("صلاحياتك", "Your permissions")}
                </h2>
                <p className="text-[9px] text-charcoal/40">
                  {t("حسب دورك الحالي", "Based on your current role")}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}