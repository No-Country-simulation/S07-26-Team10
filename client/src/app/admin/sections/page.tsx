import { Suspense } from "react";
import type { Metadata } from "next";
import { SectionsManagement, SectionsManagementSkeleton } from "@/features/admin/components/sections/sections-management";

export const metadata: Metadata = {
  title: "Secciones | PhysaFlow Admin",
  description: "Gestión de secciones del reporte",
};

export default function AdminSectionsPage() {
  return (
    <Suspense fallback={<SectionsManagementSkeleton />}>
      <SectionsManagement />
    </Suspense>
  );
}
