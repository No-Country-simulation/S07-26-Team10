"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReveal } from "@/hooks/use-reveal"
import type { TaxonomyCategory } from "@/lib/taxonomy-types"
import { TaxonomyEntry } from "@/components/report/taxonomy/TaxonomyEntry"

type LayerFilter = "ALL" | "FAC" | "IT" | "WKL"

interface TaxonomyAccordionProps {
  categories: TaxonomyCategory[]
}

export function TaxonomyAccordion({ categories }: TaxonomyAccordionProps) {
  const t = useTranslations("Report")
  const [filter, setFilter] = useState<LayerFilter>("ALL")
  const [query, setQuery] = useState("")
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useReveal(".how")

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
    if (!listRef.current) return
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
  }, [visibleKey])

  useEffect(() => {
    const hash = window.location.hash.toUpperCase()
    if (!hash) return
    const key = hash.replace("#", "")
    const tabs: LayerFilter[] = ["FAC", "IT", "WKL"]
    if (tabs.includes(key as LayerFilter)) {
      requestAnimationFrame(() => setFilter(key as LayerFilter))
    } else {
      const concept = concepts.find((c) => c.itemCode === key)
      if (concept) {
        requestAnimationFrame(() => {
          setOpenIds((prev) => {
            if (prev.has(concept.id)) return prev
            return new Set([...prev, concept.id])
          })
        })
        requestAnimationFrame(() => {
          document
            .getElementById(concept.itemCode)
            ?.scrollIntoView({ block: "center" })
        })
      }
    }
  }, [concepts])

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
        <p className={cn("none", visible.length === 0 && "on")}>
          {t("noEntryMatches")}
        </p>
        <div className="fsrc">{t("sourceLine")}</div>
      </div>
      <div className={cn("toast", toast && "on")}>{toast}</div>
    </section>
  )
}