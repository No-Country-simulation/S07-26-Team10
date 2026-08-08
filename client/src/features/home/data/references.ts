export interface Reference {
  authors: string;
  title: string;
  year: number;
  source: string;
  citationUrl: string;
}

const FALLBACK_REFERENCES: Reference[] = [
  {
    authors: "Physa Energy Analytics",
    title: "Stranded Capacity Report 2026: The Silent Bottleneck of AI Infrastructure",
    year: 2026,
    source: "PhysaFlow Research",
    citationUrl: "https://physaflow.com/report",
  },
  {
    authors: "Lawrence Berkeley National Laboratory",
    title: "Data Center Facility and IT Infrastructure Best Practices",
    year: 2023,
    source: "Center of Expertise for Energy Efficiency in Data Centers",
    citationUrl: "https://datacenters.lbl.gov",
  },
  {
    authors: "Uptime Institute",
    title: "Annual Data Center Survey: Capacity and Cooling Trends",
    year: 2025,
    source: "Uptime Institute Intelligence",
    citationUrl: "https://uptimeinstitute.com",
  },
  {
    authors: "U.S. Department of Energy",
    title: "Power Usage Effectiveness (PUE) Measurement Guidelines",
    year: 2022,
    source: "DOE Federal Energy Management Program",
    citationUrl: "https://energy.gov",
  },
  {
    authors: "Kandula, S. & Menache, I.",
    title: "Calendaring Queues and Scheduling for Data Center Workloads",
    year: 2021,
    source: "ACM SIGCOMM",
    citationUrl: "https://dl.acm.org",
  },
];

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const REPORT_SLUG = "stranded-capacity-ai-infrastructure";

function mapApiReference(raw: {
  authors?: string | null;
  title?: string | null;
  year?: number | null;
  source?: string | null;
  citation_url?: string | null;
}): Reference {
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
    const reportRes = await fetch(`${API_BASE}/reports/${REPORT_SLUG}`, {
      next: { revalidate: 3600 },
    });
    if (!reportRes.ok) return FALLBACK_REFERENCES;
    const report = await reportRes.json();

    const res = await fetch(`${API_BASE}/references/report/${report.id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return FALLBACK_REFERENCES;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return FALLBACK_REFERENCES;

    return data.map(mapApiReference);
  } catch {
    return FALLBACK_REFERENCES;
  }
}