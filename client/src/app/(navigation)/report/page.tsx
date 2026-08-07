import { Suspense } from "react";
import { FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getHomeIntrosMap } from "@/features/home/home-queries";
import { ReportMdxContent } from "@/features/home/components/report-mdx-content";
import { LanguageContentWrapper } from "@/features/home/components/language-content-wrapper";

export const metadata = {
  title: "Definición | PhysaFlow Research",
  description:
    "La definición de Capacidad Estancada y el marco del reporte público de PhysaFlow.",
};

async function ReportContainer() {
  const reportsMap = await getHomeIntrosMap();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-16 space-y-12 font-sans">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/60 text-muted-foreground font-mono text-xs uppercase tracking-widest rounded-full border border-border">
          <FileText className="size-3.5" /> DEFINICIÓN DEL REPORTE
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-foreground leading-tight">
          <LanguageContentWrapper
            contentEs={reportsMap.es.title}
            contentEn={reportsMap.en.title}
          />
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          <LanguageContentWrapper
            contentEs={reportsMap.es.description}
            contentEn={reportsMap.en.description}
          />
        </p>
      </header>

      <Separator />

      <article className="space-y-8 text-foreground/90">
        <LanguageContentWrapper
          contentEs={<ReportMdxContent content={reportsMap.es.introduction} />}
          contentEn={<ReportMdxContent content={reportsMap.en.introduction} />}
        />
      </article>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      }
    >
      <ReportContainer />
    </Suspense>
  );
}