import type { Metadata } from "next";
import AdminRoute from "@/components/AdminRoute";
import AppShell from "@/components/AppShell";
import Reports from "@/components/Reports";

export const metadata: Metadata = {
  title: "التقارير",
};

export default function AdminReportsPage() {
  return (
    <AppShell>
      <AdminRoute
        titleAr="التقارير"
        titleEn="Reports"
        subtitleAr="تحليلات الحملات والأشجار والبلديات."
        subtitleEn="Campaign, tree and municipality analytics."
      >
        <Reports />
      </AdminRoute>
    </AppShell>
  );
}
