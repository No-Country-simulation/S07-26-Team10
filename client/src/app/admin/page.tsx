import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminDashboard, AdminDashboardSkeleton } from "@/features/admin/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Dashboard | PhysaFlow Admin",
  description: "Resumen general del panel de administración",
};

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboard />
    </Suspense>
  );
}
