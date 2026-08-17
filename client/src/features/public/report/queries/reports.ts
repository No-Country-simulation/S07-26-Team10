import { apiGet } from "@/lib/api/http";
import type { PublicReport, PublicReportVersion } from "@/features/public/report/types";

export async function getReports() : Promise<PublicReport[]> {

  return apiGet<PublicReport[]>(
    "/reports", {
      revalidate: 3600,
      tags: ["reports"],
    });

}


export async function getReport(
  reportId: string,
): Promise<PublicReport> {
  return apiGet<PublicReport>(
    `/reports/${reportId}`,
    {
      revalidate: 3600,
      tags: [`report:${reportId}`],
    },
  );
}

export async function getReportVersionByLanguage(
  reportId: string,
  language: "ES" | "EN",
): Promise<PublicReportVersion> {
  return apiGet<PublicReportVersion>(
    `/reports/${reportId}/versions/by-language/${language}?status=PUBLISHED`,
    {
      revalidate: 3600,
      tags: [
        `report:${reportId}`,
        `report:${reportId}:version:${language}`,
      ],
    },
  );
}

//Funciono para traer un reporte por su slug

export async function getReportBySlug (
  slug: string,
): Promise<PublicReport>{
  return apiGet<PublicReport>(
     `/reports/by-slug/${encodeURIComponent(slug)}`,
     {
      revalidate: 3600,
      tags:[`report:slug:${slug}`],
     }
  )
}
