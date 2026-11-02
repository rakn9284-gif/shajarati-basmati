"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  HeartPulse,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Sprout,
  X,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { municipalities } from "@/lib/municipalities";
import { cn } from "@/lib/utils";
import { Modal } from "./ui";
import { TreeEmblem } from "./TreeArt";

const HEALTH_OPTIONS = [
  { id: "none", ar: "لا توجد قيود", en: "No limitations" },
  { id: "asthma", ar: "ربو / حساسية تنفسية", en: "Asthma / respiratory" },
  { id: "allergy", ar: "حساسية موسمية", en: "Seasonal allergy" },
  { id: "mobility", ar: "قيود في الحركة", en: "Mobility limitation" },
  { id: "other", ar: "أخرى", en: "Other" },
];

export default function AuthModal({ initialMode }: { initialMode: "login" | "signup" }) {
  const { t, lang, login, signup, closeModal, notify } = useApp();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [municipalityId, setMunicipalityId] = useState("skikda");
  const [healthChips, setHealthChips] = useState<string[]>([]);
  const [healthText, setHealthText] = useState("");
  const [signupError, setSignupError] = useState("");

  const toggleHealth = (id: string) => {
    if (id === "none") {
      setHealthChips((prev) => (prev.includes("none") ? [] : ["none"]));
      return;
    }
    setHealthChips((prev) => {
      const withoutNone = prev.filter((x) => x !== "none");
      return withoutNone.includes(id)
        ? withoutNone.filter((x) => x !== id)
        : [...withoutNone, id];
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError(t("يرجى إدخال البريد وكلمة المرور.", "Enter your email and password."));
      return;
    }
    const ok = login(loginEmail, loginPassword);
    if (!ok) setLoginError(t("البريد أو كلمة المرور غير صحيحة.", "Incorrect email or password."));
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    if (!firstName.trim() || !lastName.trim()) {
      setSignupError(t("يرجى إدخال الاسم واللقب.", "Enter your first and last name."));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setSignupError(t("يرجى إدخال بريد إلكتروني صحيح.", "Enter a valid email address."));
      return;
    }
    if (password.length < 6) {
      setSignupError(t("كلمة المرور يجب أن تكون 6 أحرف على الأقل.", "Password must be at least 6 characters."));
      return;
    }
    const healthLabels = healthChips
      .filter((x) => x !== "none")
      .map((id) => {
        const option = HEALTH_OPTIONS.find((h) => h.id === id);
        return option ? (lang === "ar" ? option.ar : option.en) : "";
      })
      .filter(Boolean);
    const limitations = [
      ...healthLabels,
      healthText.trim(),
    ]
      .filter(Boolean)
      .join(" — ");
    const ok = signup({
      firstName,
      lastName,
      email,
      password,
      municipalityId,
      healthLimitations: limitations,
    });
    if (!ok) {
      setSignupError(t("تعذّر إنشاء الحساب. تحقق من البريد.", "Could not create the account. Check your email."));
    }
  };

  return (
    <Modal open onClose={closeModal} size="lg" bare bodyClassName="p-0" className="overflow-hidden">
      <div className="relative grid max-h-[92dvh] overflow-y-auto md:grid-cols-[0.9fr_1.1fr]">
        <button
          onClick={closeModal}
          aria-label={t("إغلاق", "Close")}
          className="absolute end-3 top-3 z-20 grid size-9 place-items-center rounded-full border border-line/70 bg-white/90 text-charcoal/55 shadow-sm transition hover:text-forest"
        >
          <X className="size-4.5" />
        </button>

        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden bg-forest p-7 text-white md:flex md:flex-col md:justify-between">
          <div className="hero-pattern pointer-events-none absolute inset-0 opacity-60" />
          <div className="pointer-events-none absolute -top-16 -end-16 size-56 rounded-full bg-brand/40 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-2xl bg-mint text-forest">
                <Sprout className="size-5" />
              </span>
              <div>
                <p className="font-display text-base font-extrabold">شجرتي بصمتي</p>
                <p className="text-[9px] text-mint/70">SHAJARATI BASMATI</p>
              </div>
            </div>
            <div className="mx-auto mt-4 max-w-[210px]">
              <TreeEmblem className="max-h-[180px]" />
            </div>
            <h3 className="mt-1 font-display text-[19px] font-extrabold leading-snug text-mint">
              {t("كل شجرة لها هوية، وكل بصمة تصنع ظلاً.", "Every tree has an identity. Every mark makes shade.")}
            </h3>
            <p className="mt-2 text-[11px] leading-relaxed text-white/55">
              {t(
                "انضم إلى مجتمع بيئي يتابع كل شجرة من الغرس إلى النمو، في 38 بلدية بولاية سكيكدة.",
                "Join an environmental community tracking every tree from planting to growth across 38 Skikda municipalities.",
              )}
            </p>
          </div>

          <div className="relative mt-6 space-y-2.5">
            {[
              t("جواز رقمي فريد لكل شجرة", "A unique digital passport for every tree"),
              t("توثيق السقاية والرعاية ميدانياً", "Verified watering and field care"),
              t("خرائط وتقارير لبلديتك", "Maps and reports for your municipality"),
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-[10.5px] text-white/70">
                <span className="grid size-5 place-items-center rounded-full bg-mint/15 text-mint">
                  <Check className="size-3" />
                </span>
                {item}
              </div>
            ))}
            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4 text-[9px] text-white/40">
              <ShieldCheck className="size-4 text-mint/60" />
              {t("منصة معتمدة · ولاية سكيكدة", "Official platform · Skikda Wilaya")}
            </div>
          </div>
        </aside>

        {/* Form panel */}
        <div className="bg-cream p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-forest text-mint md:hidden">
              <Sprout className="size-4.5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-forest">
                {mode === "login"
                  ? t("تسجيل الدخول", "Sign in")
                  : t("تطوع معنا", "Join as a volunteer")}
              </h2>
              <p className="text-[11px] text-charcoal/45">
                {mode === "login"
                  ? t("أهلاً بعودتك، بصمتك تنتظرك.", "Welcome back, your mark is waiting.")
                  : t("دقيقة واحدة تفصلك عن أول شجرة.", "One minute away from your first tree.")}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex rounded-2xl bg-white p-1 ring-1 ring-line">
            <button
              onClick={() => setMode("login")}
              className={cn(
                "flex-1 rounded-xl py-2 text-[12px] font-semibold transition",
                mode === "login" ? "bg-forest text-white shadow-sm" : "text-charcoal/50 hover:text-forest",
              )}
            >
              {t("لدي حساب", "I have an account")}
            </button>
            <button
              onClick={() => setMode("signup")}
              className={cn(
                "flex-1 rounded-xl py-2 text-[12px] font-semibold transition",
                mode === "signup" ? "bg-forest text-white shadow-sm" : "text-charcoal/50 hover:text-forest",
              )}
            >
              {t("تطوع معنا", "Volunteer sign up")}
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="mt-4 space-y-3">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
                  {t("البريد الإلكتروني", "Email address")}
                </label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-charcoal/30" />
                  <input
                    id="login-email"
                    type="email"
                    dir="ltr"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@shajarati.dz"
                    className="w-full rounded-2xl border border-line bg-white py-2.5 pe-3.5 ps-10 text-start text-[12px] text-charcoal outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-[11px] font-semibold text-charcoal/65">
                    {t("كلمة المرور", "Password")}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      notify(
                        "لإعادة تعيين كلمة المرور، تواصل مع أدمن الولاية.",
                        "To reset your password, contact the state admin.",
                        "info",
                      )
                    }
                    className="text-[10px] font-semibold text-brand hover:underline"
                  >
                    {t("نسيت كلمة المرور؟", "Forgot password?")}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-charcoal/30" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    dir="ltr"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-line bg-white py-2.5 pe-10 ps-10 text-start text-[12px] text-charcoal outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-charcoal/35 hover:text-brand"
                    aria-label={showPassword ? "hide password" : "show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="flex items-center gap-1.5 rounded-xl bg-[#FBE7E7] px-3 py-2 text-[10.5px] text-[#B03636]">
                  <AlertCircle className="size-3.5 shrink-0" />
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-forest py-2.5 text-[12.5px] font-bold text-white transition hover:bg-brand-dark"
              >
                {t("تسجيل الدخول", "Sign in")}
                <ArrowLeft className="size-4 rtl:rotate-0 ltr:rotate-180" />
              </button>

              <p className="text-center text-[9.5px] leading-relaxed text-charcoal/40">
                {t(
                  "الحسابات تُنشأ عبر التسجيل التطوعي، وتُمنح صلاحيات الإدارة من أدمن الولاية.",
                  "Accounts are created through volunteer sign-up; admin rights are granted by the state admin.",
                )}
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="first-name" className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
                    {t("الاسم", "First name")}
                  </label>
                  <input
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t("ياسمين", "Yasmine")}
                    className="w-full rounded-2xl border border-line bg-white px-3 py-2.5 text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
                    {t("اللقب", "Last name")}
                  </label>
                  <input
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t("بوقرة", "Bougera")}
                    className="w-full rounded-2xl border border-line bg-white px-3 py-2.5 text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
                  {t("البريد الإلكتروني", "Email address")}
                </label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-charcoal/30" />
                  <input
                    id="signup-email"
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.dz"
                    className="w-full rounded-2xl border border-line bg-white py-2.5 pe-3.5 ps-10 text-start text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-password" className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
                  {t("كلمة المرور", "Password")}
                </label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-charcoal/30" />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("6 أحرف على الأقل", "At least 6 characters")}
                    className="w-full rounded-2xl border border-line bg-white py-2.5 pe-10 ps-10 text-start text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-charcoal/35 hover:text-brand"
                    aria-label={showPassword ? "hide password" : "show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="signup-municipality" className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
                  {t("بلديتك", "Your municipality")}
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-charcoal/30" />
                  <select
                    id="signup-municipality"
                    value={municipalityId}
                    onChange={(e) => setMunicipalityId(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-line bg-white py-2.5 pe-9 ps-10 text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  >
                    {municipalities.map((m) => (
                      <option key={m.id} value={m.id}>
                        {lang === "ar" ? m.nameAr : m.nameEn} — {m.code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-charcoal/35" />
                </div>
                <p className="mt-1 text-[9px] text-charcoal/35">
                  {t("38 بلدية بولاية سكيكدة", "38 municipalities in Skikda Wilaya")}
                </p>
              </div>

              {/* Field safety */}
              <div className="rounded-2xl border border-line/80 bg-white/70 p-3">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-[#FBF2DC] text-[#8A6516]">
                    <HeartPulse className="size-3.5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold text-forest">
                      {t("هل لديك أي قيود صحية ميدانية؟", "Do you have any field health limitations?")}
                    </p>
                    <p className="text-[9px] text-charcoal/40">
                      {t(
                        "اختياري — يُستخدم فقط لسلامتك أثناء العمل الميداني.",
                        "Optional — used only for your safety during field work.",
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {HEALTH_OPTIONS.map((option) => {
                    const active = healthChips.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleHealth(option.id)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[9.5px] font-medium transition",
                          active
                            ? "border-brand bg-mint-soft text-brand-dark"
                            : "border-line bg-white text-charcoal/50 hover:border-brand/30",
                        )}
                      >
                        {lang === "ar" ? option.ar : option.en}
                      </button>
                    );
                  })}
                </div>
                <textarea
                  value={healthText}
                  onChange={(e) => setHealthText(e.target.value)}
                  rows={2}
                  placeholder={t(
                    "تفاصيل إضافية (اختياري)…",
                    "Additional details (optional)…",
                  )}
                  className="mt-2 w-full resize-none rounded-xl border border-line bg-white px-3 py-2 text-[11px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
              </div>

              {signupError && (
                <div className="flex items-center gap-1.5 rounded-xl bg-[#FBE7E7] px-3 py-2 text-[10.5px] text-[#B03636]">
                  <AlertCircle className="size-3.5 shrink-0" />
                  {signupError}
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-forest py-2.5 text-[12.5px] font-bold text-white transition hover:bg-brand-dark"
              >
                <Sparkles className="size-4 text-mint" />
                {t("إنشاء حساب متطوع", "Create volunteer account")}
              </button>

              <p className="text-center text-[9px] leading-relaxed text-charcoal/35">
                {t(
                  "بإنشائك حساباً، أنت توافق على ميثاق المتطوع البيئي لولاية سكيكدة.",
                  "By creating an account you agree to Skikda's environmental volunteer charter.",
                )}
              </p>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
}
