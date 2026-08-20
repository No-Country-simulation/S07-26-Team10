import { Suspense } from "react";
import type { Metadata } from "next";
import { TaxonomyManagement, TaxonomyManagementSkeleton } from "@/features/admin/components/taxonomy/taxonomy-management";

export const metadata: Metadata = {
  title: "Taxonomía | PhysaFlow Admin",
  description: "Gestión de taxonomías y conceptos del reporte",
};

export default function AdminTaxonomyPage() {
  return (
    <Suspense fallback={<TaxonomyManagementSkeleton />}>
      <TaxonomyManagement />
    </Suspense>
  );
}
