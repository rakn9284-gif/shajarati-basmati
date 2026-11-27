import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import Profile from "@/components/Profile";

export const metadata: Metadata = {
  title: "حسابي",
};

export default function ProfilePage() {
  return (
    <AppShell>
      <Profile />
    </AppShell>
  );
}
