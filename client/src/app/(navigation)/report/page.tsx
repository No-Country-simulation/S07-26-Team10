import type { Metadata } from "next";
import { DefinitionChapter } from "@/components/report/definition/DefinitionChapter";

export const metadata: Metadata = {
  title: "Definición | PhysaFlow Research",
  description:
    "La definición de Capacidad Estancada y el marco del reporte público de PhysaFlow.",
};

export default function ReportPage() {
  return <DefinitionChapter />;
}