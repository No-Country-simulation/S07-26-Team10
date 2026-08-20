export type ResourceType =
  | "IMAGE"
  | "GRAPH"
  | "DIAGRAM"
  | "FILE"
  | string;

export interface PublicResource {
  id: string;
  section_id: string;
  type: ResourceType;
  title: string;
  description?: string;
  file_url: string;
  alt_text?: string;
  downloadable?: boolean;
}
