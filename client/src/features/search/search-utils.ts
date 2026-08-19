import type { SearchResultItem, SearchResultType } from "./search-types";

/**
 * Mapeo de slugs conocidos por título o identificador para navegación amigable.
 */
const KNOWN_TITLE_SLUG_MAP: Record<string, string> = {
  "resumen ejecutivo": "resumen-ejecutivo",
  "executive summary": "executive-summary",
  "definición del problema": "definicion-problema",
  "definition of the problem": "definicion-problema",
  "modelo operativo del data center": "modelo-operativo",
  "data center operating model": "modelo-operativo",
  "taxonomía propuesta": "taxonomia",
  "proposed taxonomy": "taxonomia",
  facility: "facility",
  it: "it",
  workload: "workload",
  "impacto económico": "impacto-economico",
  "economic impact": "impacto-economico",
  metodología: "metodologia",
  methodology: "metodologia",
  referencias: "referencias",
  references: "referencias",
};

/**
 * Resuelve la URL de destino adecuada en la aplicación cliente a partir de un resultado de búsqueda.
 */
export function resolveSearchResultHref(item: SearchResultItem): string {
  const type = (item.type || "").toLowerCase();
  const normalizedTitle = (item.title || "").toLowerCase().trim();
  const knownSlug = KNOWN_TITLE_SLUG_MAP[normalizedTitle];

  switch (type) {
    case "section": {
      if (knownSlug) {
        if (knownSlug === "taxonomia") return "/report/taxonomy";
        if (knownSlug === "referencias") return "/report/references";
        if (knownSlug === "metodologia") return "/methodology";
        return `/chapter/${knownSlug}`;
      }

      if (item.id) {
        return `/chapter/${item.id}`;
      }

      return "/report";
    }

    case "category":
    case "concept": {
      const anchor = item.id ? `#${item.id}` : "";
      return `/report/taxonomy${anchor}`;
    }

    case "reference": {
      const anchor = item.id ? `#${item.id}` : "";
      return `/report/references${anchor}`;
    }

    case "resource": {
      if (item.location?.section) {
        return `/chapter/${item.location.section}`;
      }
      return "/report";
    }

    case "report_version": {
      return "/report";
    }

    default: {
      if (item.url && item.url.startsWith("/")) {
        return item.url;
      }
      return "/report";
    }
  }
}

export interface TypeBadgeInfo {
  label: string;
  code: string;
  className: string;
}

/**
 * Retorna la información visual y etiqueta para cada tipo de contenido encontrado.
 */
export function getTypeBadgeInfo(
  type: SearchResultType,
  lang: "es" | "en" = "es",
): TypeBadgeInfo {
  const t = (type || "").toLowerCase();
  const isEn = lang === "en";

  switch (t) {
    case "section":
      return {
        label: isEn ? "Section" : "Sección",
        code: "SEC",
        className: "badge-section",
      };
    case "category":
      return {
        label: isEn ? "Category" : "Categoría",
        code: "CAT",
        className: "badge-category",
      };
    case "concept":
      return {
        label: isEn ? "Concept" : "Concepto",
        code: "CON",
        className: "badge-concept",
      };
    case "reference":
      return {
        label: isEn ? "Reference" : "Referencia",
        code: "REF",
        className: "badge-reference",
      };
    case "resource":
      return {
        label: isEn ? "Resource" : "Recurso",
        code: "RES",
        className: "badge-resource",
      };
    case "report_version":
      return {
        label: isEn ? "Report Version" : "Versión",
        code: "VER",
        className: "badge-version",
      };
    default:
      return {
        label: isEn ? "Content" : "Contenido",
        code: "DOC",
        className: "badge-default",
      };
  }
}

/**
 * Traduce y formatea el nombre del campo donde ocurrió la coincidencia.
 */
export function getMatchedFieldLabel(
  field?: string,
  lang: "es" | "en" = "es",
): string {
  if (!field) return "";
  const isEn = lang === "en";
  const f = field.toLowerCase().trim();

  const labels: Record<string, { es: string; en: string }> = {
    title: { es: "Título", en: "Title" },
    content: { es: "Contenido", en: "Content" },
    name: { es: "Nombre", en: "Name" },
    description: { es: "Descripción", en: "Description" },
    authors: { es: "Autores", en: "Authors" },
    summary: { es: "Resumen", en: "Summary" },
    citation_text: { es: "Citación", en: "Citation" },
    source: { es: "Fuente", en: "Source" },
    alt_text: { es: "Texto alternativo", en: "Alt text" },
  };

  const match = labels[f];
  if (match) {
    return isEn ? `in ${match.en}` : `en ${match.es}`;
  }

  return isEn ? `in ${field}` : `en ${field}`;
}

export interface HighlightChunk {
  text: string;
  isMatch: boolean;
}

/**
 * Divide un texto en partes indicando cuáles coinciden con las palabras de búsqueda para resaltarlas con seguridad.
 */
export function highlightQueryMatches(
  text: string,
  query: string,
): HighlightChunk[] {
  if (!text || !query.trim()) {
    return [{ text: text || "", isMatch: false }];
  }

  const terms = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (terms.length === 0) {
    return [{ text, isMatch: false }];
  }

  const regex = new RegExp(`(${terms.join("|")})`, "gi");
  const parts = text.split(regex);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      isMatch: terms.some((t) => new RegExp(`^${t}$`, "i").test(part)),
    }));
}
