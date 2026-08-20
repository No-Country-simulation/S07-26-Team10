import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import {
  getReportById,
  getPublishedVersions,
  getPublishedVersionByLanguage,
  getPublishedVersionByVersion,
  getFullReport,
  getReportVersionSections,
  getReportVersionSectionBySlug,
  resolveDefaultReport,
  resolvePublishedVersion,
} from "@/lib/api/reports";
import type { ApiReport, ApiVersion, ApiSection, FullReportData } from "@/lib/api/types";

export type PublicLanguage = "es" | "en";

async function getSelectedReportIdFromCookie(): Promise<string | null> {
  const cookieStore = cookies();
  return cookieStore.then((store) => store.get("app_base_report_id")?.value || null);
}

async function getSelectedVersionFromCookie(): Promise<string | null> {
  const cookieStore = cookies();
  return cookieStore.then((store) => store.get("app_version")?.value || null);
}

async function getSelectedLanguageFromCookie(): Promise<PublicLanguage> {
  const cookieStore = await cookies();
  const lang =
    cookieStore.get("app_content_lang")?.value ||
    cookieStore.get("app_lang")?.value;
  return lang === "en" ? "en" : "es";
}

export const getPublicReportContext = cache(async (lang?: PublicLanguage) => {
  const resolvedLang = lang ?? (await getSelectedLanguageFromCookie());
  const targetLang = resolvedLang === "en" ? "EN" : "ES";

  // Try to get selected report ID from cookie first
  const selectedReportId = await getSelectedReportIdFromCookie();
  let report: ApiReport | null = null;

  if (selectedReportId) {
    report = await getReportById(selectedReportId).catch(() => null);
  }

  // Fallback to default report if no report ID selected or not found
  if (!report) {
    report = await resolveDefaultReport().catch(() => null);
  }

  if (!report) {
    return {
      report: null,
      version: null,
      language: resolvedLang,
      fullReport: null as FullReportData | null,
    };
  }

  const versionString = await getSelectedVersionFromCookie();
  let version: ApiVersion | null = null;
  let fullReport: FullReportData | null = null;

  const publishedVersions = await getPublishedVersions(report.id).catch(
    () => [],
  );

  if (
    versionString &&
    Array.isArray(publishedVersions) &&
    publishedVersions.length > 0
  ) {
    const cleanSelected = versionString.toLowerCase().replace(/^v/, "");
    // 1. Match both version AND language
    const matchBoth = publishedVersions.find((v) => {
      const cleanV = (v.version || "").toLowerCase().replace(/^v/, "");
      const langV = (v.language || "ES").toUpperCase();
      return cleanV === cleanSelected && langV === targetLang;
    });

    if (matchBoth) {
      version = matchBoth;
    }
  }

  // 2. Match language (find any published version in the requested language)
  if (
    !version &&
    Array.isArray(publishedVersions) &&
    publishedVersions.length > 0
  ) {
    const matchLang = publishedVersions.find((v) => {
      const langV = (v.language || "ES").toUpperCase();
      return langV === targetLang;
    });
    if (matchLang) {
      version = matchLang;
    }
  }

  // 3. Fallback to match version only
  if (
    !version &&
    versionString &&
    Array.isArray(publishedVersions) &&
    publishedVersions.length > 0
  ) {
    const cleanSelected = versionString.toLowerCase().replace(/^v/, "");
    const matchVer = publishedVersions.find((v) => {
      const cleanV = (v.version || "").toLowerCase().replace(/^v/, "");
      return cleanV === cleanSelected;
    });
    if (matchVer) {
      version = matchVer;
    }
  }

  // 4. Default to first published version
  if (!version && Array.isArray(publishedVersions) && publishedVersions.length > 0) {
    version = publishedVersions[0];
  }

  // Fallback if publishedVersions was empty
  if (!version) {
    try {
      version = await getPublishedVersionByLanguage(report.id, targetLang);
    } catch {
      version = await resolvePublishedVersion(report.id, resolvedLang);
    }
  }

  // If we have version, try to get fullReport for optimizations
  if (version) {
    try {
      fullReport = await getFullReport(
        report.id,
        version.version || "",
        targetLang,
      );
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
