import type { Metadata } from "next";
import Link from "next/link";
import { QrCode } from "lucide-react";
import AppShell from "@/components/AppShell";
import type { ModalState } from "@/lib/types";

export const metadata: Metadata = {
  title: "مسح كو آر",
};

const SCAN_MODAL: ModalState = { type: "scanner" };

export default function ScanPage() {
  return (
    <AppShell initialModal={SCAN_MODAL}>
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-800 text-white">
          <QrCode className="size-7" />
        </span>
        <h1 className="mt-4 text-[16px] font-extrabold text-emerald-950">
          ماسح رمز الموقع
        </h1>
        <p className="mt-2 text-[11px] leading-relaxed text-emerald-950/50">
          وجّه الكاميرا نحو رمز الحملة أو أدخل رمزها يدوياً لفتح بطاقة الموقع.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-full bg-emerald-800 px-4 py-2 text-[11px] font-bold text-white"
        >
          العودة للرئيسية
        </Link>
      </div>
    </AppShell>
  );
}
