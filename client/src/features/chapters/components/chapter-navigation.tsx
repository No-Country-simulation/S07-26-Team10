"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import type { SectionNavigation } from "../chapters-types";

interface ChapterNavigationProps {
  navigation: SectionNavigation;
}

export function ChapterNavigation({ navigation }: ChapterNavigationProps) {
  const { prev, next } = navigation;

  if (!prev && !next) return null;

  return (
    <nav className="mt-16 pt-8 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {prev ? (
        <Link
          href={`/chapter/${prev.slug}`}
          className="group flex flex-col p-5 rounded-xl border border-border/50 bg-card hover:bg-accent/40 transition-colors"
        >
          <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">
            <ArrowLeft className="size-3.5" />
            <span>Capítulo {prev.num}</span>
          </span>
          <span className="font-semibold text-foreground text-sm sm:text-base mt-1 line-clamp-1">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/chapter/${next.slug}`}
          className="group flex flex-col p-5 rounded-xl border border-border/50 bg-card hover:bg-accent/40 transition-colors text-right sm:text-right items-end"
        >
          <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">
            <span>Capítulo {next.num}</span>
            <ArrowRight className="size-3.5" />
          </span>
          <span className="font-semibold text-foreground text-sm sm:text-base mt-1 line-clamp-1">
            {next.title}
          </span>
        </Link>
      ) : (
        <Link
          href="/#s02"
          className="group flex flex-col p-5 rounded-xl border border-border/50 bg-card hover:bg-accent/40 transition-colors text-right items-end"
        >
          <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">
            <span>Índice de Capítulos</span>
            <BookOpen className="size-3.5" />
          </span>
          <span className="font-semibold text-foreground text-sm sm:text-base mt-1">
            Volver al inicio
          </span>
        </Link>
      )}
    </nav>
  );
}
