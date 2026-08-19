"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { downloadReport } from "@/features/report-download/utils/download-report";
import type { ReportLanguage } from "@/features/report-download/types/report";

interface DownloadReportButtonProps {
  reportId: string;
  version: string;
  language: ReportLanguage;
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v12M7 12l5 5 5-5M5 20h14" />
    </svg>
  );
}

export function DownloadReportButton({
  reportId,
  version,
  language,
}: DownloadReportButtonProps) {
  const t = useTranslations("Report");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const handleClick = async () => {
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    setDownloading(true);
    setError(null);

    try {
      await downloadReport(reportId, version, language);
    } catch {
      setError(t("downloadFailed"));
    } finally {
      inFlightRef.current = false;
      setDownloading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="b line"
        onClick={handleClick}
        disabled={downloading}
      >
        {downloading ? t("downloading") : t("downloadPdf")} <DownloadIcon />
      </button>
      {error ? <span className="fdl-err">{error}</span> : null}
    </>
  );
}