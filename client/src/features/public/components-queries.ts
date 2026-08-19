import "server-only";

import { cache } from "react";
import {
  getPublicReportContext,
} from "@/features/public/report/queries/report";
import {
  getReportVersionCategories,
  getCategoryConcepts,
  getReportVersionReferences,
  getReportVersionSections,
} from "@/lib/api/reports";
import type { ApiCategory, ApiConcept, ApiReference, ApiSection } from "@/lib/api/types";

/**
 * Componentes Public Queries
 * Lógica centralizada para obtener datos de los endpoints reales del backend.
 *
 * Flujo real (usando src/lib/api/):
 *   /reports/by-slug/{slug} → report
 *   /reports/{report_id}/versions/by-language/{lang} → version (optimizado)
 *   /reports/{report_id}/versions/full/{version}/{language} → todo junto (1 call)
 *   /report-versions/{version_id}/sections|categories|references
 *   /categories/{category_id}/concepts
 */

export type PublicLanguage = "es" | "en";

interface ResolvedContext {
  reportId: string;
  versionId: string;
  language: PublicLanguage;
  fullReport?: {
    sections: ApiSection[];
    categories: (ApiCategory & { concepts: ApiConcept[] })[];
    references: ApiReference[];
  };
}

/**
 * Resuelve reportId + versionId usando la versión seleccionada
 * por el usuario (desde cookies) o la versión publicada más completa del idioma.
 * Retorna también fullReport si está disponible (1 call optimization).
 */
export const resolveReportContext = cache(async (
  lang?: PublicLanguage,
): Promise<ResolvedContext | null> => {
  try {
    const context = await getPublicReportContext(lang);
    if (!context.report || !context.version) return null;

    return {
      reportId: context.report.id,
      versionId: context.version.id,
      language: context.language,
      fullReport: context.fullReport || undefined,
    };
  } catch (error) {
    console.error("Error resolving report context:", error);
    return null;
  }
});

// ============================================
// TAXONOMY FILTER DATA
// ============================================

export interface TaxonomyCategory {
  id: string;
  name: string;
  description?: string;
  conceptCount?: number;
  slug?: string;
  concepts?: Array<{
    id: string;
    category_id: string;
    name: string;
    description: string | null;
    display_order: number;
  }>;
}

/**
 * Obtiene todas las categorías de taxonomía con conteo de conceptos
 * desde /report-versions/{version_id}/categories
 * Usa fullReport si está disponible (1 call), sino endpoint individual.
 */
export const getTaxonomyCategories = cache(async (
  language?: "ES" | "EN"
): Promise<TaxonomyCategory[]> => {
  const ctx = await resolveReportContext(
    language ? (language === "EN" ? "en" : "es") : undefined,
  );
  if (!ctx) return [];

  // Use fullReport if available (from getFullReport optimization)
  if (ctx.fullReport?.categories) {
    return ctx.fullReport.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description || "",
      conceptCount: cat.concepts?.length || 0,
      slug: cat.name.toLowerCase().replace(/\s+/g, "-"),
    }));
  }

  // Fallback to individual endpoint
  try {
    const data = await getReportVersionCategories(ctx.versionId);

    if (!Array.isArray(data)) return [];

    return data.map((cat) => ({
      id: cat.id,
      name: cat.name || "Sin nombre",
      description: cat.description || "",
      conceptCount: 0, // Will be populated by getTaxonomyConcepts if needed
      slug: cat.name.toLowerCase().replace(/\s+/g, "-"),
    }));
  } catch (error) {
    console.error("Error fetching taxonomy categories:", error);
    return [];
  }
});

/**
 * Obtiene conceptos de una categoría específica
 * desde /categories/{category_id}/concepts
 * Usa fullReport si está disponible, sino endpoint individual.
 */
export const getTaxonomyConcepts = cache(async (
  categoryId: string,
  language?: "ES" | "EN"
): Promise<ApiConcept[]> => {
  const ctx = await resolveReportContext(
    language ? (language === "EN" ? "en" : "es") : undefined,
  );
  if (!ctx) return [];

  // Use fullReport if available
  if (ctx.fullReport?.categories) {
    const category = ctx.fullReport.categories.find((c) => c.id === categoryId);
    if (category?.concepts) {
      return category.concepts;
    }
  }

  // Fallback to individual endpoint
  try {
    return await getCategoryConcepts(categoryId);
  } catch (error) {
    console.error(`Error fetching concepts for category ${categoryId}:`, error);
    return [];
  }
});

// ============================================
// TAXONOMY WITH CONCEPTS (optimized single call via fullReport)
// ============================================

/**
 * Obtiene taxonomía completa (categorías + conceptos) en una sola operación.
 * Prefiere fullReport (1 call), sino hace fetches paralelos.
 */
