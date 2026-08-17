import { apiGet } from "@/lib/api/http";
import type {
  PublicReportVersion,
} from "@/features/public/report/types";

export type ReportLanguage = "ES" | "EN";
export type ReportStatus = "DRAFT" | "PUBLISHED";

export function getReportVersions(reportId: string, status?: ReportStatus) {
  const query = status ? `?status=${status}` : "";

  return apiGet<PublicReportVersion[]>(`/reports/${reportId}/versions${query}`, {
    revalidate: 3600,
    tags: [`report:${reportId}:versions`],
  });
}

export function getPublishedVersions(reportId: string) {
  return apiGet<PublicReportVersion[]>(`/reports/${reportId}/versions/published`, {
    revalidate: 3600,
    tags: [`report:${reportId}:versions:published`],
  });
}

export function getReportVersion(reportId: string, versionId: string, loadRelations = false) {
  return apiGet<PublicReportVersion>(`/reports/${reportId}/versions/${versionId}?load_relations=${loadRelations}`, {
    revalidate: 3600,
    tags: [`report:${reportId}:version:${versionId}`],
  });
}

export function getReportVersionByLanguage(
  reportId: string,
  language: ReportLanguage,
  status?: ReportStatus,
) {
  const query = status ? `?status=${status}` : "";

  return apiGet<PublicReportVersion>(`/reports/${reportId}/versions/by-language/${language}${query}`, {
    revalidate: 3600,
    tags: [
      `report:${reportId}`,
      `report:${reportId}:version:${language}`,
    ],
  });
}

export function availableReportVersions(reportId: string) {
  return apiGet<PublicReportVersion[]>(`/reports/${reportId}/versions/available`, {
    revalidate: 3600,
    tags: [`report:${reportId}:versions:available`],
  });
}