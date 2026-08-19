import "server-only";

import { cache } from "react";
import { apiGet } from "@/lib/api/http";
import type { SearchResponse } from "./search-types";

/**
 * Realiza una búsqueda global en todo el contenido publicado del backend.
 * Endpoint: GET /api/v1/search?q={query}&limit={limit}
 *
 * @param query Palabra o frase a buscar (minLength: 1)
 * @param limit Máximo de resultados a retornar (1 - 100, default: 20)
 */
export const searchPublicContent = cache(
  async (
    query: string,
    limit: number = 20,
  ): Promise<SearchResponse> => {
    const trimmed = query.trim();
    if (!trimmed) {
      return { query: "", total: 0, results: [] };
    }

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const encodedQuery = encodeURIComponent(trimmed);
    const path = `/search?q=${encodedQuery}&limit=${safeLimit}`;

    try {
      const response = await apiGet<SearchResponse>(path, {
        revalidate: 60, // cache por 60 segundos
      });

      return {
        query: response.query || trimmed,
        total: response.total ?? (Array.isArray(response.results) ? response.results.length : 0),
        results: Array.isArray(response.results) ? response.results : [],
      };
    } catch (error) {
      console.error(`Error in searchPublicContent for query '${query}':`, error);
      return {
        query: trimmed,
        total: 0,
        results: [],
      };
    }
  },
);
