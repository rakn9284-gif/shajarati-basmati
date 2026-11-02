"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Grid3X3,
  Info,
  MapPin,
  Plus,
  Sprout,
  TreePine,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { getMunicipality, municipalityById, municipalities } from "@/lib/municipalities";
import { SPECIES, getSpecies } from "@/lib/data";
import { cn, pad3, sequenceFromId, todayISO } from "@/lib/utils";
import { Badge, Modal } from "./ui";
import { TreeArt } from "./TreeArt";

export default function TreeForm() {
  const {
    t,
    lang,
    user,
    trees,
    campaigns,
    addTree,
    closeModal,
    openModal,
    activeMunicipality,
  } = useApp();

  const defaultMuni =
    user?.role === "municipality_admin" && user.municipalityId
      ? user.municipalityId
      : activeMunicipality ?? "skikda";

  const [municipalityId, setMunicipalityId] = useState(defaultMuni);
  const [speciesAr, setSpeciesAr] = useState<string>(SPECIES[0].ar);
  const [speciesEn, setSpeciesEn] = useState<string>(SPECIES[0].en);
  const [customSpecies, setCustomSpecies] = useState(false);
  const [customName, setCustomName] = useState("");
  const [plantedAt, setPlantedAt] = useState(todayISO());
  const [row, setRow] = useState(1);
  const [col, setCol] = useState(1);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const muni = municipalityById(municipalityId) ?? getMunicipality("skikda");
  const muniLocked = user?.role === "municipality_admin";

  const [lat, setLat] = useState(String(muni.lat));
  const [lng, setLng] = useState(String(muni.lng));

  // Keep coordinates in sync when the municipality selector changes
  const onMunicipalityChange = (nextId: string) => {
    setMunicipalityId(nextId);
    const next = municipalityById(nextId);
    if (next) {
      setLat(String(next.lat));
      setLng(String(next.lng));
    }
  };

  const nextSeq = useMemo(() => {
    const maxTree = trees
      .filter((tr) => tr.municipalityId === municipalityId)
      .reduce((max, tr) => Math.max(max, sequenceFromId(tr.id)), 0);
    const maxCampaign = campaigns
      .filter((c) => c.municipalityId === municipalityId)
      .reduce((max, c) => Math.max(max, sequenceFromId(c.id)), 0);
    return Math.max(maxTree, maxCampaign) + 1;
  }, [trees, campaigns, municipalityId]);

  const previewId = `SKK-${muni.code}-${pad3(nextSeq)}`;

  /* النوع الفعّال: إما من الشبكة الجاهزة أو الاسم المُدخل يدوياً ("نوع آخر"). */
  const effectiveAr = customSpecies ? customName.trim() : speciesAr;
  const effectiveEn = customSpecies ? customName.trim() : speciesEn;
  const speciesObj = getSpecies(effectiveAr, effectiveEn);

  const pickSpecies = (sp: (typeof SPECIES)[number]) => {
    setCustomSpecies(false);
    setSpeciesAr(sp.ar);
    setSpeciesEn(sp.en);
  };

  const submit = () => {
    setError("");
    if (!plantedAt) {
      setError(t("يرجى اختيار تاريخ الغرس.", "Choose a planting date."));
      return;
    }
    if (customSpecies && !effectiveAr) {
      setError(
        t("يرجى إدخال اسم النوع المخصص.", "Please enter the custom species name."),
      );
      return;
    }
    if (row < 1 || col < 1) {
      setError(t("إحداثيات الصف والعمود يجب أن تكون أكبر من صفر.", "Row and column must be greater than zero."));
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
          "يرجى إدخال إحداثيات جغرافية صحيحة (خط عرض بين -90 و90، وخط طول بين -180 و180).",
          "Enter valid geo-coordinates (latitude between -90 and 90, longitude between -180 and 180).",
        ),
      );
      return;
    }
    const id = addTree({
      municipalityId,
      speciesAr: effectiveAr,
      speciesEn: effectiveEn,
      plantedAt,
      row,
      col,
      lat: Number(latNum.toFixed(6)),
      lng: Number(lngNum.toFixed(6)),
      notesAr: notes.trim() || undefined,
      notesEn: notes.trim() || undefined,
    });
    if (id) {
      closeModal();
      openModal({ type: "passport", treeId: id });
    }
  };

  return (
    <Modal
      open
      onClose={closeModal}
      title={t("تسجيل شجرة مفردة", "Register a single tree")}
      subtitle={t(
        "أصدر جوازاً رقمياً فورياً لشجرة واحدة مع إحداثياتها في المخطط.",
        "Issue an instant digital passport for one tree with its layout coordinates.",
      )}
      icon={<TreePine className="size-5" />}
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-2">
          <p className="hidden items-center gap-1.5 text-[10px] text-charcoal/40 sm:flex">
            <Info className="size-3.5 text-brand" />
            {t("سيتم إصدار رمز QR تلقائياً.", "A QR code is generated automatically.")}
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
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-[11.5px] font-bold text-white hover:bg-brand-dark"
            >
              <Plus className="size-3.5" />
              {t("تسجيل الشجرة", "Register tree")}
            </button>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-charcoal/65">
              <MapPin className="size-3.5 text-brand" />
              {t("البلدية", "Municipality")}
            </label>
            <div className="relative">
              <select
                value={municipalityId}
                onChange={(e) => onMunicipalityChange(e.target.value)}
                disabled={muniLocked}
                className="w-full appearance-none rounded-2xl border border-line bg-white px-3.5 py-2.5 pe-9 text-[12px] outline-none focus:border-brand disabled:bg-cream disabled:text-charcoal/50"
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
              {t("نوع الشجرة", "Species")}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {SPECIES.slice(0, 6).map((sp) => (
                <button
                  key={sp.ar}
                  onClick={() => pickSpecies(sp)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-start text-[10.5px] font-semibold transition",
                    !customSpecies && sp.ar === speciesAr
                      ? "border-brand bg-mint-soft text-brand-dark"
                      : "border-line bg-white text-charcoal/55 hover:border-brand/30",
                  )}
                >
                  <TreePine className="size-3.5 shrink-0" />
                  <span className="truncate">{lang === "ar" ? sp.ar : sp.en}</span>
                  {!customSpecies && sp.ar === speciesAr && (
                    <Check className="ms-auto size-3" />
                  )}
                </button>
              ))}
              <button
                onClick={() => setCustomSpecies((prev) => !prev)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-start text-[10.5px] font-semibold transition",
                  customSpecies
                    ? "border-brand bg-mint-soft text-brand-dark"
                    : "border-dashed border-line bg-white text-charcoal/55 hover:border-brand/30",
                )}
              >
                <Plus className="size-3.5 shrink-0" />
                <span className="truncate">
                  {t("نوع آخر…", "Other…")}
                </span>
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
                className="mt-1.5 w-full rounded-xl border border-brand/40 bg-white px-3 py-2 text-[11.5px] outline-none focus:border-brand"
              />
            )}
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-charcoal/65">
              <CalendarDays className="size-3.5 text-brand" />
              {t("تاريخ الغرس", "Planting date")}
            </label>
            <input
              type="date"
              value={plantedAt}
              onChange={(e) => setPlantedAt(e.target.value)}
              className="w-full rounded-2xl border border-line bg-white px-3.5 py-2.5 text-[12px] outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-charcoal/65">
              <MapPin className="size-3.5 text-brand" />
              {t("الإحداثيات الجغرافية", "Geo-coordinates")}
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
                `مضبوطة تلقائياً على مركز ${muni.nameAr} — عدّلها لموقع الشجرة بدقة.`,
                `Pre-filled with the centre of ${muni.nameEn} — adjust to the exact tree location.`,
              )}
            </p>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-charcoal/65">
              <Grid3X3 className="size-3.5 text-brand" />
              {t("الإحداثيات في المخطط", "Layout coordinates")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute start-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-charcoal/35">
                  {t("صف", "Row")}
                </span>
                <input
                  type="number"
                  min={1}
                  value={row}
                  onChange={(e) => setRow(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-xl border border-line bg-white py-2.5 pe-3 ps-11 text-center font-display text-sm font-bold text-forest outline-none focus:border-brand"
                />
              </div>
              <div className="relative">
                <span className="absolute start-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-charcoal/35">
                  {t("عمود", "Col")}
                </span>
                <input
                  type="number"
                  min={1}
                  value={col}
                  onChange={(e) => setCol(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-xl border border-line bg-white py-2.5 pe-3 ps-11 text-center font-display text-sm font-bold text-forest outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-charcoal/65">
              {t("ملاحظات (اختياري)", "Notes (optional)")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={t(
                "مثال: قرب مدخل المدرسة، تربة جيدة التصريف…",
                "e.g. near the school entrance, well-drained soil…",
              )}
              className="w-full resize-none rounded-2xl border border-line bg-white px-3.5 py-2.5 text-[11px] outline-none focus:border-brand"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-[#FBE7E7] px-3 py-2 text-[10.5px] font-medium text-[#B03636]">
              {error}
            </p>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <div className="overflow-hidden rounded-[22px] border border-line/70 bg-white">
            <div className="relative h-32">
              <TreeArt seed={speciesObj.art} />
              <span className="absolute start-2.5 top-2.5 rounded-full bg-white/85 px-2 py-1 text-[8.5px] font-bold text-forest backdrop-blur">
                {t("معاينة الجواز", "Passport preview")}
              </span>
            </div>
            <div className="p-3.5">
              <p className="text-[8.5px] uppercase tracking-wider text-charcoal/35">
                {t("رقم الشجرة", "TREE ID")}
              </p>
              <p className="mt-0.5 font-mono text-base font-extrabold text-forest">
                {previewId}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="mint">
                  {lang === "ar"
                    ? speciesObj.ar
                    : customSpecies
                      ? customName.trim() || t("نوع آخر", "Other")
                      : speciesObj.en}
                </Badge>
                <Badge tone="neutral">{muni.code}</Badge>
                <Badge tone="neutral">R{row} / C{col}</Badge>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-charcoal/40">
                <Sprout className="size-3 text-brand" />
                {t("سيُضاف إلى سجل البلدية فوراً", "Added to the municipality registry instantly")}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line/70 bg-white p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-bold text-forest">
              <Grid3X3 className="size-3.5 text-brand" />
              {t("موضع الشجرة", "Tree position")}
            </p>
            <div className="mt-2 grid grid-cols-6 gap-1">
              {Array.from({ length: 24 }).map((_, i) => {
                const r = Math.floor(i / 6) + 1;
                const c = (i % 6) + 1;
                const active = r === Math.min(row, 4) && c === Math.min(col, 6);
                return (
                  <span
                    key={i}
                    className={cn(
                      "aspect-square rounded-[4px]",
                      active ? "bg-brand shadow-sm" : "bg-cream",
                    )}
                    title={`R${r}/C${c}`}
                  />
                );
              })}
            </div>
            <p className="mt-1.5 text-[8.5px] text-charcoal/35">
              {t(
                `الصف ${row} / العمود ${col} — يُستخدم لاسترجاع الرقم عند تلف الرمز.`,
                `Row ${row} / Column ${col} — used to recover the ID if the tag is damaged.`,
              )}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
