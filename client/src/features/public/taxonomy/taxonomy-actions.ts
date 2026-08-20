"use server";

import { getPublicTaxonomyData } from "./queries/taxonomy";
import type { PublicTaxonomyCategory } from "./types";

export async function getPublicTaxonomyDataAction(
  lang?: "es" | "en",
  versionId?: string,
): Promise<PublicTaxonomyCategory[]> {
  try {
    return await getPublicTaxonomyData(lang, versionId);
  } catch (error) {
    console.error("Error in getPublicTaxonomyDataAction:", error);
    return [];
  }
}
