"use client";

import { useTranslations } from "next-intl";
import { BookOpen, Quote, Image as ImageIcon, Link2 } from "lucide-react";
import { CiteBlock } from "@/features/report/components/cite-block";

export default function HowToCitePage() {
  const t = useTranslations("HowToCite");

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-16 space-y-12 font-sans">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/60 text-muted-foreground font-mono text-xs uppercase tracking-widest rounded-full border border-border">
          <BookOpen className="size-3.5" /> {t("badge")}
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-foreground leading-tight">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t("lede")}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-xl font-serif font-bold text-foreground">
          <Quote className="size-4 text-primary" /> {t("reportSection")}
        </h2>
        <div className="space-y-3">
          <CiteBlock label={t("academicLabel")} text={t("reportAcademic")} />
          <CiteBlock
            label={t("journalisticLabel")}
            text={t("reportJournalistic")}
          />
        </div>
      </section>

      <section id="figure-01" className="space-y-3 scroll-mt-24">
        <h2 className="flex items-center gap-2 text-xl font-serif font-bold text-foreground">
          <ImageIcon className="size-4 text-primary" /> {t("figureSection")}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {t("figureLede")}
        </p>
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <span className="font-semibold text-foreground">
            {t("attribution")}:
          </span>{" "}
          <span className="text-muted-foreground">{t("attributionText")}</span>
        </div>
        <div className="space-y-3">
          <CiteBlock
            label={`${t("exampleFigure")} — ${t("academicLabel")}`}
            text={t("figureAcademic")}
          />
          <CiteBlock
            label={`${t("exampleFigure")} — ${t("journalisticLabel")}`}
            text={t("figureJournalistic")}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-xl font-serif font-bold text-foreground">
          <Link2 className="size-4 text-primary" /> {t("chapterSection")}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {t("chapterLede")}
        </p>
      </section>

      <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{t("note")}:</span>{" "}
        {t("noteText")}
      </div>
    </div>
  );
}