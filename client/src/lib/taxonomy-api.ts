import {
  taxonomyData,
  getAdjacentConcepts,
  getRelatedConcepts,
} from "@/data/taxonomy"
import type {
  TaxonomyCategory,
  TaxonomyConcept,
} from "@/data/taxonomy"

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")
const REPORT_SLUG = "stranded-capacity-ai-infrastructure"

interface ApiCategory {
  id: string
  name: string
  description: string | null
}

interface ApiConcept {
  id: string
  category_id: string
  name: string
  description: string | null
}

function layerForCategory(categoryId: string): string {
  if (categoryId === "facility") return "FAC"
  if (categoryId === "it") return "IT"
  return "WKL"
}

/** Locate the equivalent local category; used to decide the layer order. */
function localCategory(categoryId: string) {
  return (
    taxonomyData.find((c) => c.id === categoryId) ||
    taxonomyData.find((c) => c.layerCode === layerForCategory(categoryId))
  )
}

/** Resolve the report id so category endpoints can be called by id. */
async function fetchReportId(): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/reports/${REPORT_SLUG}`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const data = await res.json()
      return data.id || REPORT_SLUG
    }
  } catch {
    // unreachable → serve local data
  }
  return REPORT_SLUG
}

export async function fetchTaxonomyData(): Promise<TaxonomyCategory[]> {
  try {
    const reportId = await fetchReportId()
    const catRes = await fetch(`${API_BASE}/categories/report/${reportId}`, {
      next: { revalidate: 3600 },
    })
    if (!catRes.ok) throw new Error(`categories returned ${catRes.status}`)

    const rawCategories: ApiCategory[] = await catRes.json()
    const categories: TaxonomyCategory[] = []

    for (const rawCat of rawCategories) {
      const layerCode = layerForCategory(rawCat.id)
      const conceptMap = localCategory(rawCat.id)?.concepts || []

      let concepts: TaxonomyConcept[] = []
      try {
        const conRes = await fetch(
          `${API_BASE}/concepts/category/${rawCat.id}`,
          { next: { revalidate: 3600 } },
        )
        if (conRes.ok) {
          const rawConcepts: ApiConcept[] = await conRes.json()
          concepts = rawConcepts.map((c, i) => mergeConceptFromApi(c, layerCode, i))
        }
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
  const cat = localCategory(c.category_id)
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
    shortDescription: stock?.shortDescription || c.description || "",
    definition: stock?.definition || c.description || "",
    characteristics: stock?.characteristics || [],
    operationalImpact: stock?.operationalImpact || "",
    commonCauses: stock?.commonCauses || [],
    exampleScenario: stock?.exampleScenario || "",
    relatedConceptIds: stock?.relatedConceptIds || [],
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

export async function fetchAdjacentConcepts(
  conceptId: string,
): Promise<{ prev: TaxonomyConcept | null; next: TaxonomyConcept | null }> {
  return getAdjacentConcepts(conceptId)
}

export async function fetchRelatedConcepts(
  conceptIds: string[],
): Promise<TaxonomyConcept[]> {
  return getRelatedConcepts(conceptIds)
}