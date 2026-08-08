"use client"

import { useTranslations } from "next-intl"
import { ArrowRight, CheckCircle2, AlertTriangle, Lightbulb, ListTree } from "lucide-react"
import { cn } from "@/lib/utils"
import { BreadcrumbNav } from "./BreadcrumbNav"
import { PreviousNextNavigation } from "./PreviousNextNavigation"
import { getAdjacentConcepts, getRelatedConcepts } from "@/data/taxonomy"
import type { TaxonomyCategory, TaxonomyConcept } from "@/data/taxonomy"

interface ConceptDetailProps {
  category: TaxonomyCategory
  concept: TaxonomyConcept
  onSelectConcept: (conceptId: string) => void
}

export function ConceptDetail({
  category,
  concept,
  onSelectConcept,
}: ConceptDetailProps) {
  const t = useTranslations("Report")
  const related = getRelatedConcepts(concept.relatedConceptIds)
  const { prev, next } = getAdjacentConcepts(concept.id)

  return (
    <article className="max-w-3xl">
      <BreadcrumbNav
        category={category}
        concept={concept}
        className="mb-8"
      />

      <div className="mb-10">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
            "bg-neutral-800 text-neutral-300 border border-neutral-700/50",
            "mb-4",
          )}
        >
          <ListTree className="size-3" />
          {category.name}
        </span>

        <h1 className="text-3xl font-bold text-neutral-50 tracking-tight mb-3">
          {concept.name}
        </h1>

        <p className="text-base text-neutral-400 leading-relaxed max-w-2xl">
          {concept.shortDescription}
        </p>
      </div>

      <div className="space-y-12">
        <section id="section-definition">
          <h2 className="flex items-center gap-2.5 text-lg font-semibold text-neutral-50 mb-4 pb-2 border-b border-neutral-800">
            <span className="size-1.5 rounded-full bg-neutral-500" />
            {t("definition")}
          </h2>
          <p className="text-sm text-neutral-300 leading-[1.75]">
            {concept.definition}
          </p>
        </section>

        <section id="section-characteristics">
          <h2 className="flex items-center gap-2.5 text-lg font-semibold text-neutral-50 mb-4 pb-2 border-b border-neutral-800">
            <span className="size-1.5 rounded-full bg-neutral-500" />
            {t("characteristics")}
          </h2>
          <ul className="space-y-2.5">
            {concept.characteristics.map((char, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                <CheckCircle2 className="size-4 text-neutral-600 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{char}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="section-impact">
          <h2 className="flex items-center gap-2.5 text-lg font-semibold text-neutral-50 mb-4 pb-2 border-b border-neutral-800">
            <span className="size-1.5 rounded-full bg-neutral-500" />
            {t("operationalImpact")}
          </h2>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <AlertTriangle className="size-5 text-neutral-500 mt-0.5 shrink-0" />
            <p className="text-sm text-neutral-300 leading-[1.75]">
              {concept.operationalImpact}
            </p>
          </div>
        </section>

        <section id="section-causes">
          <h2 className="flex items-center gap-2.5 text-lg font-semibold text-neutral-50 mb-4 pb-2 border-b border-neutral-800">
            <span className="size-1.5 rounded-full bg-neutral-500" />
            {t("commonCauses")}
          </h2>
          <ul className="space-y-2.5">
            {concept.commonCauses.map((cause, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                <span className="flex items-center justify-center size-5 rounded-full bg-neutral-800 text-neutral-400 text-xs font-medium shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{cause}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="section-example">
          <h2 className="flex items-center gap-2.5 text-lg font-semibold text-neutral-50 mb-4 pb-2 border-b border-neutral-800">
            <span className="size-1.5 rounded-full bg-neutral-500" />
            {t("exampleScenario")}
          </h2>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <Lightbulb className="size-5 text-neutral-500 mt-0.5 shrink-0" />
            <p className="text-sm text-neutral-300 leading-[1.75]">
              {concept.exampleScenario}
            </p>
          </div>
        </section>

        {related.length > 0 && (
          <section id="section-related">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold text-neutral-50 mb-4 pb-2 border-b border-neutral-800">
              <span className="size-1.5 rounded-full bg-neutral-500" />
              {t("relatedConcepts")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((r) => (
                <button
                  key={r.id}
                  onClick={() => onSelectConcept(r.id)}
                  className={cn(
                    "flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-neutral-800 bg-neutral-900/50",
                    "hover:bg-neutral-800/60 hover:border-neutral-700 transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500",
                    "text-left group",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-200 truncate">
                      {r.name}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                      {r.shortDescription}
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-neutral-600 shrink-0 group-hover:text-neutral-400 transition-colors duration-150" />
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="pt-4 pb-8">
          <PreviousNextNavigation
            prev={prev}
            next={next}
            onSelect={onSelectConcept}
          />
        </div>
      </div>
    </article>
  )
}
