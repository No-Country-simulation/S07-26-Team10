import "server-only";

import { cache } from "react";
import { getReports, getPublishedVersions } from "@/lib/api/reports";
import type { ApiVersion } from "@/lib/api/types";
import type {
  BaseReport,
  ReportVersion,
} from "@/features/admin/schemas/report-schema";

export interface PublicReportWithVersions extends BaseReport {
  report_versions: ReportVersion[];
}

function toReportVersion(
  v: ApiVersion,
  reportId: string,
): ReportVersion {
  return {
    id: v.id,
    report_id: reportId,
    title: v.title || "",
    version: v.version || "",
    language: (v.language?.toUpperCase() === "EN" ? "EN" : "ES") as "ES" | "EN",
    summary: v.summary || "",
    citation_text: v.citation_text || "",
    status: (v.status?.toUpperCase() === "DRAFT" ? "DRAFT" : "PUBLISHED") as
      | "DRAFT"
      | "PUBLISHED",
    created_at: v.created_at,
    updated_at: v.updated_at,
  };
}

/**
 * Server-only query (no server action) que obtiene reportes base con sus
 * versiones publicadas usando endpoints públicos.
 * Envuelta en cache() para deduplicación por request.
 */
export const getPublicReportsWithVersions = cache(
  async (): Promise<PublicReportWithVersions[]> => {
    try {
      const reports = await getReports();
      if (!Array.isArray(reports) || reports.length === 0) return [];

      const withVersions = await Promise.all(
        reports.map(async (report) => {
          try {
            const versions = await getPublishedVersions(report.id);
            const mapped = (Array.isArray(versions) ? versions : []).map(
              (v) => toReportVersion(v, report.id),
            );
            return { ...report, report_versions: mapped };
          } catch {
            return { ...report, report_versions: [] };
          }
        }),
      );

      return withVersions;
    } catch (error) {
      console.error("Error fetching public reports with versions:", error);
      return [];
    }
  },
);