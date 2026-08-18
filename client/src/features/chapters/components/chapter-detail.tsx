"use client";

import React from "react";
import Link from "next/link";
import { useReveal } from "@/hooks/use-reveal";
import { ChapterMasthead } from "@/components/report/chapter/ChapterMasthead";
import { HomeMdxContent } from "@/features/home/components/home-mdx-content";
import { ChapterNavigation } from "./chapter-navigation";
import { calculateReadingTime } from "../chapters-utils";
import type { ChapterDetailData } from "../chapters-types";
import { Clock, ChevronRight } from "lucide-react";

interface ChapterDetailProps {
  data: ChapterDetailData;
}

export function ChapterDetail({ data }: ChapterDetailProps) {
  const { section, navigation, allSections } = data;
  useReveal(".rv, .rvs");

  const currentIndex = allSections.findIndex((s) => s.slug === section.slug);
  const chapterNumber = String(
    section.display_order || (currentIndex >= 0 ? currentIndex + 1 : 1),
  ).padStart(2, "0");
  const readingTime = calculateReadingTime(section.content);

  // Split title for ChapterMasthead animation
  const titleWords = section.title.split(" ");
  const mid = Math.ceil(titleWords.length / 2);
  const title1 = titleWords.slice(0, mid).join(" ") || section.title;
  const title2 = titleWords.slice(mid).join(" ") || "";

  return (
    <div className="chapter-detail-page">
      <ChapterMasthead
        mono={`CAPÍTULO ${chapterNumber} // STRANDED CAPACITY`}
        title1={title1}
        title2={title2 || ""}
        accent={title2 ? titleWords[titleWords.length - 1] : undefined}
        lead={
          section.title.length > 50
            ? section.title
            : `Sección ${chapterNumber} del reporte de capacidad instalada e índices de infraestructura.`
        }
      />

      <article className="dfn">
        <div className="in max-w-4xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb & Meta bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-8 mb-8 border-b border-border/50 text-xs font-mono text-muted-foreground">
            <nav className="flex items-center gap-1.5" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-foreground transition-colors">
                Inicio
              </Link>
              <ChevronRight className="size-3" />
              <Link
                href="/#s02"
                className="hover:text-foreground transition-colors"
              >
                Capítulos
              </Link>
              <ChevronRight className="size-3" />
              <span className="text-foreground font-semibold">
                Cap. {chapterNumber}
              </span>
            </nav>

            <div className="flex items-center gap-2">
              <Clock className="size-3.5" />
              <span>{readingTime} de lectura</span>
            </div>
          </div>

          {/* Main MDX / Markdown Content */}
          <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed">
            <HomeMdxContent content={section.content} />
          </div>

          {/* Navigation between chapters */}
          <ChapterNavigation navigation={navigation} />
        </div>
      </article>
    </div>
  );
}

export function ChapterDetailSkeleton() {
  return (
    <div className="min-h-[70vh] py-16 animate-pulse">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="h-6 w-32 bg-muted/60 rounded" />
        <div className="h-12 w-3/4 bg-muted/60 rounded" />
        <div className="h-4 w-1/2 bg-muted/60 rounded" />
        <div className="space-y-4 pt-12">
          <div className="h-4 w-full bg-muted/60 rounded" />
          <div className="h-4 w-full bg-muted/60 rounded" />
          <div className="h-4 w-5/6 bg-muted/60 rounded" />
          <div className="h-4 w-4/6 bg-muted/60 rounded" />
        </div>
      </div>
    </div>
  );
}
