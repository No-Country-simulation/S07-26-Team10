"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReveal } from "@/hooks/use-reveal"
import { useLanguage } from "@/context/language-context"
import { useVersion } from "@/context/version-context"
import { getPublicTaxonomyDataAction } from "@/features/public/taxonomy/taxonomy-actions"
import type { TaxonomyCategory } from "@/lib/taxonomy-types"
import { TaxonomyEntry } from "@/components/report/taxonomy/TaxonomyEntry"

type LayerFilter = "ALL" | "FAC" | "IT" | "WKL"

interface TaxonomyAccordionProps {
  categories: TaxonomyCategory[]
}

export function TaxonomyAccordionSkeleton() {
  return (
    <div className="list animate-pulse" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="eh"
          style={{
            display: "grid",
            gridTemplateColumns: "74px 250px 1fr 132px 26px",
            gap: "22px",
            alignItems: "center",
            padding: "20px 4px",
            borderBottom: "1px solid var(--phi-stroke, #E5E7EB)",
          }}
        >
          <span className="h-4 w-12 bg-muted/70 rounded" />
          <span className="h-4 w-44 bg-muted/60 rounded" />
          <span className="h-3.5 w-4/5 bg-muted/50 rounded" />
          <span className="h-5 w-24 bg-muted/40 rounded-full" />
          <span className="h-4 w-4 bg-muted/30 rounded" />
        </div>
      ))}
    </div>
  )
}

