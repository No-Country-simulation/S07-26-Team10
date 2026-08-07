"use client"

import { useTranslations } from "next-intl"

import { useCallback, useRef, useEffect } from "react"
import { ChevronRight, Folder, FileText, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaxonomyCategory, TaxonomyConcept } from "@/data/taxonomy"

interface TaxonomyTreeProps {
  categories: TaxonomyCategory[]
  selectedConceptId: string
  expandedCategories: Set<string>
  onSelectConcept: (conceptId: string) => void
  onToggleCategory: (categoryId: string) => void
}

export function TaxonomyTree({
  categories,
  selectedConceptId,
  expandedCategories,
  onSelectConcept,
  onToggleCategory,
}: TaxonomyTreeProps) {
  const t = useTranslations("Report")
  const treeRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const flatItems = categories.flatMap((cat) => [
    { type: "category" as const, id: cat.id, label: cat.name },
    ...(expandedCategories.has(cat.id) && cat.concepts.length > 0
      ? cat.concepts.map((c) => ({
          type: "concept" as const,
          id: c.id,
          label: c.name,
          categoryId: cat.id,
        }))
      : []),
  ])

  const getFocusableIndex = useCallback(() => {
    if (flatItems.length === 0) return -1
    const selectedIdx = flatItems.findIndex(
      (item) => item.type === "concept" && item.id === selectedConceptId,
    )
    if (selectedIdx !== -1) return selectedIdx
    const firstCategoryIdx = flatItems.findIndex(
      (item) => item.type === "category",
    )
    return firstCategoryIdx >= 0 ? firstCategoryIdx : 0
  }, [flatItems, selectedConceptId])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (flatItems.length === 0) return
      const currentIndex = getFocusableIndex()
      if (currentIndex === -1) return
      let nextIndex = currentIndex

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          nextIndex = Math.min(currentIndex + 1, flatItems.length - 1)
          break
        case "ArrowUp":
          e.preventDefault()
          nextIndex = Math.max(currentIndex - 1, 0)
          break
        case "ArrowRight": {
          const item = flatItems[currentIndex]
          if (item?.type === "category") {
            e.preventDefault()
            onToggleCategory(item.id)
          }
          return
        }
        case "ArrowLeft": {
          const item = flatItems[currentIndex]
          if (item?.type === "category" && expandedCategories.has(item.id)) {
            e.preventDefault()
            onToggleCategory(item.id)
          }
          return
        }
        case "Enter":
        case " ":
          e.preventDefault()
          const current = flatItems[currentIndex]
          if (current?.type === "category") {
            onToggleCategory(current.id)
          } else if (current?.type === "concept") {
            onSelectConcept(current.id)
          }
          return
        default:
          return
      }

      const target = flatItems[nextIndex]
      if (target) {
        const el = itemRefs.current.get(target.id)
        el?.focus()
        if (target.type === "concept") {
          onSelectConcept(target.id)
        }
      }
    },
    [flatItems, getFocusableIndex, expandedCategories, onToggleCategory, onSelectConcept],
  )

  useEffect(() => {
    const activeItem = flatItems.find(
      (item) => item.type === "concept" && item.id === selectedConceptId,
    )
    if (activeItem) {
      const el = itemRefs.current.get(activeItem.id)
      el?.scrollIntoView({ block: "nearest" })
    }
  }, [selectedConceptId, flatItems])

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-2 px-2">
          <LayoutGrid className="size-4 text-neutral-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            {t("taxonomyTitle")}
          </span>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <p className="text-xs text-neutral-600 text-center">{t("noCategories")}</p>
        </div>
      ) : (
        <nav
          ref={treeRef}
          role="tree"
          aria-label="Taxonomy navigation"
          className="flex-1 overflow-y-auto py-3 px-2"
          onKeyDown={handleKeyDown}
        >
        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category.id)
          const hasActiveConcept = category.concepts.some(
            (c) => c.id === selectedConceptId,
          )

          return (
            <div key={category.id} role="treeitem" aria-expanded={isExpanded}>
              <button
                onClick={() => onToggleCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all duration-150",
                  "hover:bg-neutral-800/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500",
                  hasActiveConcept
                    ? "text-neutral-100"
                    : "text-neutral-400",
                )}
              >
                <ChevronRight
                  className={cn(
                    "size-3.5 shrink-0 transition-transform duration-200",
                    isExpanded && "rotate-90",
                  )}
                />
                <Folder
                  className={cn(
                    "size-4 shrink-0 transition-colors duration-150",
                    isExpanded ? "text-neutral-300" : "text-neutral-500",
                  )}
                />
                <span className="font-medium truncate">{category.name}</span>
              </button>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-200 ease-in-out",
                  isExpanded ? "opacity-100" : "max-h-0 opacity-0",
                )}
              >
                {category.concepts.length === 0 ? (
                  <div className="ml-4 border-l border-neutral-800 pl-2 py-3">
                    <p className="text-xs text-neutral-600 px-3 italic">{t("noConceptsInCategory")}</p>
                  </div>
                ) : (
                  <div className="ml-4 border-l border-neutral-800 pl-2 py-1 space-y-0.5">
                    {category.concepts.map((concept) => {
                      const isActive = concept.id === selectedConceptId
                      return (
                        <button
                          key={concept.id}
                          ref={(el) => {
                            if (el) itemRefs.current.set(concept.id, el)
                            else itemRefs.current.delete(concept.id)
                          }}
                          role="treeitem"
                          aria-selected={isActive}
                          onClick={() => onSelectConcept(concept.id)}
                          className={cn(
                            "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-all duration-150",
                            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500",
                              isActive
                                ? "bg-neutral-800 text-neutral-200"
                                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 border-l-2 border-transparent -ml-px",
                          )}
                        >
                          <FileText className="size-3.5 shrink-0" />
                          <span className="truncate">{concept.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        </nav>
      )}
    </div>
  )
}
