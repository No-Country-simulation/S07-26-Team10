"use server";

import { getPublicTaxonomyData } from "./queries/taxonomy";
import type { PublicTaxonomyCategory } from "./types";

export async function getPublicTaxonomyDataAction(
  lang?: "es" | "en",
): Promise<PublicTaxonomyCategory[]> {
  try {
    return await getPublicTaxonomyData(lang);
  } catch (error) {
    console.error("Error in getPublicTaxonomyDataAction:", error);
    return [];
  }
}
