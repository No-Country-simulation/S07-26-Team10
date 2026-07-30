import { Suspense } from "react";
import { getHomeIntrosMap } from "@/features/home/home-queries";
import { MethodologyMdxContent } from "@/features/home/components/methodology-mdx-content";
import { LanguageContentWrapper } from "@/features/home/components/language-content-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Metodología | PhysaFlow Research",
  description: "Metodología de investigación y marco analítico del reporte de Capacidad Estancada.",
};

async function MethodologyContainer() {
  const reportsMap = await getHomeIntrosMap();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8 font-sans">
      <article>
        <LanguageContentWrapper
          contentEs={<MethodologyMdxContent content={reportsMap.es.methodology} />}
          contentEn={<MethodologyMdxContent content={reportsMap.en.methodology} />}
        />
      </article>
    </div>
  );
}

export default function MethodologyPage() {
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
      <MethodologyContainer />
    </Suspense>
  );
}
