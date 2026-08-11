export type TaxonomyLabel = "est" | "prop"

export interface TaxonomyConcept {
  id: string
  itemCode: string
  layerCode: string
  slug: string
  name: string
  label: TaxonomyLabel
  shortDescription: string
  whatItIsNot: string
  whatYouWouldObserve: string
  whereTheNameComesFrom: string
}

export interface TaxonomyCategory {
  id: string
  layerCode: string
  name: string
  description: string
  concepts: TaxonomyConcept[]
}