export const getFullTaxonomy = cache(async (
  language?: "ES" | "EN"
): Promise<TaxonomyCategory[]> => {
  const ctx = await resolveReportContext(
    language ? (language === "EN" ? "en" : "es") : undefined,
  );
  if (!ctx) return [];

  // Use fullReport if available (1 call optimization)
  if (ctx.fullReport?.categories) {
    return ctx.fullReport.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description || "",
      conceptCount: cat.concepts?.length || 0,
      slug: cat.name.toLowerCase().replace(/\s+/g, "-"),
      concepts: cat.concepts || [],
    }));
  }

  // Fallback: parallel fetch categories + concepts
  try {
    const categories = await getReportVersionCategories(ctx.versionId);
    if (!Array.isArray(categories) || !categories.length) return [];

    const categoriesWithConcepts = await Promise.all(
      categories.map(async (cat) => {
        const concepts = await getCategoryConcepts(cat.id).catch(() => []);
        return {
          id: cat.id,
          name: cat.name,
          description: cat.description || "",
          conceptCount: concepts.length,
          slug: cat.name.toLowerCase().replace(/\s+/g, "-"),
          concepts,
        };
      })
    );

    return categoriesWithConcepts;
  } catch (error) {
    console.error("Error fetching full taxonomy:", error);
    return [];
  }
});

// ============================================
// STATUS CARD DATA (Métricas derivadas)
// ============================================

export interface MetricData {
  id: string;
  title: string;
  value: number | string;
  description?: string;
  status: "success" | "warning" | "error" | "info";
  metadata?: { label: string; value: string }[];
  unit?: string;
}

/**
 * Deriva métricas desde fullReport (1 call) o endpoints individuales.
 */
export const getReportMetrics = cache(async (
  reportId: string,
  versionId?: string
): Promise<MetricData[]> => {
  const ctx = versionId
    ? { reportId, versionId, language: "es" as PublicLanguage, fullReport: undefined as ResolvedContext["fullReport"] }
    : await resolveReportContext();

  if (!ctx) return [];

  // Use fullReport if available
  if (ctx.fullReport) {
    const sectionsCount = ctx.fullReport.sections?.length || 0;
    const categoriesCount = ctx.fullReport.categories?.length || 0;
    const conceptsCount = ctx.fullReport.categories?.reduce(
      (acc, cat) => acc + (cat.concepts?.length || 0), 0) || 0;
    const referencesCount = ctx.fullReport.references?.length || 0;

    return [
      { id: "sections", title: "Secciones", value: sectionsCount, status: "info" },
      { id: "categories", title: "Categorías", value: categoriesCount, status: "info" },
      { id: "concepts", title: "Conceptos", value: conceptsCount, status: "success" },
      { id: "references", title: "Referencias", value: referencesCount, status: "success" },
    ];
  }

  // Fallback to individual endpoints
  try {
    const [sections, categories, references] = await Promise.all([
      getReportVersionSections(ctx.versionId).catch(() => []),
      getReportVersionCategories(ctx.versionId).catch(() => []),
      getReportVersionReferences(ctx.versionId).catch(() => []),
    ]);

    // Fetch concepts count separately since ApiCategory doesn't include concepts
    let conceptsCount = 0;
    try {
      const conceptsPromises = categories.map((cat) => getCategoryConcepts(cat.id).catch(() => []));
      const conceptsResults = await Promise.all(conceptsPromises);
      conceptsCount = conceptsResults.reduce((acc, concepts) => acc + concepts.length, 0);
    } catch {
      conceptsCount = 0;
    }

    return [
      { id: "sections", title: "Secciones", value: sections.length, status: "info" },
      { id: "categories", title: "Categorías", value: categories.length, status: "info" },
      { id: "concepts", title: "Conceptos", value: conceptsCount, status: "success" },
      { id: "references", title: "Referencias", value: references.length, status: "success" },
    ];
  } catch (error) {
    console.error(`Error deriving metrics for report ${reportId}:`, error);
    return [];
  }
});

// ============================================
// EVIDENCE/REFERENCES DATA
// ============================================

export interface EvidenceReference {
  id: string;
  label: string;
  title?: string;
  authors?: string;
  year?: number;
  url?: string;
  doi?: string;
  citationText?: string;
  color?: string;
}

/**
 * Obtiene referencias de evidencia para un reporte
 * Usa fullReport si está disponible, sino endpoint individual.
 */
