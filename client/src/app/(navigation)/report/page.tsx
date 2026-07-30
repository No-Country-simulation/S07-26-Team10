import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Reporte Principal | PhysaFlow Research",
  description: "Documento oficial e informe completo de investigación.",
};

export default function ReportPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-16 space-y-12 font-sans">
      {/* Main Header */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/60 text-muted-foreground font-mono text-xs uppercase tracking-widest rounded-full border border-border">
          <FileText className="size-3.5" /> REPORTE OFICIAL COMPLETO
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-foreground leading-tight">
          Reporte de Investigación de Infraestructura
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Documento especializado sobre rendimiento, eficiencia térmica y
          gestión de capacidad en supercomputación.
        </p>
      </header>

      <Separator />

      {/* Static Report Placeholder Content */}
      <article className="space-y-8 text-foreground/90 text-base sm:text-lg leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-serif font-bold text-foreground">
            1. Introducción al Documento
          </h2>
          <p className="text-muted-foreground">
            Bienvenido al reporte principal de PhysaFlow. Este espacio está
            destinado para la consulta del documento especializado de
            investigación.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif font-bold text-foreground">
            2. Contenido del Informe
          </h2>
          <p className="text-muted-foreground">
            Los datos analíticos avanzados y la telemetría detallada del reporte
            técnico estarán disponibles en este apartado.
          </p>
        </section>
      </article>
    </div>
  );
}
