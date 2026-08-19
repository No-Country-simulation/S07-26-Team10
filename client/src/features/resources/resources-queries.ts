import "server-only";

import { cache } from "react";
import { getSectionResources } from "@/lib/api/reports";
import type { PublicResource } from "./resources-types";

function mapPublicResource(item: Record<string, unknown>): PublicResource {
  return {
    id: String(item.id || ""),
    section_id: String(item.section_id || ""),
    type: String(item.type || "FILE").toUpperCase(),
    title: String(item.title || ""),
    description: item.description ? String(item.description) : undefined,
    file_url: String(item.file_url || ""),
    alt_text: item.alt_text ? String(item.alt_text) : undefined,
    downloadable: item.downloadable !== undefined ? Boolean(item.downloadable) : true,
  };
}

/**
 * Server-only query to fetch public resources for a given section.
 * Endpoint: GET /api/v1/sections/{section_id}/resources
 */
export const getPublicSectionResources = cache(
  async (sectionId: string): Promise<PublicResource[]> => {
    if (!sectionId) return [];

    try {
      const data = await getSectionResources(sectionId);
      if (Array.isArray(data)) {
        return (data as unknown as Record<string, unknown>[]).map(mapPublicResource);
      }
    } catch (error) {
      console.error(
        `Error fetching public resources for section ${sectionId}:`,
        error,
      );
    }

    return [];
  },
);
