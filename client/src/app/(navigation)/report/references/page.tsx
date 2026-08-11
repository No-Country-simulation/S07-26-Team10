import type { Metadata } from "next";
import { getReferences } from "@/features/home/data/references";
import { ReferencesChapter } from "@/components/report/references/ReferencesChapter";

export const metadata: Metadata = {
  title: "Referencias | PhysaFlow Research",
  description:
    "Referencias y fuentes citadas en el reporte público de Capacidad Estancada.",
};

export default async function ReferencesPage() {
  const references = await getReferences();

  return <ReferencesChapter references={references} />;
}