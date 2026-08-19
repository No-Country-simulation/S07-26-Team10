import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import {
  getReportById,
  getReportBySlug,
  getReports,
  getPublishedVersions,
  getPublishedVersionByVersion,
  getPublishedVersionByLanguage,
  resolvePublishedVersion,
  resolveDefaultReport,
  getReportVersionSections,
  getReportVersionSectionBySlug,
  getReportVersionSection,
  REPORT_SLUG,
} from "@/lib/api/reports";
import {
  calculateReadingTime,
  mapPublicSection,
  formatSectionsToChapterItems,
} from "./chapters-utils";
export { mapPublicSection, formatSectionsToChapterItems };
import type {
  PublicSection,
  ChapterItem,
  ChapterDetailData,
  SectionNavigation,
} from "./chapters-types";

/**
 * Resolves the active report_version_id from cookies (SSR) or falls back to published versions.
 */
export const resolveActiveReportVersionId = cache(
  async (preferredLang?: "es" | "en"): Promise<string | null> => {
    try {
      const cookieStore = await cookies();
      const selectedBaseReportId = cookieStore.get("app_base_report_id")?.value;
      const selectedVersion = cookieStore.get("app_version")?.value;
      const selectedContentLang =
        preferredLang ||
        (cookieStore.get("app_content_lang")?.value as "es" | "en") ||
        (cookieStore.get("app_lang")?.value as "es" | "en") ||
        "es";
      const targetApiLang = selectedContentLang === "en" ? "EN" : "ES";

      let reportId = selectedBaseReportId;
      if (!reportId) {
        const report = await getReportBySlug(REPORT_SLUG).catch(() => null);
        reportId = report?.id;
        if (!reportId) {
          const defaultReport = await resolveDefaultReport().catch(() => null);
          reportId = defaultReport?.id;
        }
      } else {
        const report = await getReportById(reportId).catch(() => null);
        if (!report) {
          const fallback =
            (await getReportBySlug(REPORT_SLUG).catch(() => null)) ||
            (await resolveDefaultReport().catch(() => null));
          reportId = fallback?.id;
        }
      }

      if (!reportId) return null;

      const publishedVersions = await getPublishedVersions(reportId).catch(
        () => [],
      );

      if (Array.isArray(publishedVersions) && publishedVersions.length > 0) {
        // 1. Try to find an exact match for both version AND language
        if (selectedVersion) {
          const cleanSelected = selectedVersion.toLowerCase().replace(/^v/, "");
          const matchBoth = publishedVersions.find((v) => {
            const cleanV = (v.version || "").toLowerCase().replace(/^v/, "");
            const langV = (v.language || "ES").toUpperCase();
            return cleanV === cleanSelected && langV === targetApiLang;
          });
          if (matchBoth?.id) return matchBoth.id;
        }

        // 2. Try match language (find any published version in the target language)
        const matchLang = publishedVersions.find((v) => {
          const langV = (v.language || "ES").toUpperCase();
          return langV === targetApiLang;
        });
        if (matchLang?.id) return matchLang.id;

        // 3. Try match version only
        if (selectedVersion) {
          const cleanSelected = selectedVersion.toLowerCase().replace(/^v/, "");
          const matchVer = publishedVersions.find((v) => {
            const cleanV = (v.version || "").toLowerCase().replace(/^v/, "");
            return cleanV === cleanSelected;
          });
          if (matchVer?.id) return matchVer.id;
        }

        // 4. Default to first published version
        return publishedVersions[0].id;
      }

      return null;
    } catch (error) {
      if (
        error instanceof Error &&
        ((error as unknown as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE" ||
          error.message.includes("Dynamic server usage"))
      ) {
        throw error;
      }
      console.error("Error resolving active report_version_id:", error);
      return null;
    }
  },
);

import { FALLBACK_SECTIONS } from "./data/fallback";

/**
 * Server-only query to fetch public sections for a report version.
 * Next.js tags: ['sections', `sections-${versionId}`]
 */
export const getPublicSections = cache(
  async (
    reportVersionId?: string,
    preferredLang?: "es" | "en",
  ): Promise<PublicSection[]> => {
    let targetLang: "es" | "en" = preferredLang || "es";
    try {
      const cookieStore = await cookies();
      const cookieLang =
        (cookieStore.get("app_content_lang")?.value as "es" | "en") ||
        (cookieStore.get("app_lang")?.value as "es" | "en");
      targetLang = preferredLang || cookieLang || "es";
    } catch {
      // ignore
    }

    const versionId =
      reportVersionId || (await resolveActiveReportVersionId(targetLang));

    if (versionId) {
      try {
        const data = await getReportVersionSections(versionId);
        if (Array.isArray(data) && data.length > 0) {
          return (data as unknown as Record<string, unknown>[])
            .map(mapPublicSection)
            .sort((a, b) => a.display_order - b.display_order);
        }
      } catch (error) {
        console.error(
          `Error fetching public sections for version ${versionId}:`,
          error,
        );
      }
    }

    // Fallback if no sections in DB
    return FALLBACK_SECTIONS[targetLang] || FALLBACK_SECTIONS.es;
  },
);

/**
 * Helper to fetch a section directly by versionId and slug or ID.
 */
async function fetchSectionByVersionAndSlug(
  versionId: string,
  slugOrId: string,
): Promise<PublicSection | null> {
  // 1. Try by slug
  try {
    const data = await getReportVersionSectionBySlug(versionId, slugOrId);
    if (data) {
      return mapPublicSection(data as unknown as Record<string, unknown>);
    }
  } catch {
    // ignore
  }

  // 2. Try by section ID
  try {
    const dataById = await getReportVersionSection(versionId, slugOrId);
    if (dataById) {
      return mapPublicSection(dataById as unknown as Record<string, unknown>);
    }
  } catch {
    // ignore
  }

  // 3. Try matching across all sections of this version
  try {
    const allSecs = await getReportVersionSections(versionId);
    if (Array.isArray(allSecs)) {
      const match = allSecs.find(
        (s) =>
          s.slug?.toLowerCase() === slugOrId.toLowerCase() ||
          s.id?.toLowerCase() === slugOrId.toLowerCase(),
      );
      if (match) {
        return mapPublicSection(match as unknown as Record<string, unknown>);
      }
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Server-only query to fetch a specific section by its exact slug.
 * 1. Tries the active version first.
 * 2. If not found in primary versionId, searches across other published report versions.
 * 3. If still not found, searches in fallback sections.
 */
export const getPublicSectionBySlug = cache(
  async (
    slug: string,
    reportVersionId?: string,
  ): Promise<PublicSection | null> => {
    if (!slug) return null;

    const rawSlug = decodeURIComponent(slug).trim();

    // 1. Try with the provided or active versionId
    const versionId = reportVersionId || (await resolveActiveReportVersionId());
    if (versionId) {
      const section = await fetchSectionByVersionAndSlug(versionId, rawSlug);
      if (section) return section;
    }

    // 2. If not found in primary versionId, search across other published report versions
    try {
      const reports = await getReports().catch(() => []);
      for (const rep of reports) {
        const publishedVersions = await getPublishedVersions(rep.id).catch(
          () => [],
        );
        for (const pubVer of publishedVersions) {
          if (pubVer.id !== versionId) {
            const sec = await fetchSectionByVersionAndSlug(
              pubVer.id,
              rawSlug,
            );
            if (sec) return sec;
          }
        }
      }
    } catch (error) {
      if (
        error instanceof Error &&
        ((error as unknown as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE" ||
          error.message.includes("Dynamic server usage"))
      ) {
        throw error;
      }
      console.error(
        `Error in fallback version search for section '${rawSlug}':`,
        error,
      );
    }

    // 3. Fallback search across static fallback sections
    const fallbackEs = FALLBACK_SECTIONS.es.find(
      (s) => s.slug === rawSlug || s.slug.toLowerCase() === rawSlug.toLowerCase(),
    );
    if (fallbackEs) return fallbackEs;

    const fallbackEn = FALLBACK_SECTIONS.en.find(
      (s) => s.slug === rawSlug || s.slug.toLowerCase() === rawSlug.toLowerCase(),
    );
    if (fallbackEn) return fallbackEn;

    return null;
  },
);



/**
 * Server query to fetch a chapter's full detail, including prev/next navigation.
 */
export const getChapterDetail = cache(
  async (
    slug: string,
    reportVersionId?: string,
  ): Promise<ChapterDetailData | null> => {
    const section = await getPublicSectionBySlug(slug, reportVersionId);
    if (!section) return null;

    // Use the actual report_version_id of the found section to get sibling navigation
    const targetVersionId =
      section.report_version_id ||
      reportVersionId ||
      (await resolveActiveReportVersionId());
    const allSections = targetVersionId
      ? await getPublicSections(targetVersionId)
      : [section];

    const currentIndex = allSections.findIndex(
      (s) => s.slug === section.slug || s.id === section.id,
    );
    const navigation: SectionNavigation = {};

    if (currentIndex > 0) {
      const prevSec = allSections[currentIndex - 1];
      navigation.prev = {
        slug: prevSec.slug,
        title: prevSec.title,
        num: String(prevSec.display_order || currentIndex).padStart(2, "0"),
      };
    }

    if (currentIndex >= 0 && currentIndex < allSections.length - 1) {
      const nextSec = allSections[currentIndex + 1];
      navigation.next = {
        slug: nextSec.slug,
        title: nextSec.title,
        num: String(nextSec.display_order || currentIndex + 2).padStart(2, "0"),
      };
    }

    return {
      section,
      navigation,
      allSections,
    };
  },
);