export const getReportEvidence = cache(async (
  reportId: string,
  versionId?: string
): Promise<EvidenceReference[]> => {
  const ctx = versionId
    ? { reportId, versionId, language: "es" as PublicLanguage, fullReport: undefined as ResolvedContext["fullReport"] }
    : await resolveReportContext();

  if (!ctx) return [];

  // Use fullReport if available
  if (ctx.fullReport?.references) {
    return ctx.fullReport.references.map((ref, idx) => ({
      id: ref.id || `ref-${idx}`,
      label: `[${idx + 1}]`,
      title: ref.title ?? undefined,
      authors: ref.authors ?? undefined,
      year: ref.year ?? undefined,
      url: ref.citation_url ?? undefined,
      citationText:
        [ref.authors, ref.title, ref.year].filter(Boolean).join(", "),
      color: "var(--color-green)",
    }));
  }

  // Fallback to individual endpoint
  try {
    const data = await getReportVersionReferences(ctx.versionId);

    if (!Array.isArray(data)) return [];

    return data.map((ref, idx) => ({
      id: ref.id || `ref-${idx}`,
      label: `[${idx + 1}]`,
      title: ref.title ?? undefined,
      authors: ref.authors ?? undefined,
      year: ref.year ?? undefined,
      url: ref.citation_url ?? undefined,
      citationText:
        [ref.authors, ref.title, ref.year].filter(Boolean).join(", "),
      color: "var(--color-green)",
    }));
  } catch (error) {
    console.error(`Error fetching evidence for report ${reportId}:`, error);
    return [];
  }
});

// ============================================
// CHAPTER/SECTION DATA
// ============================================

export interface ChapterSection {
  id: string;
  number: string;
  title: string;
  slug?: string;
  description?: string;
  order?: number;
}

/**
 * Obtiene todas las secciones/capítulos de un reporte
 * Usa fullReport si está disponible, sino endpoint individual.
 */
export const getReportSections = cache(async (
  reportId: string,
  versionId?: string
): Promise<ChapterSection[]> => {
  const ctx = versionId
    ? { reportId, versionId, language: "es" as PublicLanguage, fullReport: undefined as ResolvedContext["fullReport"] }
    : await resolveReportContext();

  if (!ctx) return [];

  // Use fullReport if available
  if (ctx.fullReport?.sections) {
    return ctx.fullReport.sections.map((section, idx) => ({
      id: section.id,
      number: section.display_order?.toString() || String(idx + 1).padStart(2, "0"),
      title: section.title,
      slug: section.slug,
      description: section.content?.slice(0, 160),
      order: section.display_order || idx + 1,
    }));
  }

  // Fallback to individual endpoint
  try {
    const data = await getReportVersionSections(ctx.versionId);

    if (!Array.isArray(data)) return [];

    return data.map((section, idx) => ({
      id: section.id,
      number: section.display_order?.toString() || String(idx + 1).padStart(2, "0"),
      title: section.title,
      slug: section.slug,
      description: section.content?.slice(0, 160),
      order: section.display_order || idx + 1,
    }));
  } catch (error) {
    console.error(`Error fetching sections for report ${reportId}:`, error);
    return [];
  }
});

// ============================================
// STATISTICS (derivadas de datos reales)
// ============================================

export interface ReportStatistics {
  totalSections?: number;
  totalEvidence?: number;
  totalCategories?: number;
  lastUpdated?: string;
  dataQuality?: number;
  completeness?: number;
}

/**
 * Deriva estadísticas desde fullReport o endpoints individuales.
 */
export const getReportStatistics = cache(async (
  reportId: string,
  versionId?: string
): Promise<ReportStatistics> => {
  const ctx = versionId
    ? { reportId, versionId, language: "es" as PublicLanguage, fullReport: undefined as ResolvedContext["fullReport"] }
    : await resolveReportContext();

  if (!ctx) return {};

  // Use fullReport if available
  if (ctx.fullReport) {
    const concepts = ctx.fullReport.categories?.reduce(
      (acc, cat) => acc + (cat.concepts?.length || 0), 0) || 0;

    return {
      totalSections: ctx.fullReport.sections?.length || 0,
      totalEvidence: ctx.fullReport.references?.length || 0,
      totalCategories: ctx.fullReport.categories?.length || 0,
      dataQuality: concepts > 0 ? Math.round((concepts / 12) * 100) : undefined,
      completeness: concepts > 0 ? Math.min(100, Math.round((concepts / 12) * 100)) : undefined,
    };
  }

  // Fallback to individual endpoints
  try {
    const [sections, references, categories] = await Promise.all([
      getReportVersionSections(ctx.versionId).catch(() => []),
      getReportVersionReferences(ctx.versionId).catch(() => []),
      getReportVersionCategories(ctx.versionId).catch(() => []),
    ]);

    // Fetch concepts count separately since ApiCategory doesn't include concepts
    let concepts = 0;
    try {
      const conceptsPromises = categories.map((cat) => getCategoryConcepts(cat.id).catch(() => []));
      const conceptsResults = await Promise.all(conceptsPromises);
      concepts = conceptsResults.reduce((acc, catConcepts) => acc + catConcepts.length, 0);
    } catch {
      concepts = 0;
    }

    return {
      totalSections: sections.length,
      totalEvidence: references.length,
      totalCategories: categories.length,
      dataQuality: concepts > 0 ? Math.round((concepts / 12) * 100) : undefined,
      completeness: concepts > 0 ? Math.min(100, Math.round((concepts / 12) * 100)) : undefined,
    };
  } catch (error) {
    console.error(`Error fetching statistics for report ${reportId}:`, error);
    return {};
  }
});

