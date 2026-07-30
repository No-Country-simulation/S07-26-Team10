"use client"

import { cn } from "@/lib/utils"
import type { TaxonomyCategory, TaxonomyConcept } from "@/data/taxonomy"

interface BreadcrumbNavProps {
  category: TaxonomyCategory
  concept: TaxonomyConcept
  className?: string
}

export function BreadcrumbNav({
  category,
  concept,
  className,
}: BreadcrumbNavProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-2 text-sm", className)}>
      <span className="text-neutral-500">Report</span>
      <span className="text-neutral-700 select-none">/</span>
      <span className="text-neutral-500">Taxonomy</span>
      <span className="text-neutral-700 select-none">/</span>
      <span className="text-neutral-400">{category.name}</span>
      <span className="text-neutral-700 select-none">/</span>
      <span className="text-neutral-100 font-medium">{concept.name}</span>
    </nav>
  )
}
