"use server";

import { getFullReport } from "@/features/report-download/queries/report";
import type {
  FullReport,
  ReportLanguage,
} from "@/features/report-download/types/report";

export async function getFullReportAction(
  reportId: string,
  version: string,
  language: ReportLanguage,
): Promise<FullReport> {
  return getFullReport(reportId, version, language);
}