"use client"

import { useTranslations } from "next-intl"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { TaxonomyTree } from "./TaxonomyTree"
import type { TaxonomyCategory, TaxonomyConcept } from "@/data/taxonomy"

interface MobileNavigationProps {
  categories: TaxonomyCategory[]
  selectedConceptId: string
  expandedCategories: Set<string>
  onSelectConcept: (conceptId: string) => void
  onToggleCategory: (categoryId: string) => void
}

export function MobileNavigation({
  categories,
  selectedConceptId,
  expandedCategories,
  onSelectConcept,
  onToggleCategory,
}: MobileNavigationProps) {
    const t = useTranslations("Report")
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-neutral-400 hover:text-neutral-200"
            aria-label="Open taxonomy menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-neutral-950 border-r border-neutral-800">
        <SheetHeader className="sr-only">
          <SheetTitle>{t("taxonomyTitle")}</SheetTitle>
          <SheetDescription>
            Browse stranded capacity taxonomy categories and concepts
          </SheetDescription>
        </SheetHeader>
        <TaxonomyTree
          categories={categories}
          selectedConceptId={selectedConceptId}
          expandedCategories={expandedCategories}
          onSelectConcept={onSelectConcept}
          onToggleCategory={onToggleCategory}
        />
      </SheetContent>
    </Sheet>
  )
}
