export interface PublicTaxonomyConcept {
  id: string;
  categoryId?: string;
  itemCode: string;
  layerCode: string;
  slug: string;
  name: string;
  label: "est" | "prop";
  shortDescription: string;
  whatItIsNot: string;
  whatYouWouldObserve: string;
  whereTheNameComesFrom: string;
}

export interface PublicTaxonomyCategory {
  id: string;
  layerCode: string;
  name: string;
  description: string;
  concepts: PublicTaxonomyConcept[];
}
