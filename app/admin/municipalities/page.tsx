import type { Metadata } from "next";
import AdminRoute from "@/components/AdminRoute";
import AppShell from "@/components/AppShell";
import Municipalities from "@/components/Municipalities";

export const metadata: Metadata = {
  title: "البلديات - 38 بلدية",
};

export default function AdminMunicipalitiesPage() {
  return (
    <AppShell>
      <AdminRoute
        titleAr="البلديات - 38 بلدية"
        titleEn="Municipalities — 38"
        subtitleAr="دليل بلديات ولاية سكيكدة ومواقع الغرس."
        subtitleEn="Directory of Skikda municipalities and planting sites."
      >
        <Municipalities />
      </AdminRoute>
    </AppShell>
  );
}