export function TaxonomyAccordion({ categories: initialCategories }: TaxonomyAccordionProps) {
  const t = useTranslations("Report")
  const { language } = useLanguage()
  const { contentLanguage, activeVersionId } = useVersion()
  const currentLang = contentLanguage || language || "es"

  const [categories, setCategories] = useState<TaxonomyCategory[]>(initialCategories)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<LayerFilter>("ALL")
  const [query, setQuery] = useState("")
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [, startTransition] = useTransition()

  useReveal(".how")

  // Sync with prop if it updates from SSR
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories)
    }
  }, [initialCategories])

  // React to client language or version change
  useEffect(() => {
    let isCancelled = false
    setIsLoading(true)
    setRevealed(new Set())

    startTransition(async () => {
      try {
        const fetched = await getPublicTaxonomyDataAction(currentLang)
        if (!isCancelled && fetched && fetched.length > 0) {
          setCategories(fetched as unknown as TaxonomyCategory[])
        }
      } catch (err) {
        console.error("Error fetching taxonomy data for language:", err)
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    })

    return () => {
      isCancelled = true
    }
  }, [currentLang, activeVersionId])

  const total = useMemo(
    () => categories.reduce((n, c) => n + c.concepts.length, 0),
    [categories],
  )
  const estCount = useMemo(
    () =>
      categories.reduce(
        (n, c) => n + c.concepts.filter((x) => x.label === "est").length,
        0,
      ),
    [categories],
  )

  const concepts = useMemo(
    () => categories.flatMap((c) => c.concepts),
    [categories],
  )

  const visible = useMemo(() => {
    const s = query.trim().toLowerCase()
    return concepts.filter((c) => {
      const okLayer = filter === "ALL" || c.layerCode === filter
      const okQuery =
        !s ||
        [c.itemCode, c.name, c.shortDescription, c.whatItIsNot]
          .join(" ")
          .toLowerCase()
          .includes(s)
      return okLayer && okQuery
    })
  }, [concepts, filter, query])

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const cite = (code: string, name: string) => {
    const d = new Date().toISOString().slice(0, 10)
    const text = `PhysaFlow Stranded Capacity Index (2026). ${code} — ${name}. Taxonomy v0.1. Retrieved ${d}.`
    navigator.clipboard?.writeText(text).catch(() => {})
    setToast(t("citationCopied", { code }))
  }

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(id)
  }, [toast])

  const visibleKey = visible.map((c) => c.id).join(",")

  useEffect(() => {
    if (!listRef.current || isLoading) return
    const els = [...listRef.current.querySelectorAll<HTMLElement>(".e")]
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            const i = Math.max(0, els.indexOf(el))
            el.style.transitionDelay = `${(i % 8) * 70}ms`
            const conceptId = el.dataset.id
            if (conceptId) {
              setRevealed((prev) => {
                if (prev.has(conceptId)) return prev
                const next = new Set(prev)
                next.add(conceptId)
                return next
              })
            }
            io.unobserve(el)
          }
        }),
      { rootMargin: "0px 0px -12% 0px", threshold: 0.06 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [visibleKey, isLoading])

  useEffect(() => {
    if (isLoading || concepts.length === 0) return

    const rawHash = decodeURIComponent(window.location.hash.replace(/^#/, "")).trim()
    if (!rawHash) return

    const upperKey = rawHash.toUpperCase()
    const lowerKey = rawHash.toLowerCase()

    const tabs: LayerFilter[] = ["FAC", "IT", "WKL"]
    if (tabs.includes(upperKey as LayerFilter)) {
      setFilter(upperKey as LayerFilter)
      return
    }

    // 1. Buscar concepto por itemCode o por id (UUID)
    const concept = concepts.find(
      (c) =>
        c.itemCode?.toUpperCase() === upperKey ||
        c.id?.toLowerCase() === lowerKey ||
        c.id === rawHash,
    )

    if (concept) {
      setFilter("ALL")
      setQuery("")
      setOpenIds((prev) => new Set([...prev, concept.id]))
      setRevealed((prev) => new Set([...prev, concept.id]))

      setTimeout(() => {
        const el =
          document.getElementById(concept.itemCode) ||
          document.getElementById(concept.id) ||
          document.querySelector(`[data-id="${concept.id}"]`)

        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" })
          el.classList.add("search-target-highlight")
          setTimeout(() => {
            el.classList.remove("search-target-highlight")
          }, 3500)
        }
      }, 200)
      return
    }

    // 2. Buscar categoría por id o layerCode
    const cat = categories.find(
      (c) =>
        c.id?.toLowerCase() === lowerKey ||
        c.id === rawHash ||
        c.layerCode === upperKey,
    )

    if (cat) {
      if (cat.layerCode && tabs.includes(cat.layerCode as LayerFilter)) {
        setFilter(cat.layerCode as LayerFilter)
      }
      const catConceptIds = cat.concepts.map((x) => x.id)
      setOpenIds((prev) => new Set([...prev, ...catConceptIds]))
      setRevealed((prev) => new Set([...prev, ...catConceptIds]))

      setTimeout(() => {
        const firstEl = listRef.current?.querySelector<HTMLElement>(".e")
        if (firstEl) {
          firstEl.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 200)
    }
  }, [concepts, categories, isLoading])

  const tabs: { key: LayerFilter | "ALL"; label: string; count: number }[] = [
    { key: "ALL", label: t("filterAll"), count: total },
    {
      key: "FAC",
      label: t("filterFacility"),
      count: categories.find((c) => c.layerCode === "FAC")?.concepts.length ?? 0,
    },
    {
      key: "IT",
      label: t("filterIT"),
      count: categories.find((c) => c.layerCode === "IT")?.concepts.length ?? 0,
    },
    {
      key: "WKL",
      label: t("filterWorkload"),
      count: categories.find((c) => c.layerCode === "WKL")?.concepts.length ?? 0,
    },
  ]

  return (
    <section className="tx">
      <div className="in">
        <div className="bar">
          <div className="fts">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={cn("ft", filter === tab.key && "on")}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label} <i>{tab.count}</i>
              </button>
            ))}
          </div>
          <label className="fq">
            <Search aria-hidden />
            <input
              type="search"
              value={query}
              placeholder={t("filterEntries")}
              autoComplete="off"
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="lg">
          <span className="lgn">
            {t("legendLine", { est: estCount, prop: total - estCount, total })}
          </span>
        </div>

        {isLoading ? (
          <TaxonomyAccordionSkeleton />
        ) : (
          <div className="list" id="list" ref={listRef}>
            {visible.map((concept) => (
              <TaxonomyEntry
                key={concept.id}
                concept={concept}
                open={openIds.has(concept.id)}
                revealed={revealed.has(concept.id)}
                onToggle={toggle}
                onCite={cite}
              />
            ))}
          </div>
        )}

        {!isLoading && (
          <p className={cn("none", visible.length === 0 && "on")}>
            {t("noEntryMatches")}
          </p>
        )}
        <div className="fsrc">{t("sourceLine")}</div>
      </div>
      <div className={cn("toast", toast && "on")}>{toast}</div>
    </section>
  )
}