export interface Reference {
  authors: string;
  title: string;
  year: number;
  source: string;
  citationUrl: string;
}

export const referencesData: Reference[] = [
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

export function getReferences(lang: "es" | "en"): Reference[] {
  return referencesData;
}
