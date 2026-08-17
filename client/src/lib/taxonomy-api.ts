import { taxonomyData } from "@/util/mock/taxonomy"
import type {
  TaxonomyCategory,
  TaxonomyConcept,
} from "@/lib/taxonomy-types"
import { apiGet } from "@/lib/api/http"
import {
  getReportBySlug,
  resolvePublishedVersion,
  type SiteLanguage,
} from "@/lib/api/reports"
import type {
  ApiCategory,
  ApiConcept,
} from "@/lib/api/types"

/** Infer the layer code from an API category name (ids are UUIDs on the live API). */
function layerForCategoryName(name: string): string {
  if (name.toLowerCase().includes("facilit")) return "FAC"
  if (name.toLowerCase() === "it" || name.toLowerCase().includes("hardware")) return "IT"
  return "WKL"
}

/** Locate the equivalent local category by name; used to decide the layer order. */
function localCategory(raw: { id: string; name: string }) {
  return (
    taxonomyData.find((c) => c.name === raw.name) ||
    taxonomyData.find((c) => c.layerCode === layerForCategoryName(raw.name))
  )
}

export async function fetchTaxonomyData(
  lang: SiteLanguage = "es",
): Promise<TaxonomyCategory[]> {
  try {
    const report = await getReportBySlug()
    const version = await resolvePublishedVersion(report.id, lang)
    if (!version) throw new Error("no published version")

    const categories: TaxonomyCategory[] = []
    const rawCategories = await apiGet<ApiCategory[]>(
      `/report-versions/${version.id}/categories`,
    )

    for (const rawCat of rawCategories) {
      const layerCode = layerForCategoryName(rawCat.name)
      const conceptMap = localCategory(rawCat)?.concepts || []

      let concepts: TaxonomyConcept[] = []
      try {
        const rawConcepts = await apiGet<ApiConcept[]>(
          `/categories/${rawCat.id}/concepts`,
        )
        concepts = rawConcepts.map((c, i) => mergeConceptFromApi(c, layerCode, i))
      } catch {
        // keep fallback concepts below
      }

      // If the API returned no concepts, use the local fallback entries.
      if (concepts.length === 0) {
        concepts = structuredClone(conceptMap)
      }

      categories.push({
        id: rawCat.id,
        layerCode,
        name: rawCat.name,
        description: rawCat.description ?? "",
        concepts,
      })
    }

    return categories
  } catch {
    return structuredClone(taxonomyData)
  }
}

function mergeConceptFromApi(
  c: ApiConcept,
  layerCode: string,
  index: number,
): TaxonomyConcept {
  const cat = taxonomyData.find((x) => x.layerCode === layerCode)
  const stock = cat?.concepts.find(
    (x) => x.id === c.id || x.name === c.name,
  )
  return {
    id: c.id || stock?.id || `concept-${index}`,
    slug: stock?.slug || stock?.id || c.id,
    itemCode:
      stock?.itemCode ||
      `${layerCode}-${String(index + 1).padStart(2, "0")}`,
    layerCode,
    name: c.name || stock?.name || "Unnamed concept",
    label: stock?.label || "est",
    shortDescription: stock?.shortDescription || c.description || "",
    whatItIsNot: stock?.whatItIsNot || "",
    whatYouWouldObserve: stock?.whatYouWouldObserve || "",
    whereTheNameComesFrom: stock?.whereTheNameComesFrom || "",
  }
}

export async function fetchConceptById(
  id: string,
): Promise<TaxonomyConcept | null> {
  const data = await fetchTaxonomyData()
  for (const cat of data) {
    const found = cat.concepts.find((c) => c.id === id)
    if (found) return found
  }
  return null
}

export async function fetchCategoryByConceptId(
  conceptId: string,
): Promise<TaxonomyCategory | null> {
  const data = await fetchTaxonomyData()
  return (
    data.find((cat) => cat.concepts.some((c) => c.id === conceptId)) ?? null
  )
}