export type SearchResultType =
  | "section"
  | "category"
  | "concept"
  | "resource"
  | "reference"
  | "report_version"
  | (string & {});

export interface SearchResultLocation {
  report_version?: string;
  section?: string;
  category?: string;
  concept?: string;
  resource?: string;
  reference?: string;
  [key: string]: unknown;
}

export interface SearchResultItem {
  type: SearchResultType;
  id: string;
  title: string;
  matched_field: string;
  excerpt: string;
  location: SearchResultLocation;
  url: string;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResultItem[];
}

export type SearchTypeFilter =
  | "all"
  | "section"
  | "category"
  | "concept"
  | "reference"
  | "resource"
  | "report_version";

export interface SearchState {
  query: string;
  results: SearchResultItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
  selectedFilter: SearchTypeFilter;
}
