"use server";

import { searchPublicContent } from "./search-queries";
import type { SearchResponse } from "./search-types";

/**
 * Server Action: Búsqueda global en el contenido publicado.
 * Permite a los componentes cliente realizar búsquedas asíncronas seguras.
 *
 * @param query Palabra o frase a buscar
 * @param limit Límite opcional de resultados (1 - 100, default: 20)
 */
export async function searchPublicContentAction(
  query: string,
  limit: number = 20,
): Promise<SearchResponse> {
  try {
    return await searchPublicContent(query, limit);
  } catch (error) {
    console.error("Error in searchPublicContentAction:", error);
    return {
      query: query.trim(),
      total: 0,
      results: [],
    };
  }
}
