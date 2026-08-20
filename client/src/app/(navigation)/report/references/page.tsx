import type { Metadata } from "next";
import { getPublicReferences } from "@/features/public/references/queries/references";
import { ReferencesChapter } from "@/components/report/references/ReferencesChapter";

export const metadata: Metadata = {
  title: "Referencias | PhysaFlow Research",
  description: "Referencias y fuentes citadas en el reporte público de Capacidad Estancada.",
};

export default async function ReferencesPage() {
  const references = await getPublicReferences();

  return <ReferencesChapter references={references} />;
}
