import "server-only";

import { cache } from "react";
import { getApiUrl } from "@/lib/api-url";
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
 * Next.js Cache tags: ['resources', `resources-${sectionId}`]
 */
export const getPublicSectionResources = cache(
  async (sectionId: string): Promise<PublicResource[]> => {
    if (!sectionId) return [];

    try {
      const res = await fetch(getApiUrl(`/sections/${sectionId}/resources`), {
        headers: { "Content-Type": "application/json" },
        next: {
          revalidate: 3600,
          tags: ["resources", `resources-${sectionId}`],
        },
      });

      if (res.ok) {
        const data = (await res.json()) as Record<string, unknown>[];
        if (Array.isArray(data)) {
          return data.map(mapPublicResource);
        }
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
