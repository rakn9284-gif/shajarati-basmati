import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import AppShell from "@/components/AppShell";
import type { ModalState } from "@/lib/types";

export const metadata: Metadata = {
  title: "إضافة حملة تشجير",
};

const NEW_CAMPAIGN_MODAL: ModalState = { type: "campaign" };

export default function NewCampaignPage() {
  return (
    <AppShell initialModal={NEW_CAMPAIGN_MODAL}>
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-800 text-white">
          <Plus className="size-7" />
        </span>
        <h1 className="mt-4 text-[16px] font-extrabold text-emerald-950">
          إضافة حملة تشجير
        </h1>
        <p className="mt-2 text-[11px] leading-relaxed text-emerald-950/50">
          حدد البلدية، أدخل عدد الأشجار، ثم ارسم حدود الموقع على الخريطة قبل الحفظ.
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
