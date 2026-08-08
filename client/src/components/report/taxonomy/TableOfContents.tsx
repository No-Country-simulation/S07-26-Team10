"use client"

import { useTranslations } from "next-intl"

import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { TaxonomyConcept } from "@/data/taxonomy"



interface TableOfContentsProps {
  concept: TaxonomyConcept
}

const SECTIONS: { id: string; labelKey: string }[] = [
  { id: "definition", labelKey: "definition" },
  { id: "characteristics", labelKey: "characteristics" },
  { id: "impact", labelKey: "impactShort" },
  { id: "causes", labelKey: "commonCauses" },
  { id: "example", labelKey: "exampleShort" },
  { id: "related", labelKey: "relatedShort" },
  { id: "downloads", labelKey: "downloads" },
]

export function TableOfContents({ concept }: TableOfContentsProps) {
  const t = useTranslations("Report")
  const [activeId, setActiveId] = useState<string>("")

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(`section-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id.replace("section-", ""))
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" },
    )

    const elements = SECTIONS.map(
      (s) => document.getElementById(`section-${s.id}`),
    ).filter(Boolean) as HTMLElement[]

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [concept.id])

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-neutral-800">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          {t("onThisPage")}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Table of contents">
        <ul className="space-y-0.5">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => handleClick(section.id)}
                className={cn(
                  "flex items-center w-full px-3 py-1.5 rounded-md text-xs transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500",
                  activeId === section.id
                    ? "text-neutral-100 bg-neutral-800/60 font-medium"
                    : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/30",
                )}
              >
                {t(section.labelKey)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-4 py-3 border-t border-neutral-800">
        <p className="text-[10px] text-neutral-600 leading-relaxed">
          PhysaFlow Research · 2026
        </p>
      </div>
    </div>
  )
}
