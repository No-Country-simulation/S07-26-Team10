import { Suspense } from "react";
import type { Metadata } from "next";
import { ReferencesManagement, ReferencesManagementSkeleton } from "@/features/admin/components/references-management";

export const metadata: Metadata = {
  title: "Referencias | PhysaFlow Admin",
  description: "Gestión de referencias",
};

export default function AdminReferencesPage() {
  return (
    <Suspense fallback={<ReferencesManagementSkeleton />}>
      <ReferencesManagement />
    </Suspense>
  );
}
