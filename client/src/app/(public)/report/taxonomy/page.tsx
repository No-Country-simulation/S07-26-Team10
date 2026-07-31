"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchTaxonomyData, fetchConceptById, fetchCategoryByConceptId } from "@/lib/taxonomy-api"
import type { TaxonomyCategory } from "@/data/taxonomy"
import { TaxonomyTree } from "@/components/report/taxonomy/TaxonomyTree"
import { ConceptDetail } from "@/components/report/taxonomy/ConceptDetail"
import { TableOfContents } from "@/components/report/taxonomy/TableOfContents"
import { MobileNavigation } from "@/components/report/taxonomy/MobileNavigation"
import { ConceptNotFound } from "@/components/report/taxonomy/ConceptNotFound"
import { ConceptDetailSkeleton, TreeSkeleton, TOCSkeleton } from "@/components/report/taxonomy/LoadingSkeleton"

const DEFAULT_CONCEPT_ID = "cooling-bottleneck"

type PageState = "loading" | "loaded" | "error"

export default function TaxonomyPage() {
  const [pageState, setPageState] = useState<PageState>("loading")
  const [categories, setCategories] = useState<TaxonomyCategory[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  const [selectedConceptId, setSelectedConceptId] = useState(DEFAULT_CONCEPT_ID)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(["facility"]),
  )

  const [conceptExists, setConceptExists] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await fetchTaxonomyData()
        if (cancelled) return
        setCategories(data)
        setPageState("loaded")
      } catch {
        if (cancelled) return
        setLoadError("Failed to load taxonomy data. Please try again.")
        setPageState("error")
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const validateAndSetConcept = useCallback(async (conceptId: string) => {
    setSelectedConceptId(conceptId)
    try {
      const concept = await fetchConceptById(conceptId)
      if (concept) {
        setConceptExists(true)
        const cat = await fetchCategoryByConceptId(conceptId)
        if (cat) {
          setExpandedCategories((prev) => {
            if (prev.has(cat.id)) return prev
            return new Set([...prev, cat.id])
          })
        }
      } else {
        setConceptExists(false)
      }
    } catch {
      setConceptExists(false)
    }
  }, [])

  const handleSelectConcept = useCallback((conceptId: string) => {
    validateAndSetConcept(conceptId)
  }, [validateAndSetConcept])

  const handleToggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })
  }, [])

  const handleBackToDefault = useCallback(() => {
    validateAndSetConcept(DEFAULT_CONCEPT_ID)
  }, [validateAndSetConcept])

  const selectedCategory = categories.length > 0
    ? categories.find((cat) => cat.concepts.some((c) => c.id === selectedConceptId))
    : undefined

  const selectedConcept = selectedCategory
    ? selectedCategory.concepts.find((c) => c.id === selectedConceptId)
    : undefined

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {pageState === "loaded" && (
              <MobileNavigation
                categories={categories}
                selectedConceptId={selectedConceptId}
                expandedCategories={expandedCategories}
                onSelectConcept={handleSelectConcept}
                onToggleCategory={handleToggleCategory}
              />
            )}
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-lg bg-neutral-50 flex items-center justify-center">
                <span className="text-xs font-bold text-neutral-950">P</span>
              </div>
              <span className="text-sm font-semibold text-neutral-100 hidden sm:inline">
                PhysaFlow
              </span>
              <span className="text-xs text-neutral-600 hidden sm:inline">/</span>
              <span className="text-xs text-neutral-500 hidden sm:inline">
                Stranded Capacity Report
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
              Taxonomy
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden lg:block w-72 shrink-0 border-r border-neutral-800 h-[calc(100vh-3.5rem)] sticky top-14 overflow-hidden">
          {pageState === "loading" ? (
            <TreeSkeleton />
          ) : pageState === "loaded" ? (
            <TaxonomyTree
              categories={categories}
              selectedConceptId={selectedConceptId}
              expandedCategories={expandedCategories}
              onSelectConcept={handleSelectConcept}
              onToggleCategory={handleToggleCategory}
            />
          ) : (
            <div className="flex items-center justify-center h-full px-4">
              <p className="text-xs text-neutral-600 text-center">Failed to load</p>
            </div>
          )}
        </aside>

        <main className="flex-1 min-w-0 px-6 lg:px-12 py-10 lg:py-14 overflow-y-auto">
          {pageState === "loading" && <ConceptDetailSkeleton />}

          {pageState === "error" && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="size-12 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                <span className="text-neutral-500 text-lg">!</span>
              </div>
              <p className="text-sm text-neutral-400 max-w-sm">{loadError}</p>
            </div>
          )}

          {pageState === "loaded" && !conceptExists && (
            <ConceptNotFound
              conceptId={selectedConceptId}
              onBack={handleBackToDefault}
            />
          )}

          {pageState === "loaded" && conceptExists && selectedConcept && selectedCategory && (
            <ConceptDetail
              category={selectedCategory}
              concept={selectedConcept}
              onSelectConcept={handleSelectConcept}
            />
          )}

          {pageState === "loaded" && conceptExists && !selectedConcept && !selectedCategory && (
            <div className="flex items-center justify-center h-64">
              <p className="text-neutral-500 text-sm">Select a concept from the taxonomy to view its details.</p>
            </div>
          )}
        </main>

        <aside className="hidden xl:block w-56 shrink-0 border-l border-neutral-800 h-[calc(100vh-3.5rem)] sticky top-14 overflow-hidden">
          {pageState === "loading" && <TOCSkeleton />}
          {pageState === "loaded" && selectedConcept && conceptExists && (
            <TableOfContents concept={selectedConcept} />
          )}
        </aside>
      </div>
    </div>
  )
}
