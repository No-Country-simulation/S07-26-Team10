import type { ApiReport } from "@/lib/api/types";

export type ReportLanguage = "ES" | "EN";

export interface FullReportResource {
  id: string;
  section_id: string;
  type: string;
  title: string;
  description: string | null;
  file_url: string | null;
  cloudinary_public_id: string | null;
  alt_text: string | null;
  downloadable: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface FullReportSection {
  id: string;
  report_version_id: string;
  title: string;
  slug: string;
  content: string;
  display_order: number;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  resources: FullReportResource[];
}

export interface FullReportConcept {
  id: string;
  category_id: string;
  name: string;
  description: string;
  display_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface FullReportCategory {
  id: string;
  report_version_id: string;
  name: string;
  description: string;
  display_order: number;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  concepts: FullReportConcept[];
}

export interface FullReportReference {
  id: string;
  report_version_id: string;
  authors: string;
  title: string;
  year: number;
  source: string;
  citation_url: string;
  display_order: number;
  created_at: string | null;
  updated_at: string | null;
}

/** Respuesta completa de GET /api/v1/reports/{report_id}/versions/full/{version}/{language} */
export interface FullReport {
  id: string;
  report_id: string;
  title: string;
  version: string;
  language: ReportLanguage;
  summary: string;
  citation_text: string;
  status: string;
  created_at: string;
  updated_at: string;
  report: ApiReport;
  sections: FullReportSection[];
  categories: FullReportCategory[];
  references: FullReportReference[];
}