// ============================================
// FILTER DATA (categorías como filtros)
// ============================================

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  description?: string;
}

/**
 * Obtiene opciones de filtro disponibles desde categories.
 */
export const getFilterOptions = cache(async (
  filterType: "category" | "status" | "type" | "year" | "region" | string,
): Promise<FilterOption[]> => {
  if (filterType !== "category") return [];

  const ctx = await resolveReportContext();
  if (!ctx) return [];

  try {
    // Use fullReport if available
    if (ctx.fullReport?.categories) {
      return ctx.fullReport.categories.map((option) => ({
        id: option.id,
        label: option.name,
        count: option.concepts?.length || 0,
        description: option.description ?? undefined,
      }));
    }

    // Fallback to individual endpoint
    const data = await getReportVersionCategories(ctx.versionId);

    if (!Array.isArray(data)) return [];

    return data.map((option) => ({
      id: option.id,
      label: option.name,
      count: 0, // concepts not fetched here
      description: option.description ?? undefined,
    }));
  } catch (error) {
    console.error(`Error fetching filter options for ${filterType}:`, error);
    return [];
  }
});

// ============================================
// SEARCH RESULTS (búsqueda local sobre datos reales)
// ============================================

export interface SearchResult {
  id: string;
  type: "section" | "evidence" | "concept" | "category";
  title: string;
  description?: string;
  url: string;
  relevance?: number;
}

/**
 * Búsqueda local sobre secciones, categorías y conceptos.
 * Usa fullReport si está disponible.
 */
export const searchReportContent = cache(async (
  reportId: string,
  query: string,
  limit = 10
): Promise<SearchResult[]> => {
  const ctx = await resolveReportContext();
  if (!ctx || !query.trim()) return [];

  const q = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  // Use fullReport if available
  if (ctx.fullReport?.sections) {
    for (const section of ctx.fullReport.sections) {
      const haystack = `${section.title || ""} ${section.content || ""}`.toLowerCase();
      if (haystack.includes(q)) {
        results.push({
          id: section.id,
          type: "section",
          title: section.title,
          description: section.content?.slice(0, 200),
          url: `/report/${section.slug || section.id}`,
          relevance: 0.8,
        });
      }
    }
    return results.slice(0, limit);
  }

  // Fallback to individual endpoint
  try {
    const sections = await getReportVersionSections(ctx.versionId);

    (Array.isArray(sections) ? sections : []).forEach((section) => {
      const haystack = `${section.title || ""} ${section.content || ""}`.toLowerCase();
      if (haystack.includes(q)) {
        results.push({
          id: section.id,
          type: "section",
          title: section.title || "Sin título",
          description: section.content?.slice(0, 200),
          url: `/report/${section.slug || section.id}`,
          relevance: 0.8,
        });
      }
    });
  } catch {
    // ignore
  }

  return results.slice(0, limit);
});



// ============================================
// BATCH QUERIES (para performance)
// ============================================

/**
 * Obtiene múltiples datos en una sola operación.
 * Prefiere fullReport (1 call), sino fetches paralelos.
 */
export const getReportData = cache(async (
  reportId: string,
  versionId?: string
): Promise<{
  sections: ChapterSection[];
  metrics: MetricData[];
  evidence: EvidenceReference[];
  statistics: ReportStatistics;
}> => {
  const ctx = versionId
    ? { reportId, versionId, language: "es" as PublicLanguage, fullReport: undefined as ResolvedContext["fullReport"] }
    : await resolveReportContext();

  if (!ctx) {
    return { sections: [], metrics: [], evidence: [], statistics: {} };
  }

  try {
    const [sections, metrics, evidence, statistics] = await Promise.all([
      getReportSections(ctx.reportId, ctx.versionId),
      getReportMetrics(ctx.reportId, ctx.versionId),
      getReportEvidence(ctx.reportId, ctx.versionId),
      getReportStatistics(ctx.reportId, ctx.versionId),
    ]);

    return { sections, metrics, evidence, statistics };
  } catch (error) {
    console.error(`Error fetching report data for ${reportId}:`, error);
    return { sections: [], metrics: [], evidence: [], statistics: {} };
  }
});