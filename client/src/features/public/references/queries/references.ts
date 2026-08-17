import "server-only";

import { cache } from "react";
import type { PublicReference } from "@/features/public/references/types";
import { getReportEvidence } from "@/features/public/components-queries";

export const getPublicReferences = cache(async (): Promise<PublicReference[]> => {
  try {
    const evidence = await getReportEvidence("");

    return evidence.map((ref) => ({
      authors: ref.authors || "PhysaFlow",
      title: ref.title || "Stranded Capacity Report",
      year: ref.year || new Date().getFullYear(),
      source: ref.citationText || "PhysaFlow Research",
      citationUrl: ref.url || "https://physaflow.com/report",
    }));
  } catch (e) {
    console.error("[References] Unexpected error:", e);
    return [];
  }
});
