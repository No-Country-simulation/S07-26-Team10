import { Suspense } from "react";
import type { Metadata } from "next";
import { ReportsManagement, ReportsManagementSkeleton } from "@/features/admin/components/reports/reports-management";

export const metadata: Metadata = {
  title: "Reportes | PhysaFlow Admin",
  description: "Gestión de reportes del sistema",
};

export default function AdminReportsPage() {
  return (
    <Suspense fallback={<ReportsManagementSkeleton />}>
      <ReportsManagement />
    </Suspense>
  );
}
