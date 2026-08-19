import "server-only";

import { cache } from "react";
import { apiGet } from "@/lib/api/http";
import type {
  FullReport,
  ReportLanguage,
} from "@/features/report-download/types/report";

/** GET /api/v1/reports/{report_id}/versions/full/{version}/{language} */
export const getFullReport = cache(
  async (
    reportId: string,
    version: string,
    language: ReportLanguage,
  ): Promise<FullReport> => {
    return apiGet<FullReport>(
      `/reports/${reportId}/versions/full/${version}/${language}`,
      {
        revalidate: 3600,
        tags: [
          `report:${reportId}`,
          `report:${reportId}:version:${version}:${language}`,
        ],
      },
    );
  },
);