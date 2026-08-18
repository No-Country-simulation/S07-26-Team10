import {
  getReportBySlug,
  REPORT_SLUG,
  resolvePublishedVersion,
} from "@/lib/api/reports";


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

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export interface ApiReference {
  authors?: string | null;
  title?: string | null;
  year?: number | null;
  source?: string | null;
  citation_url?: string | null;
  display_order?: number | null;
}

function mapApiReference(raw: ApiReference): Reference {
  return {
    authors: raw.authors || "PhysaFlow",
    title: raw.title || "Stranded Capacity Report",
    year: raw.year || new Date().getFullYear(),
    source: raw.source || "PhysaFlow Research",
    citationUrl: raw.citation_url || `https://physaflow.com/report`,
  };
}

export async function getReferences(): Promise<Reference[]> {
  try {
    const report = await getReportBySlug(REPORT_SLUG);
    const version = await resolvePublishedVersion(report.id, "es");
    if (!version) return FALLBACK_REFERENCES;

    const res = await fetch(
      `${API_BASE}/report-versions/${version.id}/references`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return FALLBACK_REFERENCES;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return FALLBACK_REFERENCES;

    return data.map(mapApiReference);
  } catch {
    return FALLBACK_REFERENCES;
  }
}