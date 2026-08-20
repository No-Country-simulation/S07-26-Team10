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
  name?: string | null;
  description?: string | null;
  category_id?: string;
  display_order?: number;
}

function layerCodeFor(name?: string | null): string {
  if (!name) return "TAX";
  const clean = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  if (clean.includes("FACIL") || clean.includes("INSTAL") || clean.includes("INFRA")) return "FAC";
  if (clean === "IT" || clean.includes("TECNOL") || clean.includes("HARDWARE")) return "IT";
  if (clean.includes("WORK") || clean.includes("CARGA") || clean.includes("OPERAC") || clean.includes("WKL")) return "WKL";

  return clean.substring(0, 3) || "TAX";
}

function normalize(s?: string | null): string {
  if (!s) return "";
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
  categoryId: string,
  index: number,
): PublicTaxonomyConcept {
  const label: "est" | "prop" = index % 2 === 0 ? "est" : "prop";
  const safeName = apiConcept.name || "Sin nombre";

  return {
    id: apiConcept.id,
    categoryId: apiConcept.category_id || categoryId,
    itemCode: `${layerCode}-${String(index + 1).padStart(2, "0")}`,
    layerCode,
    slug: normalize(safeName).replace(/\s+/g, "-") || `concept-${index + 1}`,
    name: safeName,
    label,
    shortDescription:
      apiConcept.description || "Sin descripción corta disponible.",
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
    const targetLang: "es" | "en" = lang === "en" || cookieLang === "en" ? "en" : "es";
    const apiLang = targetLang === "en" ? "EN" : "ES";

    try {
      const fullTaxonomy = await getFullTaxonomy(apiLang);

      // Sin datos desde la API → placeholder estructurado para garantizar la demo.
      if (!fullTaxonomy || fullTaxonomy.length === 0) {
        return placeholderTaxonomy[targetLang] || placeholderTaxonomy.es;
      }

      const result: PublicTaxonomyCategory[] = [];

      for (const category of fullTaxonomy) {
        const layerCode = layerCodeFor(category.name);

        const concepts = (category.concepts || []).map((concept, idx) =>
          toConcept(
            {
              id: concept.id,
              category_id: (concept as ApiConcept).category_id || category.id,
              name: concept.name,
              description: concept.description || "",
              display_order: (concept as ApiConcept).display_order || idx + 1,
            },
            layerCode,
            category.id,
            idx,
          ),
        );

        result.push({
          id: category.id,
          layerCode,
          name: category.name || "Sin nombre",
          description: category.description ?? "",
          concepts,
        });
      }

      const totalConcepts = result.reduce(
        (acc, cat) => acc + (cat.concepts?.length || 0),
        0,
      );
      if (totalConcepts === 0 || result.length === 0) {
        return placeholderTaxonomy[targetLang] || placeholderTaxonomy.es;
      }

      return result;
    } catch (e) {
      console.error("[Taxonomy] Unexpected error:", e);
      return placeholderTaxonomy[targetLang] || placeholderTaxonomy.es;
    }
  },
);