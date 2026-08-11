import { taxonomyData } from "@/util/mock/taxonomy"
import type {
  TaxonomyCategory,
  TaxonomyConcept,
} from "@/lib/taxonomy-types"

export function getCategoryByLayer(
  layerCode: string,
): TaxonomyCategory | undefined {
  return taxonomyData.find((cat) => cat.layerCode === layerCode)
}

export function getConceptById(
  conceptId: string,
): TaxonomyConcept | undefined {
  for (const cat of taxonomyData) {
    const concept = cat.concepts.find((c) => c.id === conceptId)
    if (concept) return concept
  }
  return undefined
}

export function getConceptByItemCode(
  itemCode: string,
): TaxonomyConcept | undefined {
  for (const cat of taxonomyData) {
    const concept = cat.concepts.find((c) => c.itemCode === itemCode)
    if (concept) return concept
  }
  return undefined
}

export function getAllConceptsFlattened(): TaxonomyConcept[] {
  return taxonomyData.flatMap((cat) => cat.concepts)
}

export function getConceptCount(layerCode: string): number {
  return getCategoryByLayer(layerCode)?.concepts.length ?? 0
}