"use client"

import { useTranslations } from "next-intl"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaxonomyConcept } from "@/lib/taxonomy-types"

interface TaxonomyEntryProps {
  concept: TaxonomyConcept
  open: boolean
  revealed: boolean
  onToggle: (conceptId: string) => void
  onCite: (code: string, name: string) => void
}

export function TaxonomyEntry({
  concept,
  open,
  revealed,
  onToggle,
  onCite,
}: TaxonomyEntryProps) {
  const t = useTranslations("Report")

  return (
    <article
      className={cn("e", revealed && "rvin", open && "on")}
      data-l={concept.layerCode}
      data-id={concept.id}
      id={concept.itemCode}
    >
      <button className="eh" aria-expanded={open} onClick={() => onToggle(concept.id)}>
        <span className="ec">{concept.itemCode}</span>
        <span className="en">{concept.name}</span>
        <span className="ed">{concept.shortDescription}</span>
        <span className={cn("es", concept.label)}>
          {concept.label === "est" ? t("establishedTerm") : t("proposedHere")}
        </span>
        <span className="ei" aria-hidden>
          <ChevronDown />
        </span>
      </button>
      <div className="eb">
        <div className="ebin">
          <div className="f">
            <span className="fl">{t("whatItIsNot")}</span>
            <p>{concept.whatItIsNot}</p>
          </div>
          <div className="f">
            <span className="fl">{t("whatYouWouldObserve")}</span>
            <p>{concept.whatYouWouldObserve}</p>
          </div>
          <div className="f">
            <span className="fl">{t("whereTheNameComesFrom")}</span>
            <p>{concept.whereTheNameComesFrom}</p>
          </div>
          <div className="cite">
            <span>{t("entryCitationPrefix", { code: concept.itemCode })}</span>
            <button
              className="cb"
              onClick={(e) => {
                e.stopPropagation()
                onCite(concept.itemCode, concept.name)
              }}
            >
              {t("citeThisEntry")}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}