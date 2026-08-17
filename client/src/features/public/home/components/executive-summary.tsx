import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { HomeIntroData } from "../types";
import { HomeMdxContent } from "./home-mdx-content";
import { LanguageContentWrapper } from "./language-content-wrapper";

interface ExecutiveSummaryProps {
  introData?: HomeIntroData;
  reportsMap?: Record<"es" | "en", HomeIntroData>;
}

export function ExecutiveSummarySection({ introData, reportsMap }: ExecutiveSummaryProps) {
  const esContent = reportsMap ? reportsMap.es.introduction : introData?.introduction || "";
  const enContent = reportsMap ? reportsMap.en.introduction : introData?.introduction || "";

  return (
    <section
      id="executive-summary"
      className="w-full max-w-4xl mx-auto px-4 py-16 sm:py-24 border-t border-border/40 scroll-mt-20"
    >
      {/* Main Content Article rendered dynamically from introduction MDX String */}
      <article>
        <LanguageContentWrapper
          contentEs={<HomeMdxContent content={esContent} />}
          contentEn={<HomeMdxContent content={enContent} />}
        />
      </article>
    </section>
  );
}

export function ExecutiveSummarySkeleton() {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-16 sm:py-24 border-t border-border/40">
      <div className="flex items-center justify-between pb-6">
        <Skeleton className="h-4 w-6" />
        <Skeleton className="h-4 w-36" />
      </div>
      <Skeleton className="h-[1px] w-full mb-12" />
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-20 w-11/12 ml-6 my-8" />
        <Skeleton className="h-20 w-full" />
      </div>
    </section>
  );
}
