import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { placeholderTaxonomy } from "@/features/public/taxonomy/data/placeholder";
import type {
  PublicTaxonomyCategory,
  PublicTaxonomyConcept,
} from "@/features/public/taxonomy/types";
import {
  getReportVersionCategories,
  getCategoryConcepts,
} from "@/lib/api/reports";
import { resolveActiveReportVersionId } from "@/features/chapters/chapters-queries";

interface ApiConcept {
  id: string;
  name?: string | null;
  description?: string | null;
  category_id?: string;
  display_order?: number;
}

function layerCodeFor(name?: string | null, index = 0): string {
  if (!name || !name.trim()) return `CAT${index + 1}`;

  const clean = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  const words = clean.split(/\s+/).filter(Boolean);

  // Si tiene múltiples palabras (ej. "Machine Learning", "Cargas de Trabajo", "Redes y Sistemas"), usar iniciales
  if (words.length >= 2) {
    const initials = words
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, "")[0] || "")
      .join("")
      .toUpperCase();
    if (initials.length >= 2 && initials.length <= 4) {
      return initials;
    }
  }

  // Para una sola palabra, tomar los primeros 3 caracteres alfanuméricos en mayúsculas
  const alphanumeric = clean.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (alphanumeric.length >= 2) {
    return alphanumeric.substring(0, Math.min(3, alphanumeric.length));
  }

  return `CAT${index + 1}`;
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
  async (
    preferredLang?: "es" | "en",
    reportVersionId?: string,
  ): Promise<PublicTaxonomyCategory[]> => {
    let targetLang: "es" | "en" = preferredLang || "es";
    try {
      const cookieStore = await cookies();
      const cookieLang =
        (cookieStore.get("app_content_lang")?.value as "es" | "en") ||
        (cookieStore.get("app_lang")?.value as "es" | "en");
      targetLang = preferredLang || cookieLang || "es";
    } catch {
      // ignore
    }

    const versionId =
      reportVersionId || (await resolveActiveReportVersionId(targetLang));

    if (versionId) {
      try {
        const categories = await getReportVersionCategories(versionId);
        if (Array.isArray(categories) && categories.length > 0) {
          const categoriesWithConcepts = await Promise.all(
            categories.map(async (cat, catIdx) => {
              const concepts = await getCategoryConcepts(cat.id).catch(() => []);
              const layerCode = layerCodeFor(cat.name, catIdx);

              const mappedConcepts = (Array.isArray(concepts) ? concepts : []).map(
                (concept, idx) =>
                  toConcept(
                    {
                      id: concept.id,
                      category_id: concept.category_id || cat.id,
                      name: concept.name,
                      description: concept.description || "",
                      display_order: concept.display_order || idx + 1,
                    },
                    layerCode,
                    cat.id,
                    idx,
                  ),
              );

              return {
                id: cat.id,
                layerCode,
                name: cat.name || "Sin nombre",
                description: cat.description ?? "",
                concepts: mappedConcepts,
              };
            }),
          );

          return categoriesWithConcepts;
        }
      } catch (error) {
        console.error(
          `Error fetching public taxonomy for version ${versionId}:`,
          error,
        );
      }
    }

    // Fallback if no categories in DB
    return placeholderTaxonomy[targetLang] || placeholderTaxonomy.es;
  },
);