import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import {
  getReportBySlug,
  getReportById,
  getPublishedVersions,
  getPublishedVersionByLanguage,
  getPublishedVersionByVersion,
  getFullReport,
  getReportVersionSections,
  getReportVersionSectionBySlug,
  resolvePublishedVersion,
} from "@/lib/api/reports";
import type { ApiReport, ApiVersion, ApiSection, FullReportData } from "@/lib/api/types";

export type PublicLanguage = "es" | "en";

const DEFAULT_REPORT_SLUG = "stranded-capacity-index-2026";



async function getSelectedReportIdFromCookie(): Promise<string | null> {
  const cookieStore = cookies();
  return cookieStore.then((store) => store.get("app_base_report_id")?.value || null);
}

async function getSelectedVersionFromCookie(): Promise<string | null> {
  const cookieStore = cookies();
  return cookieStore.then((store) => store.get("app_version")?.value || null);
}

async function getSelectedLanguageFromCookie(): Promise<PublicLanguage> {
  const cookieStore = cookies();
  return cookieStore.then((store) => {
    const lang = store.get("app_content_lang")?.value;
    return lang === "en" ? "en" : "es";
  });
}

export const getPublicReportContext = cache(async (lang?: PublicLanguage) => {
  const resolvedLang = lang ?? await getSelectedLanguageFromCookie();
  const targetLang = resolvedLang === "en" ? "EN" : "ES";

  // Try to get selected report ID from cookie first
  const selectedReportId = await getSelectedReportIdFromCookie();
  let report: ApiReport | null = null;

  if (selectedReportId) {
    report = await getReportById(selectedReportId).catch(() => null);
  }

  // Fallback to default slug if no report ID selected or not found
  if (!report) {
    report = await getReportBySlug(DEFAULT_REPORT_SLUG).catch(() => null);
  }

  if (!report) {
    return { report: null, version: null, language: resolvedLang, fullReport: null as FullReportData | null };
  }

  const versionString = await getSelectedVersionFromCookie();
  let version: ApiVersion | null = null;
  let fullReport: FullReportData | null = null;

  if (versionString) {
    //
    try {
      fullReport = await getFullReport(report.id, versionString, targetLang);
      version = fullReport.version;
    } catch {
      // Fallback de by-version endpoint si no esta disponible el reporte completo
      try {
        version = await getPublishedVersionByVersion(report.id, versionString);
      } catch {
        version = null;
      }
    }
  }

  if (!version) {
    // Se usa el endpoint de by-language para obtener la version publicada mas reciente de un reporte
    try {
      version = await getPublishedVersionByLanguage(report.id, targetLang);
    } catch {
      // Final fallback a client-side resolution
      version = await resolvePublishedVersion(report.id, resolvedLang);
    }
  }

  // If we have version but no fullReport, try to get it
  if (version && !fullReport) {
    try {
      fullReport = await getFullReport(report.id, version.version || "", targetLang);
    } catch {
      // Full report not available, will use individual endpoints
    }
  }

  return { report, version, language: resolvedLang, fullReport };
});

export interface PublicSection {
  id: string;
  slug: string;
  title: string | null;
  content: string | null;
  display_order: number | null;
}

export const getPublicSectionBySlug = cache(async (
  slug: string,
  lang?: PublicLanguage,
): Promise<PublicSection | null> => {
  const context = await getPublicReportContext(lang);
  if (!context.report || !context.version) return null;

  // If we have fullReport, use it
  if (context.fullReport?.sections) {
    const section = context.fullReport.sections.find((s) => s.slug === slug);
    if (section) return section;
  }

  // Fallback to individual endpoint
  try {
    const section = await getReportVersionSectionBySlug(context.version.id, slug);
    return section;
  } catch {
    return null;
  }
});

export const getPublicReportSections = cache(async (
  lang?: PublicLanguage,
): Promise<ApiSection[]> => {
  const context = await getPublicReportContext(lang);
  if (!context.report || !context.version) return [];

  // If we have fullReport, use it
  if (context.fullReport?.sections) {
    return context.fullReport.sections;
  }

  // Fallback to individual endpoint
  try {
    return await getReportVersionSections(context.version.id);
  } catch {
    return [];
  }
});
