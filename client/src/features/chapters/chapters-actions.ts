"use server";

import {
  getPublicSections,
  getPublicSectionBySlug,
  getChapterDetail,
  formatSectionsToChapterItems,
} from "./chapters-queries";
import type {
  PublicSection,
  ChapterItem,
  ChapterDetailData,
} from "./chapters-types";

/**
 * Server Action: GET /api/v1/report-versions/{report_version_id}/sections
 * Listar secciones públicas de una versión de reporte.
 */
export async function getPublicSectionsAction(
  reportVersionId?: string,
  lang?: "es" | "en",
): Promise<PublicSection[]> {
  try {
    return await getPublicSections(reportVersionId, lang);
  } catch (error) {
    console.error("Error in getPublicSectionsAction:", error);
    return [];
  }
}

/**
 * Server Action: Retorna las secciones públicas convertidas en ChapterItem list para la UI.
 */
export async function getPublicChapterItemsAction(
  reportVersionId?: string,
  lang?: "es" | "en",
): Promise<ChapterItem[]> {
  try {
    const sections = await getPublicSections(reportVersionId, lang);
    return formatSectionsToChapterItems(sections);
  } catch (error) {
    console.error("Error in getPublicChapterItemsAction:", error);
    return [];
  }
}

/**
 * Server Action: GET /api/v1/report-versions/{report_version_id}/sections/by-slug/{slug}
 * Obtiene una sección específica por su slug.
 */
export async function getPublicSectionBySlugAction(
  slug: string,
  reportVersionId?: string,
): Promise<PublicSection | null> {
  try {
    return await getPublicSectionBySlug(slug, reportVersionId);
  } catch (error) {
    console.error(
      `Error in getPublicSectionBySlugAction for slug '${slug}':`,
      error,
    );
    return null;
  }
}

/**
 * Server Action: Obtiene el detalle completo del capítulo con navegación previa y siguiente.
 */
export async function getChapterDetailAction(
  slug: string,
  reportVersionId?: string,
): Promise<ChapterDetailData | null> {
  try {
    return await getChapterDetail(slug, reportVersionId);
  } catch (error) {
    console.error(`Error in getChapterDetailAction for slug '${slug}':`, error);
    return null;
  }
}
