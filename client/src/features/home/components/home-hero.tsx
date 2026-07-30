"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/language-context";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HomeIntroData } from "../home-types";

interface HomeHeroProps {
  introData?: HomeIntroData;
  reportsMap?: Record<"es" | "en", HomeIntroData>;
}

export function HomeHero({ introData, reportsMap }: HomeHeroProps) {
  const { language } = useLanguage();
  const t = useTranslations("HomePage");

  const activeIntro = reportsMap ? reportsMap[language] : introData;

  const titleText = activeIntro?.title || t("title");
  const descriptionText = activeIntro?.description || t("description");

  return (
    <section className="relative flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24 md:py-32 max-w-5xl mx-auto">
      {/* Main Headline Title */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-foreground max-w-4xl leading-[1.15] sm:leading-[1.12]">
        {titleText}
      </h1>

      {/* Subtitle / Introduction */}
      <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl font-sans font-normal leading-relaxed">
        {descriptionText}
      </p>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
        <Button
          render={<Link href="/report" />}
          size="lg"
          className="w-full sm:w-auto h-12 px-8 font-mono text-xs font-bold tracking-wider uppercase rounded-xs shadow-xs transition-transform active:scale-[0.99]"
        >
          {t("startReading")}
        </Button>

        <Button
          render={<a href="#executive-summary" />}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto h-12 px-8 font-mono text-xs font-bold tracking-wider uppercase rounded-xs border-input hover:bg-accent transition-transform active:scale-[0.99]"
        >
          {t("viewMethodology")}
        </Button>
      </div>

      {/* Scroll to Explore */}
      <div className="mt-16 sm:mt-24 flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
        <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">
          {t("scrollToExplore")}
        </span>
        <ArrowDown className="size-4 text-muted-foreground animate-bounce stroke-[1.5]" />
      </div>
    </section>
  );
}

export function HomeHeroSkeleton() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24 md:py-32 max-w-5xl mx-auto">
      <Skeleton className="h-7 w-48 rounded-full mb-8" />
      <Skeleton className="h-14 sm:h-20 w-3/4 max-w-3xl mb-4" />
      <Skeleton className="h-10 sm:h-12 w-2/3 max-w-2xl mb-6" />
      <Skeleton className="h-6 w-full max-w-xl mb-10" />
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Skeleton className="h-12 w-full sm:w-48 rounded-xs" />
        <Skeleton className="h-12 w-full sm:w-48 rounded-xs" />
      </div>
      <Skeleton className="h-10 w-28 mt-20" />
    </section>
  );
}
