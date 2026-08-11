"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { fetchTaxonomyData } from "@/lib/taxonomy-api"
import type { TaxonomyCategory } from "@/lib/taxonomy-types"
import { TaxonomyMasthead } from "@/components/report/taxonomy/TaxonomyMasthead"
import { TaxonomyHow } from "@/components/report/taxonomy/TaxonomyHow"
import { TaxonomyAccordion } from "@/components/report/taxonomy/TaxonomyAccordion"

export default function TaxonomyPage() {
  const t = useTranslations("Report")
  const [categories, setCategories] = useState<TaxonomyCategory[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchTaxonomyData()
      .then((data) => {
        if (cancelled) return
        setCategories(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="taxonomy">
      <TaxonomyMasthead />
      <TaxonomyHow />
      {error ? (
        <section className="tx">
          <div className="in">
            <p className="none on">{t("failedToLoad")}</p>
          </div>
        </section>
      ) : (
        <TaxonomyAccordion categories={categories} />
      )}
    </div>
  )
}