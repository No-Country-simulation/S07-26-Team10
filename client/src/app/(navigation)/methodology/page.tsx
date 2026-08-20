import type { Metadata } from "next";
import { MethodologyChapter } from "@/components/report/methodology/MethodologyChapter";

export const metadata: Metadata = {
  title: "Metodología | PhysaFlow Research",
  description:
    "Metodología de investigación y marco analítico del reporte de Capacidad Estancada.",
};

export default function MethodologyPage() {
  return <MethodologyChapter />;
}