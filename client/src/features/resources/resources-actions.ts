"use server";

import { getPublicSectionResources } from "./resources-queries";
import type { PublicResource } from "./resources-types";

/**
 * Server Action: GET /api/v1/sections/{section_id}/resources
 * Obtener recursos públicos asociados a una sección.
 */
export async function getSectionResourcesAction(
  sectionId: string,
): Promise<PublicResource[]> {
  try {
    return await getPublicSectionResources(sectionId);
  } catch (error) {
    console.error("Error in getSectionResourcesAction:", error);
    return [];
  }
}
