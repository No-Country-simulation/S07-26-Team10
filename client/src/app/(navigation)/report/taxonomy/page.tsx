import type { Metadata } from "next";
import { getPublicTaxonomyData } from "@/features/public/taxonomy/queries/taxonomy";
import { TaxonomyMasthead } from "@/components/report/taxonomy/TaxonomyMasthead";
import { TaxonomyHow } from "@/components/report/taxonomy/TaxonomyHow";
import { TaxonomyAccordion } from "@/components/report/taxonomy/TaxonomyAccordion";

export const metadata: Metadata = {
  title: "Taxonomía | PhysaFlow Research",
  description: "Taxonomía de Capacidad Estancada organizada en Facility, IT y Workload.",
};

export default async function TaxonomyPage() {
  const categories = await getPublicTaxonomyData();

  return (
    <div className="taxonomy">
      <TaxonomyMasthead />
      <TaxonomyHow />
      <TaxonomyAccordion categories={categories} />
    </div>
  );
}
