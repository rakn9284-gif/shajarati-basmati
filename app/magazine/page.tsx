import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import Magazine from "@/components/Magazine";
import MagazineGuides from "@/components/MagazineGuides";

export const metadata: Metadata = {
  title: "المجلة",
};

export default function MagazinePage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <Magazine />
        <MagazineGuides />
      </div>
    </AppShell>
  );
}
