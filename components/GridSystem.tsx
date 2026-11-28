"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Grid3X3,
  Info,
  LayoutGrid,
  MapPin,
  Plus,
  QrCode,
  Ruler,
  Rows3,
  Sparkles,
  Sprout,
  Trash2,
  TreePine,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store";
import {
  getMunicipality,
  municipalityById,
  municipalities,
} from "@/lib/municipalities";
import { SPECIES, getSpecies } from "@/lib/data";
import {
  cn,
  formatArea,
  formatDate,
  polygonAreaSqm,
  todayISO,
} from "@/lib/utils";
import { Badge, Modal, Progress } from "./ui";

const PolygonDrawMap = dynamic(() => import("./PolygonDrawMap"), {
  ssr: false,
  loading: () => (
    <div className="grid size-full place-items-center bg-mint-soft/60 text-[10px] font-semibold text-brand-dark/70">
      جارٍ تحميل الخريطة…
    </div>
  ),
});

const STEPS = [
  { ar: "معلومات الحملة", en: "Campaign details" },
  { ar: "التخطيط الهندسي", en: "Layout design" },
  { ar: "المراجعة والإنشاء", en: "Review & create" },
];

export default function GridSystem({ campaignId }: { campaignId?: string }) {
  const {
    t,
    lang,
    user,
    campaigns,
    createCampaign,
    updateCampaign,
    closeModal,
    openModal,
    activeMunicipality,
  } = useApp();

  const editingCampaign = campaigns.find((c) => c.id === campaignId);
  const isEdit = !!editingCampaign;

  const defaultMuni =
    user?.role === "municipality_admin" && user.municipalityId
      ? user.municipalityId
      : activeMunicipality ?? "skikda";
  const initialMuni = getMunicipality(defaultMuni);

  const [step, setStep] = useState(0);
  const [nameAr, setNameAr] = useState(
    editingCampaign?.nameAr ?? `حملة ${initialMuni.nameAr} الخضراء`,
  );
  const [nameEn, setNameEn] = useState(
    editingCampaign?.nameEn ?? `Green ${initialMuni.nameEn} Campaign`,
  );
  const [municipalityId, setMunicipalityId] = useState(
    editingCampaign?.municipalityId ?? defaultMuni,
  );
  const [date, setDate] = useState(editingCampaign?.date ?? todayISO());
  const [organizer, setOrganizer] = useState(
    editingCampaign?.organizer?.trim() ||
      (user ? `${user.firstName} ${user.lastName}`.trim() : ""),
  );
  const [polygon, setPolygon] = useState<[number, number][]>(
    editingCampaign?.polygon ?? [],
  );
  const [speciesAr, setSpeciesAr] = useState<string>(
    editingCampaign?.speciesAr || SPECIES[0].ar,
  );
  const [speciesEn, setSpeciesEn] = useState<string>(
    editingCampaign?.speciesEn || SPECIES[0].en,
  );
  const [customSpecies, setCustomSpecies] = useState(
    !!editingCampaign && !SPECIES.some((sp) => sp.ar === editingCampaign.speciesAr),
  );
  const [customName, setCustomName] = useState(
    editingCampaign && !SPECIES.some((sp) => sp.ar === editingCampaign.speciesAr)
      ? editingCampaign.speciesAr
      : "",
  );
  const [count, setCount] = useState(editingCampaign?.target ?? 50);
  const [layout, setLayout] = useState<"grid" | "rows">(
    editingCampaign?.layout ?? "grid",
  );
  const [spacing, setSpacing] = useState(editingCampaign?.spacing ?? 4);
  const [error, setError] = useState("");

  const muni = municipalityById(municipalityId) ?? initialMuni;
  const [lat, setLat] = useState(String(editingCampaign?.lat ?? muni.lat));
  const [lng, setLng] = useState(String(editingCampaign?.lng ?? muni.lng));
  const boundary = polygon.length >= 3 ? polygon : undefined;
  const areaSqm = useMemo(() => polygonAreaSqm(polygon), [polygon]);
  const center: [number, number] = [
    lat.trim() !== "" && Number.isFinite(Number(lat)) ? Number(lat) : muni.lat,
    lng.trim() !== "" && Number.isFinite(Number(lng)) ? Number(lng) : muni.lng,
  ];
  const steps = isEdit ? [STEPS[0], STEPS[2]] : STEPS;
  const finalStep = steps.length - 1;
  const cols = layout === "grid" ? Math.max(1, Math.ceil(Math.sqrt(count))) : Math.max(1, Math.min(12, count));
  const rows = Math.ceil(count / cols);

  const restricted = !user || user.role === "volunteer";
  const muniLocked = user?.role === "municipality_admin";

  /* النوع الفعّال: إما من الشبكة الجاهزة أو الاسم المُدخل يدوياً ("نوع آخر"). */
  const effectiveAr = customSpecies ? customName.trim() : speciesAr;
  const effectiveEn = customSpecies ? customName.trim() : speciesEn;
  const speciesObj = getSpecies(effectiveAr, effectiveEn);

  const chooseMuni = (id: string) => {
    setMunicipalityId(id);
    const next = municipalityById(id);
    if (next) {
      if (nameAr.startsWith("حملة ")) setNameAr(`حملة ${next.nameAr} الخضراء`);
      if (nameEn.startsWith("Green ")) setNameEn(`Green ${next.nameEn} Campaign`);
      setLat(String(next.lat));
      setLng(String(next.lng));
      setPolygon([]);
    }
  };

  const next = () => {
    setError("");
    if (step === 0) {
      if (!nameAr.trim()) {
        setError(t("يرجى إدخال اسم الحملة.", "Enter a campaign name."));
        return;
      }
      if (customSpecies && !effectiveAr) {
        setError(
          t("يرجى إدخال اسم النوع المخصص.", "Please enter the custom species name."),
        );
        return;
      }
      if (!date) {
        setError(t("يرجى اختيار تاريخ الحملة.", "Choose a campaign date."));
        return;
      }
      const latNum = Number(lat);
      const lngNum = Number(lng);
      if (
        lat.trim() === "" ||
        lng.trim() === "" ||
        Number.isNaN(latNum) ||
        Number.isNaN(lngNum) ||
        latNum < -90 ||
        latNum > 90 ||
        lngNum < -180 ||
        lngNum > 180
      ) {
        setError(
          t(
            "يرجى إدخال إحداثيات جغرافية صحيحة لموقع الحملة (خط عرض بين -90 و90، وخط طول بين -180 و180).",
            "Enter valid geo-coordinates for the campaign site (latitude between -90 and 90, longitude between -180 and 180).",
          ),
        );
        return;
      }
    }
    if (polygon.length > 0 && polygon.length < 3) {
      setError(
        t(
          "أكمل رسم حدود الموقع بثلاث نقاط على الأقل، أو امسح النقاط المرسومة.",
          "Draw at least three boundary points, or clear the drawn points.",
        ),
      );
      return;
    }
    if (step === 1 && !isEdit) {
      if (count < 1 || count > 300) {
        setError(t("عدد الأشجار يجب أن يكون بين 1 و300.", "Tree count must be between 1 and 300."));
        return;
      }
    }
    setStep((s) => Math.min(finalStep, s + 1));
  };

  const create = () => {
    if (restricted) {
      closeModal();
      openModal({ type: "auth", mode: "login" });
      return;
    }
    const fields = {
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim() || nameAr.trim(),
      municipalityId,
      date,
      speciesAr: effectiveAr,
      speciesEn: effectiveEn,
      lat: Number(Number(lat).toFixed(6)),
      lng: Number(Number(lng).toFixed(6)),
      organizer: organizer.trim(),
      polygon: boundary,
      areaSqm: boundary ? areaSqm : undefined,
    };

    if (isEdit && editingCampaign) {
      const saved = updateCampaign(editingCampaign.id, fields);
      if (saved) {
        closeModal();
        openModal({ type: "site", campaignId: editingCampaign.id });
      }
      return;
    }

    const id = createCampaign({
      ...fields,
      count,
      layout,
      spacing,
    });
    if (id) {
      closeModal();
      openModal({ type: "print", campaignId: id });
    }
  };

  if (restricted) {
    return (
      <Modal
        open
        onClose={closeModal}
        title={t("إضافة حملة تشجير", "Add planting campaign")}
        icon={<TreePine className="size-5" />}
        size="sm"
      >
        <div className="py-4 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#FBF2DC] text-[#8A6516]">
            <Users className="size-6" />
          </div>
          <p className="mt-4 font-display text-base font-bold text-forest">
            {t("هذه الصلاحية لأدمن البلدية", "This is a municipality admin action")}
          </p>
          <p className="mx-auto mt-1 max-w-xs text-[12px] leading-relaxed text-charcoal/50">
            {t(
              "سجّل الدخول بحساب أدمن بلدية أو أدمن ولاية لإنشاء موقع تشجير ولافته الميدانية.",
              "Sign in as a municipality or state admin to create a planting site and its field sign.",
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

  return (
    <Modal
      open
      onClose={closeModal}
      title={
        isEdit
          ? t("تعديل موقع الحملة", "Edit campaign site")
          : t("إضافة حملة تشجير", "Add a planting campaign")
      }
      subtitle={t(
        "حدّد حدود الموقع على الخريطة وبيانات الحملة — وسيُصدر رمز QR واحد لكل موقع.",
        "Draw the site boundary on the map and set campaign details — one QR code is issued per site.",
      )}
      icon={<TreePine className="size-5" />}
      size="xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-charcoal/40">
            <Info className="size-3.5 text-brand" />
            {t(
              "يتم حفظ مسودة الحملة محلياً حتى الإرسال.",
              "Campaign draft is kept locally until submitted.",
            )}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2.5 text-[11.5px] font-semibold text-forest transition hover:bg-mint-soft"
              >
                <ArrowRight className="size-3.5 ltr:rotate-180" />
                {t("السابق", "Back")}
              </button>
            ) : (
              <button
                onClick={closeModal}
                className="rounded-full border border-line bg-white px-4 py-2.5 text-[11.5px] font-semibold text-charcoal/55 transition hover:bg-sand"
              >
                {t("إلغاء", "Cancel")}
              </button>
            )}
            {step < finalStep ? (
              <button
                onClick={next}
                className="inline-flex items-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-[11.5px] font-bold text-white transition hover:bg-brand-dark"
              >
                {t("التالي", "Next")}
                <ArrowLeft className="size-3.5 ltr:rotate-180" />
              </button>
            ) : (
              <button
                onClick={create}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-[11.5px] font-bold text-white shadow-[0_12px_26px_-16px_rgba(22,134,91,0.9)] transition hover:bg-brand-dark"
              >
                <Sparkles className="size-3.5" />
                {isEdit
                  ? t("حفظ تعديلات الموقع", "Save site changes")
                  : t("إنشاء الحملة ولافتها", "Create campaign & sign")}
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Stepper */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-line/70 bg-white p-1.5">
          {steps.map((s, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <button
                key={s.ar}
                onClick={() => i <= step && setStep(i)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[10.5px] font-semibold transition",
                  active
                    ? "bg-forest text-white"
                    : done
                      ? "bg-mint-soft text-brand"
                      : "text-charcoal/35",
                )}
              >
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full text-[9px] font-bold",
                    active
                      ? "bg-mint text-forest"
                      : done
                        ? "bg-brand text-white"
                        : "bg-sand text-charcoal/35",
                  )}
                >
                  {done ? <Check className="size-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{lang === "ar" ? s.ar : s.en}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="rounded-xl bg-[#FBE7E7] px-3 py-2 text-[11px] font-medium text-[#B03636]">
            {error}
          </div>
        )}

        {step === 0 && (
          <div className="space-y-4 animate-fade-up">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
                  {t("اسم الحملة (عربي)", "Campaign name (Arabic)")}
                </label>
                <input
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full rounded-2xl border border-line bg-white px-3.5 py-2.5 text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  placeholder={t("حملة فلفلة الخضراء", "Green Filfila Campaign")}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
                  {t("اسم الحملة (إنجليزي)", "Campaign name (English)")}
                </label>
                <input
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  dir="ltr"
                  className="w-full rounded-2xl border border-line bg-white px-3.5 py-2.5 text-start text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  placeholder="Green Filfila Campaign"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-charcoal/65">
                  <MapPin className="size-3.5 text-brand" />
                  {t("البلدية", "Municipality")}
                  {muniLocked && (
                    <span className="rounded-full bg-[#FBF2DC] px-1.5 py-0.5 text-[8px] font-bold text-[#8A6516]">
                      {t("بلديتك فقط", "your municipality")}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={municipalityId}
                    onChange={(e) => chooseMuni(e.target.value)}
                    disabled={muniLocked}
                    className="w-full appearance-none rounded-2xl border border-line bg-white px-3.5 py-2.5 pe-9 text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-cream disabled:text-charcoal/50"
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
                <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-charcoal/65">
                  <CalendarDays className="size-3.5 text-brand" />
                  {t("تاريخ الحملة", "Campaign date")}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-2xl border border-line bg-white px-3.5 py-2.5 text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-charcoal/65">
                <MapPin className="size-3.5 text-brand" />
                {t("الإحداثيات الجغرافية للموقع", "Site geo-coordinates")}
                <Badge tone="mint" className="ms-1">
                  {t("إلزامي", "Required")}
                </Badge>
              </label>
              <div className="grid grid-cols-2 gap-2" dir="ltr">
                <div className="relative">
                  <span className="absolute start-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-charcoal/35">
                    LAT
                  </span>
                  <input
                    type="number"
                    step="any"
                    min={-90}
                    max={90}
                    required
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white py-2.5 pe-2.5 ps-11 text-start text-[12px] font-semibold text-forest outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
                    placeholder="36.876000"
                  />
                </div>
                <div className="relative">
                  <span className="absolute start-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-charcoal/35">
                    LNG
                  </span>
                  <input
                    type="number"
                    step="any"
                    min={-180}
                    max={180}
                    required
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white py-2.5 pe-2.5 ps-11 text-start text-[12px] font-semibold text-forest outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
                    placeholder="6.906000"
                  />
                </div>
              </div>
              <p className="mt-1 text-[8.5px] text-charcoal/35">
                {t(
                  `نقطة ارتكاز الحملة على الخريطة الحقيقية — تُضبط تلقائياً على مركز ${muni.nameAr}.`,
                  `The campaign anchor on the real map — pre-filled with the centre of ${muni.nameEn}.`,
                )}
              </p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-charcoal/65">
                <Users className="size-3.5 text-brand" />
                {t("الجهة المنظمة", "Organizer")}
              </label>
              <input
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full rounded-2xl border border-line bg-white px-3.5 py-2.5 text-[12px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                placeholder={t(
                  "مثال: جمعية متطوعي سكيكدة",
                  "e.g. Skikda volunteers association",
                )}
              />
            </div>

            <div className="rounded-[22px] border border-line/70 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
                    <MapPin className="size-3.5 text-brand" />
                    {t("حدود موقع التشجير على الخريطة", "Site boundary on the map")}
                  </p>
                  <p className="mt-0.5 text-[9px] leading-snug text-charcoal/45">
                    {t(
                      "انقر على الخريطة لإضافة نقاط المضلع (3 نقاط على الأقل). تركها فارغاً اختياري.",
                      "Click the map to add polygon points (at least 3). Leaving it empty is optional.",
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-mint-soft px-2.5 py-1 font-mono text-[10px] font-bold text-brand">
                    {polygon.length} {t("نقطة", "points")}
                  </span>
                  <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] font-bold text-forest">
                    {formatArea(areaSqm, lang)}
                  </span>
                </div>
              </div>
              <div className="mt-3 h-[230px] overflow-hidden rounded-2xl border border-line/70">
                <PolygonDrawMap
                  center={center}
                  value={polygon}
                  onChange={setPolygon}
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[9px] text-charcoal/40">
                  {t(
                    "نقطة المركز المُدخلة أعلاه تبقى مرجع الموقع حتى دون رسم مضلع.",
                    "The centre coordinates above stay the site reference even without a polygon.",
                  )}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPolygon((pts) => pts.slice(0, -1))}
                    disabled={polygon.length === 0}
                    className="rounded-full border border-line bg-white px-2.5 py-1 text-[9.5px] font-semibold text-forest transition hover:bg-mint-soft disabled:opacity-40"
                  >
                    {t("إزالة آخر نقطة", "Undo point")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPolygon([])}
                    disabled={polygon.length === 0}
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-[9.5px] font-semibold text-forest transition hover:bg-mint-soft disabled:opacity-40"
                  >
                    <Trash2 className="size-3" />
                    {t("مسح / إعادة رسم", "Clear / redraw")}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
                {t("نوع الشجرة", "Tree species")}
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {SPECIES.map((sp) => {
                  const active = !customSpecies && sp.ar === speciesAr;
                  return (
                    <button
                      key={sp.ar}
                      onClick={() => {
                        setCustomSpecies(false);
                        setSpeciesAr(sp.ar);
                        setSpeciesEn(sp.en);
                      }}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl border p-2.5 text-start transition",
                        active
                          ? "border-brand bg-mint-soft shadow-sm"
                          : "border-line bg-white hover:border-brand/30",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-lg",
                          active ? "bg-brand text-white" : "bg-cream text-brand",
                        )}
                      >
                        <TreePine className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[10.5px] font-bold text-forest">
                          {lang === "ar" ? sp.ar : sp.en}
                        </p>
                        <p className="text-[8px] text-charcoal/35">{sp.en}</p>
                      </div>
                    </button>
                  );
                })}
                <button
                  onClick={() => setCustomSpecies((prev) => !prev)}
                  className={cn(
                    "flex items-center gap-2 rounded-2xl border p-2.5 text-start transition",
                    customSpecies
                      ? "border-brand bg-mint-soft shadow-sm"
                      : "border-dashed border-line bg-white hover:border-brand/30",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-lg",
                      customSpecies ? "bg-brand text-white" : "bg-cream text-brand",
                    )}
                  >
                    <Plus className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[10.5px] font-bold text-forest">
                      {t("نوع آخر…", "Other…")}
                    </p>
                    <p className="text-[8px] text-charcoal/35">
                      {t("إدخال يدوي", "Manual entry")}
                    </p>
                  </div>
                </button>
              </div>
              {customSpecies && (
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={t(
                    "أدخل نوع الشجرة يدوياً — مثال: توت، لوز…",
                    "Type the species manually — e.g. Mulberry, Almond…",
                  )}
                  className="mt-2 w-full rounded-2xl border border-brand/40 bg-white px-3.5 py-2.5 text-[12px] outline-none focus:border-brand"
                />
              )}
            </div>

            <div className="flex items-start gap-2 rounded-2xl bg-mint-soft/60 p-3 text-[10px] leading-relaxed text-brand-dark/70">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              {t(
                "تُسجَّل الأشجار داخل الحملة برقم تسلسلي وإحداثيات صف وعمود لحساب إحصائيات الأنواع، بينما يُصدر رمز QR واحد للموقع فقط.",
                "Trees are registered with sequential IDs and row/column coordinates for species statistics; only the site gets a QR code.",
              )}
            </div>
          </div>
        )}

        {step === 1 && !isEdit && (
          <div className="grid gap-4 animate-fade-up lg:grid-cols-[1fr_1.05fr]">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-charcoal/65">
                  <span>{t("عدد الأشجار", "Tree count")}</span>
                  <span className="font-mono text-[11px] text-brand">{count}</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCount((c) => Math.max(1, c - 5))}
                    className="grid size-9 place-items-center rounded-xl border border-line bg-white text-forest hover:bg-mint-soft"
                    aria-label="decrease"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={count}
                    onChange={(e) => setCount(Math.max(1, Math.min(300, Number(e.target.value) || 1)))}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-center font-display text-lg font-bold text-forest outline-none focus:border-brand"
                  />
                  <button
                    onClick={() => setCount((c) => Math.min(300, c + 5))}
                    className="grid size-9 place-items-center rounded-xl border border-line bg-white text-forest hover:bg-mint-soft"
                    aria-label="increase"
                  >
                    +
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[25, 50, 100, 150, 200].map((n) => (
                    <button
                      key={n}
                      onClick={() => setCount(n)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[9.5px] font-semibold transition",
                        count === n
                          ? "border-brand bg-mint-soft text-brand"
                          : "border-line bg-white text-charcoal/45 hover:border-brand/30",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
                  {t("نمط التوزيع", "Layout mode")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLayout("grid")}
                    className={cn(
                      "rounded-2xl border p-3 text-start transition",
                      layout === "grid"
                        ? "border-brand bg-mint-soft"
                        : "border-line bg-white hover:border-brand/30",
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-forest">
                      <Grid3X3 className="size-4 text-brand" />
                      {t("شبكة / مصفوفة", "Grid / matrix")}
                    </span>
                    <p className="mt-1 text-[9px] leading-snug text-charcoal/45">
                      {t("توزيع متوازن صفوفاً وأعمدة", "Balanced rows and columns")}
                    </p>
                  </button>
                  <button
                    onClick={() => setLayout("rows")}
                    className={cn(
                      "rounded-2xl border p-3 text-start transition",
                      layout === "rows"
                        ? "border-brand bg-mint-soft"
                        : "border-line bg-white hover:border-brand/30",
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-forest">
                      <Rows3 className="size-4 text-brand" />
                      {t("خطوط مستقيمة", "Straight rows")}
                    </span>
                    <p className="mt-1 text-[9px] leading-snug text-charcoal/45">
                      {t("صفوف طويلة على محور واحد", "Long rows on one axis")}
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-charcoal/65">
                  <span className="flex items-center gap-1.5">
                    <Ruler className="size-3.5 text-brand" />
                    {t("مسافة التباعد", "Spacing distance")}
                  </span>
                  <span className="font-mono text-[11px] text-brand">{spacing} m</span>
                </label>
                <input
                  type="range"
                  min={2}
                  max={10}
                  step={0.5}
                  value={spacing}
                  onChange={(e) => setSpacing(Number(e.target.value))}
                  className="w-full accent-[#16865B]"
                />
                <div className="flex justify-between text-[8.5px] text-charcoal/35">
                  <span>2 m</span>
                  <span>6 m</span>
                  <span>10 m</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: t("صفوف", "Rows"), value: rows },
                  { label: t("أعمدة", "Columns"), value: cols },
                  {
                    label: t("مساحة تقريبية", "Approx. area"),
                    value: `${Math.round(((cols - 1) * spacing * (rows - 1) * spacing) / 100)} a`,
                  },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-cream/80 p-2.5 text-center">
                    <p className="font-display text-lg font-bold text-forest">{stat.value}</p>
                    <p className="text-[8.5px] text-charcoal/40">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live grid preview */}
            <div className="rounded-[22px] border border-line/70 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-[10.5px] font-bold text-forest">
                  <LayoutGrid className="size-3.5 text-brand" />
                  {t("معاينة المخطط الميداني", "Field layout preview")}
                </p>
                <Badge tone="mint">
                  {layout === "grid" ? t("مصفوفة", "Grid") : t("صفوف", "Rows")}
                </Badge>
              </div>
              <div className="mt-3 max-h-[280px] overflow-auto rounded-xl bg-[#F1F7EE] p-3 map-dots">
                <div
                  className="grid gap-1.5"
                  style={{ gridTemplateColumns: `repeat(${Math.min(cols, 16)}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: Math.min(count, 120) }).map((_, i) => {
                    const row = Math.floor(i / cols) + 1;
                    const col = (i % cols) + 1;
                    return (
                      <span
                        key={i}
                        title={`R${row} / C${col}`}
                        className="group relative grid aspect-square place-items-center rounded-full bg-brand/15 text-[7px] font-bold text-brand transition hover:bg-brand hover:text-white"
                      >
                        <span className="size-1.5 rounded-full bg-brand group-hover:bg-white" />
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[8.5px] text-charcoal/40">
                <span>
                  {count > 120
                    ? t(`معاينة أول 120 من ${count} شجرة`, `Previewing 120 of ${count} trees`)
                    : t(`${count} شجرة موزعة`, `${count} trees laid out`)}
                </span>
                <span>
                  {cols} × {rows} · {spacing} m
                </span>
              </div>
              <div className="mt-2.5 flex items-start gap-1.5 rounded-xl bg-[#FBF2DC]/70 px-2.5 py-2 text-[8.5px] leading-snug text-[#8A6516]">
                <Grid3X3 className="mt-0.5 size-3 shrink-0" />
                {t(
                  "كل نقطة تمثل شجرة. الإحداثيات (صف/عمود) تُستخدم لاسترجاع رقم الشجرة من مخطط الحملة.",
                  "Each dot is a tree. Row/column coordinates recover its ID from the campaign layout.",
                )}
              </div>
            </div>
          </div>
        )}

        {step === finalStep && (
          <div className="space-y-4 animate-fade-up">
            <div className="overflow-hidden rounded-[22px] border border-line/70 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-forest px-4 py-3 text-white">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-mint/60">
                    {t("ملخص الحملة", "CAMPAIGN SUMMARY")}
                  </p>
                  <h3 className="font-display text-base font-bold">{nameAr}</h3>
                  <p className="text-[10px] text-white/50">
                    {lang === "ar" ? muni.nameAr : muni.nameEn} · {formatDate(date, lang)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge tone="white">{count} {t("شجرة", "trees")}</Badge>
                  <Badge tone="white">{layout === "grid" ? t("شبكة", "Grid") : t("صفوف", "Rows")}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                {[
                  { label: t("البلدية", "Municipality"), value: muni.code },
                  { label: t("النوع", "Species"), value: lang === "ar" ? speciesObj.ar : speciesObj.en },
                  { label: t("التباعد", "Spacing"), value: `${spacing} m` },
                  { label: t("الأبعاد", "Dimensions"), value: `${cols}×${rows}` },
                  { label: t("خط العرض", "Latitude"), value: Number(lat).toFixed(6) },
                  { label: t("خط الطول", "Longitude"), value: Number(Number(lng).toFixed(6)) },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[8.5px] uppercase tracking-wide text-charcoal/35">{item.label}</p>
                    <p className="mt-0.5 text-[11.5px] font-bold text-forest">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line/70 bg-white p-4">
                <p className="flex items-center gap-1.5 text-[10.5px] font-bold text-forest">
                  <QrCode className="size-3.5 text-brand" />
                  {t("رمز QR واحد للموقع", "One QR code for the site")}
                </p>
                <div className="mt-2.5 flex items-center gap-3 rounded-xl bg-cream/70 px-3 py-2.5">
                  <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-white ring-1 ring-line">
                    <QrCode className="size-8 text-forest" strokeWidth={1.4} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-[10.5px] font-bold text-forest" dir="ltr">
                      /scan?code=…
                    </p>
                    <p className="mt-0.5 text-[9px] leading-snug text-charcoal/45">
                      {t(
                        "مسح الرمز يفتح بطاقة الموقع: الاسم، البلدية، التاريخ، الجهة المنظمة، إجمالي الأشجار والأنواع، وحالة الموقع.",
                        "Scanning opens the site card: name, municipality, date, organizer, tree/species totals and site status.",
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] text-charcoal/45">
                  <span className="rounded-full bg-mint-soft px-2 py-0.5 font-semibold text-brand">
                    {organizer.trim() || t("بدون جهة منظمة", "No organizer")}
                  </span>
                  <span className="rounded-full border border-line px-2 py-0.5 font-semibold text-forest">
                    {formatArea(areaSqm, lang)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-line/70 bg-white p-4">
                <p className="flex items-center gap-1.5 text-[10.5px] font-bold text-forest">
                  <Check className="size-3.5 text-brand" />
                  {t("ما سيتم إصداره", "What gets issued")}
                </p>
                <ul className="mt-2 space-y-1.5 text-[9.5px] text-charcoal/55">
                  {[
                    t("لافتة ميدانية واحدة مقاس A4", "One A4 field sign"),
                    t("رمز QR واحد عالي الدقة لكل موقع", "One high-resolution QR code per site"),
                    t("بطاقة موقع كاملة تُعرض عند المسح", "A full site card shown on scan"),
                    t("إحصائيات الأنواع من الأشجار المسجّلة", "Species statistics from registered trees"),
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <Check className="size-3 text-brand" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-2xl bg-mint-soft/60 p-3 text-[10px] leading-relaxed text-brand-dark/70">
              <Sprout className="mt-0.5 size-3.5 shrink-0" />
              {t(
                "بعد الإنشاء، ستفتح لافتة الموقع للطباعة مباشرة. تبقى الأشجار مسجّلة داخل الحملة لحساب الإحصائيات ومتابعة الرعاية.",
                "After creation, the site sign opens for printing automatically. Trees stay registered within the campaign for statistics and care tracking.",
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Progress
            value={((step + 1) / steps.length) * 100}
            className="h-1.5 flex-1"
          />
          <span className="text-[9px] font-semibold text-charcoal/40">
            {step + 1}/{steps.length}
          </span>
        </div>
      </div>
    </Modal>
  );
}
