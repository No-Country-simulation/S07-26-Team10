import { getFullReportAction } from "@/features/report-download/actions/download-report";
import type { FullReport } from "@/features/report-download/types/report";

let inFlight = false;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildFilename(report: FullReport): string {
  const slug = report.report.slug || report.report_id;
  return `${slug}-${report.version}-${report.language}.pdf`;
}

export function isReportDownloadInFlight(): boolean {
  return inFlight;
}

/**
 * Genera el PDF del reporte completo en el cliente.
 *
 * El backend solo expone JSON en GET /api/v1/reports/{report_id}/versions/full/{version}/{language},
 * por lo que el PDF se compone del lado del browser con @react-pdf/renderer.
 * Se importa dinámicamente para no cargar la librería en el bundle inicial.
 */
export async function generateReportPdf(report: FullReport): Promise<Blob> {
  const { pdf } = await import("@react-pdf/renderer");
  const { ReportPdfDocument } = await import(
    "@/features/report-download/pdf/report-pdf-document"
  );

  return pdf(<ReportPdfDocument report={report} />).toBlob();
}

/**
 * Descarga el reporte completo como PDF.
 */
export async function downloadReport(
  reportId: string,
  version: string,
  language: "ES" | "EN",
): Promise<void> {
  if (inFlight) {
    throw new Error("A report download is already in progress.");
  }

  inFlight = true;

  try {
    const report = await getFullReportAction(reportId, version, language);

    const blob = await generateReportPdf(report);

    downloadBlob(blob, buildFilename(report));
  } finally {
    inFlight = false;
  }
}