import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { placeholderTaxonomy } from "@/features/public/taxonomy/data/placeholder";
import type {
  PublicTaxonomyCategory,
  PublicTaxonomyConcept,
} from "@/features/public/taxonomy/types";
import { getFullTaxonomy } from "@/features/public/components-queries";

interface ApiConcept {
  id: string;
  name: string;
  description: string | null;
}

function layerCodeFor(name: string): string {
  if (!name) return "TAX";
  const clean = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  return clean.substring(0, 3) || "TAX";
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function toConcept(
  apiConcept: ApiConcept,
  layerCode: string,
  index: number,
): PublicTaxonomyConcept {
  const label: "est" | "prop" = index % 2 === 0 ? "est" : "prop";

  return {
    id: apiConcept.id,
    itemCode: `${layerCode}-${String(index + 1).padStart(2, "0")}`,
    layerCode,
    slug: normalize(apiConcept.name).replace(/\s+/g, "-"),
    name: apiConcept.name,
    label,
    shortDescription:
      apiConcept.description ?? "Sin descripción corta disponible.",
    whatItIsNot: "No hay definición detallada disponible para este concepto.",
    whatYouWouldObserve: "Observación no documentada aún.",
    whereTheNameComesFrom: "Origen del término no documentado aún.",
  };
}

export const getPublicTaxonomyData = cache(
  async (lang?: "es" | "en"): Promise<PublicTaxonomyCategory[]> => {
    const cookieStore = await cookies();
    const cookieLang =
      (cookieStore.get("app_content_lang")?.value as "es" | "en") ||
      (cookieStore.get("app_lang")?.value as "es" | "en");
    const targetLang = lang || cookieLang || "es";
    const apiLang = targetLang === "en" ? "EN" : "ES";

    try {
      const fullTaxonomy = await getFullTaxonomy(apiLang);

      // Sin datos desde la API → placeholder estructurado para garantizar la demo.
      if (!fullTaxonomy || fullTaxonomy.length === 0) {
        return placeholderTaxonomy[targetLang];
      }

      const result: PublicTaxonomyCategory[] = [];

      for (const category of fullTaxonomy) {
        const layerCode = layerCodeFor(category.name);

        const concepts = (category.concepts || []).map((concept, idx) =>
          toConcept(
            {
              id: concept.id,
              category_id: (concept as ApiConcept & { category_id?: string }).category_id || category.id,
              name: concept.name,
              description: concept.description || "",
              display_order: (concept as ApiConcept & { display_order?: number }).display_order || idx + 1,
            } as ApiConcept & { category_id: string; display_order: number },
            layerCode,
            idx,
          ),
        );

        result.push({
          id: category.id,
          layerCode,
          name: category.name,
          description: category.description ?? "",
          concepts,
        });
      }

      const totalConcepts = result.reduce(
        (acc, cat) => acc + (cat.concepts?.length || 0),
        0,
      );
      if (totalConcepts === 0 || result.length === 0) {
        return placeholderTaxonomy[targetLang];
      }

      return result;
    } catch (e) {
      console.error("[Taxonomy] Unexpected error:", e);
      return placeholderTaxonomy[targetLang];
    }
  },
);