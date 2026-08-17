import "server-only";

import { cache } from "react";
import { env } from "@/lib/env";
import type {
  PublicTaxonomyCategory,
  PublicTaxonomyConcept,
} from "@/features/public/taxonomy/types";
import { taxonomyData } from "@/util/mock/taxonomy";
import { getFullTaxonomy } from "@/features/public/components-queries";

const REPORT_SLUG = "stranded-capacity-index-2026";
const API_BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || env.apiUrl || "").replace(/\/$/, "");

interface ApiCategory {
  id: string;
  name: string;
  description: string | null;
}

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

function findRichConcept(categoryName: string, apiName: string): PublicTaxonomyConcept | undefined {
  const key = normalize(apiName);

  for (const cat of taxonomyData) {
    const catKey = normalize(cat.name);
    const catMatch =
      normalize(categoryName).includes(catKey) || catKey.includes(normalize(categoryName));

    if (!catMatch) continue;

    const found = cat.concepts.find(
      (concept) => normalize(concept.name) === key,
    );
    if (found) return found;

    // Coincidencia parcial (p.ej. "Scheduler Fragmentation" ↔ "Scheduler")
    const partial = cat.concepts.find((concept) => {
      const ck = normalize(concept.name);
      return key.includes(ck) || ck.includes(key);
    });
    if (partial) return partial;
  }

  return undefined;
}

function toConcept(
  apiConcept: ApiConcept,
  layerCode: "FAC" | "IT" | "WKL",
  categoryName: string,
  index: number,
): PublicTaxonomyConcept {
  const rich = findRichConcept(categoryName, apiConcept.name);

  const label: "est" | "prop" = rich?.label ?? (index % 2 === 0 ? "est" : "prop");

  return {
    id: apiConcept.id,
    itemCode: rich?.itemCode ?? `${layerCode}-${String(index + 1).padStart(2, "0")}`,
    layerCode: rich?.layerCode ?? layerCode,
    slug: rich?.slug ?? normalize(apiConcept.name).replace(/\s+/g, "-"),
    name: apiConcept.name,
    label,
    shortDescription:
      rich?.shortDescription ??
      apiConcept.description ??
      "Sin descripción corta disponible.",
    whatItIsNot:
      rich?.whatItIsNot ??
      "No hay definición detallada disponible para este concepto.",
    whatYouWouldObserve:
      rich?.whatYouWouldObserve ??
      "Observación no documentada aún.",
    whereTheNameComesFrom:
      rich?.whereTheNameComesFrom ??
      "Origen del término no documentado aún.",
  };
}

export const getPublicTaxonomyData = cache(async (): Promise<PublicTaxonomyCategory[]> => {
  if (!API_BASE) return taxonomyData;

  try {
    // Use getFullTaxonomy which leverages fullReport (1 call) or parallel fetches
    const fullTaxonomy = await getFullTaxonomy("ES");

    const result: PublicTaxonomyCategory[] = [];

    for (const category of fullTaxonomy) {
      const layerCode = layerCodeFor(category.name);

      const concepts = (category.concepts || []).map((concept, idx) =>
        toConcept(
          { 
            id: concept.id, 
            category_id: category.id, 
            name: concept.name, 
            description: concept.description || "",
            display_order: concept.display_order || idx + 1
          } as ApiConcept,
          layerCode,
          category.name,
          idx
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

    return result;
  } catch (e) {
    console.error("[Taxonomy] Unexpected error:", e);
    return taxonomyData;
  }
});
