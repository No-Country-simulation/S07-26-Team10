"use client"

import { useTranslations } from "next-intl"
import type { TaxonomyCategory } from "@/data/taxonomy"
import { cn } from "@/lib/utils"

interface LayerIndexProps {
  categories: TaxonomyCategory[]
  selectedConceptId: string
  onSelectConcept: (conceptId: string) => void
}

export function LayerIndex({
  categories,
  selectedConceptId,
  onSelectConcept,
}: LayerIndexProps) {
  const t = useTranslations("Report")
  return (
    <section className="border-b border-neutral-800 bg-neutral-950/60">
      <div className="max-w-5xl mx-auto px-6 py-8 lg:px-12 space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
            {t("layerIndex")}
          </span>
          <span className="h-px flex-1 bg-neutral-800" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.id} id={cat.layerCode} className="scroll-mt-20 space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-200">
                  {cat.layerCode}
                </h3>
                <span className="text-[10px] text-neutral-500">{cat.name}</span>
              </div>
              <div className="space-y-1">
                {cat.concepts.map((concept) => (
                  <button
                    key={concept.id}
                    id={concept.itemCode}
                    onClick={() => onSelectConcept(concept.id)}
                    className={cn(
                      "group flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                      "hover:bg-neutral-800/60",
                      concept.id === selectedConceptId
                        ? "text-amber-300"
                        : "text-neutral-400 group-hover:text-neutral-200",
                    )}
                  >
                    <span className="font-mono text-[10px] text-neutral-500 group-hover:text-neutral-400">
                      {concept.itemCode}
                    </span>
                    <span className="truncate">{concept.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}