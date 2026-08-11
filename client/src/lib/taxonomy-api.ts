import { taxonomyData } from "@/util/mock/taxonomy"
import type {
  TaxonomyCategory,
  TaxonomyConcept,
} from "@/lib/taxonomy-types"

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")
const REPORT_SLUG = "stranded-capacity-ai-infrastructure"

interface ApiReport {
  id: string
  slug: string
}

interface ApiVersion {
  id: string
  language: "ES" | "EN" | string
}

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

/** Resolve the published report version id so category endpoints can be called by id. */
async function resolvePublishedVersionId(reportId: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/reports/${reportId}/versions/published`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data: ApiVersion[] = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null
    return data[0].id
  } catch {
    return null
  }
}

export async function fetchTaxonomyData(): Promise<TaxonomyCategory[]> {
  try {
    const reportRes = await fetch(`${API_BASE}/reports/by-slug/${REPORT_SLUG}`, {
      next: { revalidate: 3600 },
    })
    if (!reportRes.ok) throw new Error(`report returned ${reportRes.status}`)
    const report: ApiReport = await reportRes.json()

    const versionId = await resolvePublishedVersionId(report.id)
    if (!versionId) throw new Error("no published version")

    const catRes = await fetch(
      `${API_BASE}/report-versions/${versionId}/categories`,
      { next: { revalidate: 3600 } },
    )
    if (!catRes.ok) throw new Error(`categories returned ${catRes.status}`)

    const rawCategories: ApiCategory[] = await catRes.json()
    const categories: TaxonomyCategory[] = []

    for (const rawCat of rawCategories) {
      const layerCode = layerForCategoryName(rawCat.name)
      const conceptMap = localCategory(rawCat)?.concepts || []

      let concepts: TaxonomyConcept[] = []
      try {
        const conRes = await fetch(
          `${API_BASE}/categories/${rawCat.id}/concepts`,
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
