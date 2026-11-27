import type { Metadata } from "next";
import AdminRoute from "@/components/AdminRoute";
import AppShell from "@/components/AppShell";
import UserManagement from "@/components/UserManagement";

export const metadata: Metadata = {
  title: "إدارة المستخدمين",
};

export default function AdminUsersPage() {
  return (
    <AppShell>
      <AdminRoute
        titleAr="إدارة المستخدمين"
        titleEn="User Management"
        subtitleAr="إدارة الأدوار والصلاحيات — لأدمن الولاية فقط."
        subtitleEn="Roles and permissions — state admin only."
      >
        <UserManagement />
      </AdminRoute>
    </AppShell>
  );
}
