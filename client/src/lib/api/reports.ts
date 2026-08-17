import { apiGet } from "@/lib/api/http";
import type {
  ApiReport,
  ApiVersion,
  ApiCategory,
  ApiConcept,
  ApiReference,
  ApiSection,
  ApiResource,
  FullReportData,
} from "@/lib/api/types";

export const REPORT_SLUG = "stranded-capacity-ai-infrastructure";

export type SiteLanguage = "es" | "en";

/** Map a site language ("es" | "en") to the API language code ("ES" | "EN"). */
export function toApiLanguage(lang: SiteLanguage): "ES" | "EN" {
  return lang === "en" ? "EN" : "ES";
}

/** GET /reports/by-slug/{slug} */
export async function getReportBySlug(
  slug: string = REPORT_SLUG,
): Promise<ApiReport> {
  return apiGet<ApiReport>(`/reports/by-slug/${slug}`);
}

/** GET /reports/{reportId} */
export async function getReportById(reportId: string): Promise<ApiReport> {
  return apiGet<ApiReport>(`/reports/${reportId}`);
}

/** GET /reports */
export async function getReports(): Promise<ApiReport[]> {
  return apiGet<ApiReport[]>(`/reports`);
}

/** GET /reports/{reportId}/versions */
export async function getReportVersions(reportId: string): Promise<ApiVersion[]> {
  return apiGet<ApiVersion[]>(`/reports/${reportId}/versions`);
}

/** GET /reports/{reportId}/versions/published */
export async function getPublishedVersions(reportId: string): Promise<ApiVersion[]> {
  return apiGet<ApiVersion[]>(`/reports/${reportId}/versions/published`);
}

/** GET /reports/{reportId}/versions/by-language/{language} */
export async function getPublishedVersionByLanguage(
  reportId: string,
  language: "ES" | "EN",
): Promise<ApiVersion> {
  return apiGet<ApiVersion>(`/reports/${reportId}/versions/by-language/${language}?status=PUBLISHED`);
}

/** GET /reports/{reportId}/versions/by-version/{version} */
export async function getPublishedVersionByVersion(
  reportId: string,
  version: string,
): Promise<ApiVersion> {
  return apiGet<ApiVersion>(`/reports/${reportId}/versions/by-version/${version}`);
}

/** GET /reports/{reportId}/versions/full/{version}/{language} */
export async function getFullReport(
  reportId: string,
  version: string,
  language: "ES" | "EN",
): Promise<FullReportData> {
  return apiGet<FullReportData>(`/reports/${reportId}/versions/full/${version}/${language}`);
}

/** GET /reports/{reportId}/versions/{versionId} */
export async function getReportVersion(reportId: string, versionId: string): Promise<ApiVersion> {
  return apiGet<ApiVersion>(`/reports/${reportId}/versions/${versionId}`);
}

/**
 * Resolve the id of the published version matching the site language.
 * Falls back to the first published version when no language match exists.
 */
export async function resolvePublishedVersion(
  reportId: string,
  lang: SiteLanguage = "es",
): Promise<ApiVersion | null> {
  const versions = await getPublishedVersions(reportId);
  if (!Array.isArray(versions) || versions.length === 0) return null;
  const targetLang = toApiLanguage(lang);
  return (
    versions.find((v) => v.language?.toUpperCase() === targetLang) ??
    versions[0]
  );
}

// Categories
/** GET /report-versions/{versionId}/categories */
export async function getReportVersionCategories(versionId: string): Promise<ApiCategory[]> {
  return apiGet<ApiCategory[]>(`/report-versions/${versionId}/categories`);
}

/** GET /report-versions/{versionId}/categories/{categoryId} */
export async function getReportVersionCategory(versionId: string, categoryId: string): Promise<ApiCategory> {
  return apiGet<ApiCategory>(`/report-versions/${versionId}/categories/${categoryId}`);
}

// Concepts
/** GET /categories/{categoryId}/concepts */
export async function getCategoryConcepts(categoryId: string): Promise<ApiConcept[]> {
  return apiGet<ApiConcept[]>(`/categories/${categoryId}/concepts`);
}

/** GET /categories/{categoryId}/concepts/{conceptId} */
export async function getCategoryConcept(categoryId: string, conceptId: string): Promise<ApiConcept> {
  return apiGet<ApiConcept>(`/categories/${categoryId}/concepts/${conceptId}`);
}

// References
/** GET /report-versions/{versionId}/references */
export async function getReportVersionReferences(versionId: string): Promise<ApiReference[]> {
  return apiGet<ApiReference[]>(`/report-versions/${versionId}/references`);
}

/** GET /report-versions/{versionId}/references/{referenceId} */
export async function getReportVersionReference(versionId: string, referenceId: string): Promise<ApiReference> {
  return apiGet<ApiReference>(`/report-versions/${versionId}/references/${referenceId}`);
}

// Sections
/** GET /report-versions/{versionId}/sections */
export async function getReportVersionSections(versionId: string): Promise<ApiSection[]> {
  return apiGet<ApiSection[]>(`/report-versions/${versionId}/sections`);
}

/** GET /report-versions/{versionId}/sections/by-slug/{slug} */
export async function getReportVersionSectionBySlug(versionId: string, slug: string): Promise<ApiSection> {
  return apiGet<ApiSection>(`/report-versions/${versionId}/sections/by-slug/${slug}`);
}

/** GET /report-versions/{versionId}/sections/{sectionId} */
export async function getReportVersionSection(versionId: string, sectionId: string): Promise<ApiSection> {
  return apiGet<ApiSection>(`/report-versions/${versionId}/sections/${sectionId}`);
}

/** GET /report-versions/{versionId}/sections/{sectionId}/navigation */
export async function getReportVersionSectionNavigation(versionId: string, sectionId: string): Promise<ApiSection & { prev?: ApiSection; next?: ApiSection }> {
  return apiGet<ApiSection & { prev?: ApiSection; next?: ApiSection }>(`/report-versions/${versionId}/sections/${sectionId}/navigation`);
}

// Resources
/** GET /sections/{sectionId}/resources */
export async function getSectionResources(sectionId: string): Promise<ApiResource[]> {
  return apiGet<ApiResource[]>(`/sections/${sectionId}/resources`);
}

/** GET /sections/{sectionId}/resources/{resourceId} */
export async function getSectionResource(sectionId: string, resourceId: string): Promise<ApiResource> {
  return apiGet<ApiResource>(`/sections/${sectionId}/resources/${resourceId}`);
}