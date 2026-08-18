import "server-only";

import { cache } from "react";
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

function layerCodeFor(name: string): "FAC" | "IT" | "WKL" {
  const n = name.toLowerCase();
  if (n.includes("facility") || n.includes("instalaci") || n.includes("facilidad")) return "FAC";
  if (n.includes("it") || n.includes("comput") || n.includes("inform")) return "IT";
  return "WKL";
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
  layerCode: "FAC" | "IT" | "WKL",
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
    const targetLang = (lang ?? "es") === "en" ? "en" : "es";

    try {
      // Sin arg → resuelve idioma desde cookie; con arg → idioma explícito.
      const fullTaxonomy = await getFullTaxonomy(
        lang ? (lang === "en" ? "EN" : "ES") : undefined,
      );

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
              category_id: concept.category_id,
              name: concept.name,
              description: concept.description || "",
              display_order: concept.display_order || idx + 1,
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

      return result.length > 0 ? result : placeholderTaxonomy[targetLang];
    } catch (e) {
      console.error("[Taxonomy] Unexpected error:", e);
      return placeholderTaxonomy[targetLang];
    }
  },
);