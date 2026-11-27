import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import MobileMapView from "@/components/MobileMapView";

export const metadata: Metadata = {
  title: "الخريطة",
};

export default function MapPage() {
  return (
    <AppShell>
      <MobileMapView />
    </AppShell>
  );
}
