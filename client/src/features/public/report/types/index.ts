export interface PublicReport {
  id: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
  title?: string | null;
}

export interface PublicReportVersion {
  id: string;
  report_id?: string;
  title?: string | null;
  version?: string | null;
  language?: "ES" | "EN" | string;
  summary?: string | null;
  citation_text?: string | null;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | string;
  created_at?: string;
  updated_at?: string;
}
