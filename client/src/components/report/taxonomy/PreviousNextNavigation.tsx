"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaxonomyConcept } from "@/data/taxonomy"

interface PreviousNextNavigationProps {
  prev: TaxonomyConcept | null
  next: TaxonomyConcept | null
  onSelect: (conceptId: string) => void
}

export function PreviousNextNavigation({
  prev,
  next,
  onSelect,
}: PreviousNextNavigationProps) {
  return (
    <nav
      aria-label="Concept navigation"
      className="flex items-stretch gap-4"
    >
      {prev ? (
        <button
          onClick={() => onSelect(prev.id)}
          className={cn(
            "flex-1 flex items-center gap-3 px-5 py-4 rounded-xl border border-neutral-800 bg-neutral-900/50",
            "hover:bg-neutral-800/60 hover:border-neutral-700 transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500",
            "text-left group",
          )}
        >
          <ChevronLeft className="size-4 text-neutral-500 shrink-0 group-hover:text-neutral-300 transition-colors duration-150" />
          <div className="min-w-0">
            <p className="text-xs text-neutral-500 mb-0.5">Previous</p>
            <p className="text-sm font-medium text-neutral-200 truncate">
              {prev.name}
            </p>
          </div>
        </button>
      ) : (
        <div className="flex-1" />
      )}

      {next ? (
        <button
          onClick={() => onSelect(next.id)}
          className={cn(
            "flex-1 flex items-center justify-end gap-3 px-5 py-4 rounded-xl border border-neutral-800 bg-neutral-900/50",
            "hover:bg-neutral-800/60 hover:border-neutral-700 transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500",
            "text-right group",
          )}
        >
          <div className="min-w-0">
            <p className="text-xs text-neutral-500 mb-0.5">Next</p>
            <p className="text-sm font-medium text-neutral-200 truncate">
              {next.name}
            </p>
          </div>
          <ChevronRight className="size-4 text-neutral-500 shrink-0 group-hover:text-neutral-300 transition-colors duration-150" />
        </button>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  )
}
