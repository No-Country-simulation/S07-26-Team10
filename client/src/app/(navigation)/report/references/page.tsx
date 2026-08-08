import type { Metadata } from "next";
import { ExternalLink, BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getReferences } from "@/features/home/data/references";

export const metadata: Metadata = {
  title: "Referencias | PhysaFlow Research",
  description:
    "Referencias y fuentes citadas en el reporte público de Capacidad Estancada.",
};

export default async function ReferencesPage() {
  const references = await getReferences();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-16 space-y-12 font-sans">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/60 text-muted-foreground font-mono text-xs uppercase tracking-widest rounded-full border border-border">
          <BookOpen className="size-3.5" /> REFERENCIAS
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-foreground leading-tight">
          Referencias y fuentes
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Documentación y fuentes de referencia citadas a lo largo del reporte,
          presentadas en formato académico APA.
        </p>
      </header>

      <Separator />

      <ol className="space-y-6">
        {references.map((ref) => (
          <li
            key={ref.title}
            className="p-6 rounded-xl border border-border/60 bg-muted/20 space-y-2"
          >
            <p className="text-base sm:text-lg text-foreground leading-relaxed">
              <span className="font-semibold">{ref.authors}</span>. ({ref.year}).{" "}
              <span className="italic">{ref.title}</span>. {ref.source}.
            </p>
            <a
              href={ref.citationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ExternalLink className="size-3.5" />
              {ref.source}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}