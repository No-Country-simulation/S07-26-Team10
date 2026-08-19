import { getPublicReportContext } from "@/features/public/report/queries/report";
import { DownloadReportButton } from "@/features/report-download/components/download-report-button";
import type { ReportLanguage } from "@/features/report-download/types/report";
import type { ApiVersion, FullReportData } from "@/lib/api/types";

/**
 * El endpoint /versions/full/ devuelve `version` como string ("v2"), mientras
 * que /versions/by-language/ lo devuelve como objeto ApiVersion. getPublicReportContext
 * tipa fullReport.version como ApiVersion, pero en runtime puede ser un string.
 */
function resolveVersionString(
  version: ApiVersion | string | null,
  fullReport: FullReportData | null,
): string {
  const candidates = [fullReport?.version, version];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
    if (
      candidate &&
      typeof candidate === "object" &&
      typeof candidate.version === "string" &&
      candidate.version.length > 0
    ) {
      return candidate.version;
    }
  }
  return "";
}

export async function DownloadReportButtonServer() {
  const context = await getPublicReportContext();

  if (!context.report) return null;

  const version = resolveVersionString(
    context.version as ApiVersion | string | null,
    context.fullReport,
  );

  if (!version) return null;

  const language: ReportLanguage = context.language === "en" ? "EN" : "ES";

  return (
    <DownloadReportButton
      reportId={context.report.id}
      version={version}
      language={language}
    />
  );
}