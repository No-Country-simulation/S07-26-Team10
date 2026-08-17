import { apiGet } from "@/lib/api/http";
import {
  getReportBySlug,
  resolvePublishedVersion,
  type SiteLanguage,
} from "@/lib/api/reports";
import type { ApiReference } from "@/lib/api/types";

export interface Reference {
  authors: string;
  title: string;
  year: number;
  source: string;
  citationUrl: string;
  usage?: string;
}

const FALLBACK_REFERENCES: Reference[] = [
  {
    authors: "International Energy Agency",
    title: "Energy and AI",
    year: 2025,
    source: "International Energy Agency",
    citationUrl: "https://www.iea.org/reports/energy-and-ai",
    usage: "ioUsage",
  },
  {
    authors: "Stanford Institute for Human-Centered AI",
    title: "AI Index Report — Technical Performance",
    year: 2026,
    source: "Stanford Institute for Human-Centered AI",
    citationUrl:
      "https://hai.stanford.edu/ai-index/2026-ai-index-report/technical-performance",
    usage: "stanfordUsage",
  },
];

function mapApiReference(raw: ApiReference): Reference {
  return {
    authors: raw.authors || "PhysaFlow",
    title: raw.title || "Stranded Capacity Report",
    year: raw.year || new Date().getFullYear(),
    source: raw.source || "PhysaFlow Research",
    citationUrl: raw.citation_url || `https://physaflow.com/report`,
  };
}

export async function getReferences(
  lang: SiteLanguage = "es",
): Promise<Reference[]> {
  try {
    const report = await getReportBySlug();
    const version = await resolvePublishedVersion(report.id, lang);
    if (!version) return FALLBACK_REFERENCES;

    const data = await apiGet<ApiReference[]>(
      `/report-versions/${version.id}/references`,
    );
    if (!Array.isArray(data) || data.length === 0) return FALLBACK_REFERENCES;

    return data.map(mapApiReference);
  } catch {
    return FALLBACK_REFERENCES;
  }
}