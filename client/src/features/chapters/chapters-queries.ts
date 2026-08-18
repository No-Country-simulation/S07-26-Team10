import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";
import {
  getReportById,
  getReportBySlug,
  getPublishedVersions,
  getPublishedVersionByVersion,
  getPublishedVersionByLanguage,
  resolvePublishedVersion,
  REPORT_SLUG,
} from "@/lib/api/reports";
import { calculateReadingTime } from "./chapters-utils";
import type {
  PublicSection,
  ChapterItem,
  ChapterDetailData,
  SectionNavigation,
} from "./chapters-types";

/**
 * Maps a raw backend section to a PublicSection.
 */
export function mapPublicSection(raw: Record<string, unknown>): PublicSection {
  return {
    id: String(raw.id || ""),
    report_version_id: String(raw.report_version_id || raw.report_id || ""),
    title: String(raw.title || ""),
    slug: String(raw.slug || ""),
    content: String(raw.content || ""),
    display_order:
      typeof raw.display_order === "number" ? raw.display_order : 1,
  };
}

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
        (cookieStore.get("app_content_lang")?.value as "es" | "en") ||
        preferredLang ||
        "es";
      const targetApiLang = selectedContentLang === "en" ? "EN" : "ES";

      let reportId = selectedBaseReportId;
      if (!reportId) {
        const report = await getReportBySlug(REPORT_SLUG).catch(() => null);
        reportId = report?.id;
      } else {
        const report = await getReportById(reportId).catch(() => null);
        if (!report) {
          const defaultReport = await getReportBySlug(REPORT_SLUG).catch(
            () => null,
          );
          reportId = defaultReport?.id;
        }
      }

      if (!reportId) return null;

      if (selectedVersion) {
        try {
          const versionObj = await getPublishedVersionByVersion(
            reportId,
            selectedVersion,
          );
          if (versionObj?.id) return versionObj.id;
        } catch {
          // fallback to language query
        }
      }

      try {
        const versionObj = await getPublishedVersionByLanguage(
          reportId,
          targetApiLang,
        );
        if (versionObj?.id) return versionObj.id;
      } catch {
        // fallback to resolvePublishedVersion
      }

      const fallbackVersion = await resolvePublishedVersion(
        reportId,
        selectedContentLang,
      );
      return fallbackVersion?.id || null;
    } catch (error) {
      console.error("Error resolving active report_version_id:", error);
      return null;
    }
  },
);

/**
 * Server-only query to fetch public sections for a report version.
 * Next.js tags: ['sections', `sections-${versionId}`]
 */
export const getPublicSections = cache(
  async (reportVersionId?: string): Promise<PublicSection[]> => {
    const versionId = reportVersionId || (await resolveActiveReportVersionId());
    if (!versionId) return [];

    try {
      const res = await fetch(
        getApiUrl(`/report-versions/${versionId}/sections`),
        {
          headers: { "Content-Type": "application/json" },
          next: {
            revalidate: 3600,
            tags: ["sections", `sections-${versionId}`],
          },
        },
      );

      if (res.ok) {
        const data = (await res.json()) as Record<string, unknown>[];
        if (Array.isArray(data)) {
          return data
            .map(mapPublicSection)
            .sort((a, b) => a.display_order - b.display_order);
        }
      }
    } catch (error) {
      console.error(
        `Error fetching public sections for version ${versionId}:`,
        error,
      );
    }

    return [];
  },
);

/**
 * Helper to fetch a section directly by versionId and slug.
 */
async function fetchSectionByVersionAndSlug(
  versionId: string,
  slug: string,
): Promise<PublicSection | null> {
  try {
    const res = await fetch(
      getApiUrl(`/report-versions/${versionId}/sections/by-slug/${slug}`),
      {
        headers: { "Content-Type": "application/json" },
        next: {
          revalidate: 3600,
          tags: [
            "sections",
            `sections-${versionId}`,
            `section-${versionId}-${slug}`,
          ],
        },
      },
    );

    if (res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
      return mapPublicSection(data);
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
      const cookieStore = await cookies();
      const selectedBaseReportId = cookieStore.get("app_base_report_id")?.value;
      let reportId = selectedBaseReportId;
      if (!reportId) {
        const report = await getReportBySlug(REPORT_SLUG).catch(() => null);
        reportId = report?.id;
      }

      if (reportId) {
        const publishedVersions = await getPublishedVersions(reportId).catch(
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
      console.error(
        `Error in fallback version search for section '${rawSlug}':`,
        error,
      );
    }

    return null;
  },
);

/**
 * Formats a list of PublicSection into ChapterItem format for UI listing.
 */
export function formatSectionsToChapterItems(
  sections: PublicSection[],
): ChapterItem[] {
  return sections.map((sec, idx) => {
    const num = String(sec.display_order || idx + 1).padStart(2, "0");
    return {
      id: sec.id,
      num,
      displayOrder: sec.display_order || idx + 1,
      title: sec.title,
      slug: sec.slug,
      time: calculateReadingTime(sec.content),
      href: `/chapter/${sec.slug}`,
      content: sec.content,
      reportVersionId: sec.report_version_id,
    };
  });
}

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
