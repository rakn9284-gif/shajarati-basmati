import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import ManagementTools from "@/components/ManagementTools";
import Profile from "@/components/Profile";

export const metadata: Metadata = {
  title: "حسابي",
};

export default function ProfilePage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <Header />
        <Profile />
        <ManagementTools />
      </div>
    </AppShell>
  );
}
