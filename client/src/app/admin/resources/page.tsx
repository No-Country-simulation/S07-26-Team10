import { Suspense } from "react";
import type { Metadata } from "next";
import { ResourcesManagement, ResourcesManagementSkeleton } from "@/features/admin/components/resources/resources-management";

export const metadata: Metadata = {
  title: "Recursos | PhysaFlow Admin",
  description: "Gestión de recursos visuales y activos del reporte",
};

export default function AdminResourcesPage() {
  return (
    <Suspense fallback={<ResourcesManagementSkeleton />}>
      <ResourcesManagement />
    </Suspense>
  );
}
