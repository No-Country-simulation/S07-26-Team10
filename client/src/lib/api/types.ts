export interface ApiReport {
  id: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiVersion {
  id: string;
  title: string | null;
  version: string | null;
  language: string;
  summary: string | null;
  citation_text: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiCategory {
  id: string;
  report_version_id: string;
  name: string;
  description: string | null;
  display_order: number;
}

export interface ApiConcept {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  display_order: number;
}

export interface ApiReference {
  id: string;
  report_version_id: string;
  authors?: string | null;
  title?: string | null;
  year?: number | null;
  source?: string | null;
  citation_url?: string | null;
  display_order?: number | null;
}

export interface ApiSection {
  id: string;
  report_version_id: string;
  title: string;
  slug: string;
  content: string | null;
  display_order: number;
}

export interface ApiResource {
  id: string;
  section_id: string;
  title: string;
  description?: string | null;
  file_url?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  display_order?: number | null;
}

export interface FullReportData {
  version: ApiVersion;
  sections: ApiSection[];
  categories: (ApiCategory & { concepts: ApiConcept[] })[];
  references: ApiReference[];
}