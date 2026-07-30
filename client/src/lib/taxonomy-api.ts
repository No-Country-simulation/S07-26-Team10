import {
  taxonomyData,
  getCategoryByConceptId,
  getConceptById,
  getAdjacentConcepts,
  getRelatedConcepts,
} from "@/data/taxonomy"
import type {
  TaxonomyCategory,
  TaxonomyConcept,
} from "@/data/taxonomy"

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchTaxonomyData(): Promise<TaxonomyCategory[]> {
  await delay(280)
  return structuredClone(taxonomyData)
}

export async function fetchConceptById(
  id: string,
): Promise<TaxonomyConcept | null> {
  await delay(120)
  return getConceptById(id) ?? null
}

export async function fetchCategoryByConceptId(
  conceptId: string,
): Promise<TaxonomyCategory | null> {
  await delay(120)
  return getCategoryByConceptId(conceptId) ?? null
}

export async function fetchAdjacentConcepts(
  conceptId: string,
): Promise<{ prev: TaxonomyConcept | null; next: TaxonomyConcept | null }> {
  await delay(80)
  return getAdjacentConcepts(conceptId)
}

export async function fetchRelatedConcepts(
  conceptIds: string[],
): Promise<TaxonomyConcept[]> {
  await delay(80)
  return getRelatedConcepts(conceptIds)
}
