"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ChevronDown,
  Copy,
  ExternalLink,
  FileText,
  Grid3X3,
  Info,
  MapPin,
  Printer,
  QrCode,
  Search,
  TreePine,
  X,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { getMunicipality } from "@/lib/municipalities";
import { pad3, sequenceFromId, formatDate } from "@/lib/utils";
import { Badge, Modal } from "./ui";

type PrintLabel = {
  id: string;
  row: number;
  col: number;
  speciesAr: string;
  speciesEn: string;
  real: boolean;
};

export default function PrintQR({ campaignId }: { campaignId: string }) {
  const { t, lang, campaigns, trees, findTree, closeModal, openModal, notify } =
    useApp();
  const campaign = campaigns.find((c) => c.id === campaignId);
  const [recRow, setRecRow] = useState(1);
  const [recCol, setRecCol] = useState(1);
  const [maxPrintCount, setMaxPrintCount] = useState<number>(12);

  const labels = useMemo<PrintLabel[]>(() => {
    if (!campaign) return [];
    const actual = trees.filter((tr) => tr.campaignId === campaign.id);
    const actualLabels: PrintLabel[] = actual.map((tr) => ({
      id: tr.id,
      row: tr.row,
      col: tr.col,
      speciesAr: tr.speciesAr,
      speciesEn: tr.speciesEn,
      real: true,
    }));
    const missing = Math.max(0, campaign.planted - actual.length);
    if (missing === 0) return actualLabels;

    const cols =
      campaign.layout === "grid"
        ? Math.max(1, Math.ceil(Math.sqrt(campaign.planted)))
        : Math.max(1, Math.min(12, campaign.planted));

    const usedSeq = new Set(actual.map((tr) => sequenceFromId(tr.id)));
    const missingSeqs: number[] = [];
    for (let seq = 1; seq <= campaign.planted && missingSeqs.length < missing; seq++) {
      if (!usedSeq.has(seq)) missingSeqs.push(seq);
    }
    let nextSeq =
      Math.max(campaign.planted, ...actual.map((tr) => sequenceFromId(tr.id))) + 1;
    while (missingSeqs.length < missing) {
      if (!usedSeq.has(nextSeq)) missingSeqs.push(nextSeq);
      nextSeq += 1;
    }

    const occupied = new Set(actual.map((tr) => `${tr.row}:${tr.col}`));
    const positions: Array<{ row: number; col: number }> = [];
    for (let idx = 0; idx < campaign.planted && positions.length < missing; idx++) {
      const row = Math.floor(idx / cols) + 1;
      const col = (idx % cols) + 1;
      if (!occupied.has(`${row}:${col}`)) positions.push({ row, col });
    }
    let idx = campaign.planted;
    while (positions.length < missing) {
      positions.push({ row: Math.floor(idx / cols) + 1, col: (idx % cols) + 1 });
      idx += 1;
    }

    const muni = getMunicipality(campaign.municipalityId);
    const synthetic: PrintLabel[] = missingSeqs.map((seq, i) => ({
      id: `SKK-${muni.code}-${pad3(seq)}`,
      row: positions[i].row,
      col: positions[i].col,
      speciesAr: campaign.speciesAr,
      speciesEn: campaign.speciesEn,
      real: false,
    }));
    return [...actualLabels, ...synthetic];
  }, [campaign, trees]);

  if (!campaign) {
    return (
      <Modal
        open
        onClose={closeModal}
        title={t("رموز QR", "QR codes")}
        icon={<QrCode className="size-5" />}
        size="sm"
      >
        <p className="py-6 text-center text-[12px] text-charcoal/50">
          {t("لم يتم العثور على الحملة.", "Campaign not found.")}
        </p>
      </Modal>
    );
  }

  const muni = getMunicipality(campaign.municipalityId);
  const rows = Array.from(new Set(labels.map((l) => l.row))).sort((a, b) => a - b);
  const cols = Array.from(new Set(labels.map((l) => l.col))).sort((a, b) => a - b);
  const recovered = labels.find((l) => l.row === recRow && l.col === recCol);
  const recoveredReal = recovered ? findTree(recovered.id) : undefined;

  const visibleLabels = labels.slice(0, maxPrintCount);

  const copyRecovered = async () => {
    if (!recovered) return;
    try {
      await navigator.clipboard.writeText(recovered.id);
      notify(t("تم نسخ رقم الشجرة المسترجع.", "Recovered tree ID copied."));
    } catch {
      notify(t("تعذّر النسخ.", "Could not copy."), "error");
    }
  };

  const openRecovered = () => {
    if (!recovered) return;
    if (recoveredReal) {
      closeModal();
      openModal({ type: "passport", treeId: recovered.id });
    } else {
      notify(
        "هذا الرقم مسترجع من مخطط الحملة. جواز الشجرة الكامل متاح بعد المزامنة الميدانية.",
        "This ID was recovered from the campaign layout. The full passport is available after field sync.",
        "info",
      );
    }
  };

  return (
    <Modal
      open
      onClose={closeModal}
      size="full"
      bare
      bodyClassName="p-0"
      className="overflow-hidden"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Toolbar */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white/85 px-4 py-3 backdrop-blur sm:px-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-forest text-mint">
              <QrCode className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-forest sm:text-lg">
                {t("رموز QR للحملة", "Campaign QR sheet")}
              </h2>
              <p className="flex flex-wrap items-center gap-x-2 text-[10px] text-charcoal/45">
                <span>{lang === "ar" ? campaign.nameAr : campaign.nameEn}</span>
                <span className="text-charcoal/20">·</span>
                <span>{lang === "ar" ? muni.nameAr : muni.nameEn}</span>
                <span className="text-charcoal/20">·</span>
                <span>{formatDate(campaign.date, lang)}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-cream px-3 py-1 text-[11px]">
              <span className="text-charcoal/60">{t("العدد للطباعة:", "Print count:")}</span>
              <select
                value={maxPrintCount}
                onChange={(e) => setMaxPrintCount(Number(e.target.value))}
                className="bg-transparent font-bold text-forest outline-none"
              >
                <option value={12}>12 {t("ملصق (صفحة واحدة A4)", "(1 A4 page)")}</option>
                <option value={24}>24 {t("ملصق (صفحتان)", "(2 pages)")}</option>
                <option value={labels.length}>{t("الكل", "All")} ({labels.length})</option>
              </select>
            </div>

            <Badge tone="mint">
              {visibleLabels.length} / {labels.length} {t("ملصق", "labels")}
            </Badge>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-[11.5px] font-bold text-white transition hover:bg-brand-dark"
            >
              <Printer className="size-3.5" />
              {t("طباعة / PDF", "Print / PDF")}
            </button>
            <button
              onClick={closeModal}
              className="grid size-9 place-items-center rounded-full border border-line bg-white text-charcoal/55 transition hover:text-forest"
              aria-label={t("إغلاق", "Close")}
            >
              <X className="size-4.5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-cream p-4 sm:p-5">
          {/* ID recovery section */}
          <div className="no-print mb-4 rounded-2xl border border-line/80 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-[#FBF2DC] text-[#8A6516]">
                  <Grid3X3 className="size-4.5" />
                </span>
                <div>
                  <p className="font-display text-[13px] font-bold text-forest">
                    {t("استرجاع رقم شجرة من إحداثياتها", "Recover a tree ID from its coordinates")}
                  </p>
                  <p className="text-[10px] text-charcoal/45">
                    {t(
                      "إذا تلف رمز QR الميداني، حدّد الصف والعمود لاسترجاع الرقم التسلسلي الدقيق.",
                      "If a field QR is damaged, select the row and column to recover the exact ID.",
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <label className="mb-1 block text-[8.5px] font-bold uppercase text-charcoal/35">
                    {t("الصف", "Row")}
                  </label>
                  <div className="relative">
                    <select
                      value={recRow}
                      onChange={(e) => setRecRow(Number(e.target.value))}
                      className="w-20 appearance-none rounded-xl border border-line bg-white px-2.5 py-2 pe-6 text-[11px] font-semibold text-forest outline-none focus:border-brand"
                    >
                      {rows.map((r) => (
                        <option key={r} value={r}>
                          R{r}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute end-2 top-1/2 size-3 -translate-y-1/2 text-charcoal/30" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[8.5px] font-bold uppercase text-charcoal/35">
                    {t("العمود", "Column")}
                  </label>
                  <div className="relative">
                    <select
                      value={recCol}
                      onChange={(e) => setRecCol(Number(e.target.value))}
                      className="w-20 appearance-none rounded-xl border border-line bg-white px-2.5 py-2 pe-6 text-[11px] font-semibold text-forest outline-none focus:border-brand"
                    >
                      {cols.map((c) => (
                        <option key={c} value={c}>
                          C{c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute end-2 top-1/2 size-3 -translate-y-1/2 text-charcoal/30" />
                  </div>
                </div>
                <div className="flex min-w-[190px] items-center gap-2 rounded-xl bg-mint-soft px-3 py-2">
                  <Search className="size-3.5 shrink-0 text-brand" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] uppercase text-brand/50">
                      {t("الرقم المسترجع", "Recovered ID")}
                    </p>
                    <p className="truncate font-mono text-[11px] font-extrabold text-brand-dark">
                      {recovered?.id ?? "—"}
                    </p>
                  </div>
                  <button
                    onClick={copyRecovered}
                    className="grid size-7 place-items-center rounded-lg bg-white text-brand hover:bg-mint"
                    aria-label={t("نسخ", "Copy")}
                  >
                    <Copy className="size-3" />
                  </button>
                  <button
                    onClick={openRecovered}
                    className="grid size-7 place-items-center rounded-lg bg-brand text-white hover:bg-brand-dark"
                    aria-label={t("فتح", "Open")}
                  >
                    <ExternalLink className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2 text-[9.5px] text-charcoal/40">
            <span className="flex items-center gap-1.5">
              <FileText className="size-3.5 text-brand" />
              {t(
                "معاينة A4 — كل ملصق يحتوي رمز QR ورقم الشجرة والإحداثيات.",
                "A4 preview — each label includes a QR code, tree ID and coordinates.",
              )}
            </span>
            <span>
              {t("مقاس الطباعة المقترح: A4 · 3 أعمدة", "Suggested print: A4 · 3 columns")}
            </span>
          </div>

          {/* Printable area */}
          <div
            id="print-area"
            className="mx-auto w-full max-w-[950px] rounded-2xl border border-line/70 bg-white p-4 shadow-sm sm:p-6 print:m-0 print:w-full print:max-w-none print:border-0 print:p-2 print:shadow-none"
          >
            <div className="mb-3 flex items-start justify-between gap-3 border-b-2 border-forest pb-2 print:mb-2 print:pb-1">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="grid size-6 place-items-center rounded-lg bg-forest text-mint print:bg-forest">
                    <TreePine className="size-3.5" />
                  </span>
                  <p className="font-display text-sm font-extrabold text-forest">
                    {t("شجرتي بصمتي", "SHAJARATI BASMATI")}
                  </p>
                  <span className="rounded-full bg-mint-soft px-2 py-0.5 text-[7px] font-bold text-brand">
                    {t("سكيكدة", "SKIKDA")}
                  </span>
                </div>
                <p className="mt-0.5 text-[8px] text-charcoal/50">
                  {t(
                    "بطاقات تعريف الأشجار — لا نغرس شجرة ونرحل، بل نتابعها حتى تنمو",
                    "Tree identity labels — we don't plant and leave, we follow until it grows",
                  )}
                </p>
              </div>
              <div className="text-end">
                <p className="text-[9px] font-bold text-forest">
                  {lang === "ar" ? campaign.nameAr : campaign.nameEn}
                </p>
                <p className="text-[7.5px] text-charcoal/45">
                  {lang === "ar" ? muni.nameAr : muni.nameEn} · {muni.code} ·{" "}
                  {formatDate(campaign.date, lang)}
                </p>
                <p className="mt-0.5 font-mono text-[7.5px] text-charcoal/35">
                  {campaign.id}
                </p>
              </div>
            </div>

            {/* Grid display with strict page-break control */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 print:grid-cols-3 print:gap-3.5 print:w-full">
              {visibleLabels.map((label) => (
                <div
                  key={label.id}
                  className="print-label flex items-center justify-between gap-2 rounded-xl border border-dashed border-charcoal/30 bg-white p-2.5 print:break-inside-avoid print:page-break-inside-avoid"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[10px] font-black tracking-tight text-forest">
                      {label.id}
                    </p>
                    <p className="mt-0.5 truncate text-[8px] font-semibold text-charcoal/70">
                      {lang === "ar" ? label.speciesAr : label.speciesEn}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[7.5px] text-charcoal/50">
                      <MapPin className="size-2.5 text-brand" />
                      {muni.code} · R{label.row}/C{label.col}
                    </p>
                    <p className="mt-1 text-[7px] font-extrabold uppercase tracking-wide text-brand">
                      {t("امسح للتحقق", "SCAN TO VERIFY")}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-lg border border-forest/15 bg-white p-1">
                    <QRCodeSVG
                      value={`https://shajarati.dz/tree/${label.id}`}
                      size={64}
                      bgColor="#ffffff"
                      fgColor="#123B2A"
                      level="M"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-[7px] text-charcoal/35 print:mt-2">
              <span>
                {t(
                  "جواز رقمي فريد لكل شجرة · شجرتي بصمتي — ولاية سكيكدة",
                  "A unique digital passport for every tree · Shajarati Basmati — Skikda",
                )}
              </span>
              <span className="font-mono">
                {visibleLabels.length} labels · {new Date().getFullYear()}
              </span>
            </div>
          </div>

          <div className="no-print mt-3 flex items-center justify-center gap-1.5 text-[9px] text-charcoal/35">
            <Info className="size-3" />
            {t(
              "نصيحة: اطبع على ورق مقاوم للماء أو غلّف الملصق قبل تثبيته على الشجرة.",
              "Tip: print on water-resistant paper or laminate labels before attaching to trees.",
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}