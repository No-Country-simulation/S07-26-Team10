import "server-only";
import { cache } from "react";
import { HomeIntroData } from "./home-types";
import { FALLBACK_HOME_DATA } from "./data/HomeIntro";
import { apiGet } from "@/lib/api/http";
import {
  getReportBySlug,
  resolvePublishedVersion,
  type SiteLanguage,
} from "@/lib/api/reports";
import type { ApiSection } from "@/lib/api/types";

/**
 * Server-only query to fetch the home intro data and MDX content for a given language ("es" | "en").
 * Wrapped in React cache() for request-level deduplication.
 */
export const getHomeIntro = cache(
  async (lang: SiteLanguage = "es"): Promise<HomeIntroData> => {
    const targetLang = lang === "en" ? "en" : "es";
    const fallback = FALLBACK_HOME_DATA[targetLang];

    try {
      const report = await getReportBySlug();
      const version = await resolvePublishedVersion(report.id, targetLang);

      if (version) {
        let introduction = fallback.introduction;
        let methodology = fallback.methodology;

        try {
          const sections = await apiGet<ApiSection[]>(
            `/report-versions/${version.id}/sections`,
          );
          const introSection = sections.find((s) =>
            s.slug.toLowerCase().includes("intro"),
          );
          const methSection = sections.find((s) =>
            s.slug.toLowerCase().includes("method"),
          );
          if (introSection?.content) introduction = introSection.content;
          if (methSection?.content) methodology = methSection.content;
        } catch {
          // sections unreachable → keep fallback
        }

        return {
          id: report.id || fallback.id,
          title: version.title || fallback.title,
          slug: report.slug || fallback.slug,
          description: version.summary || fallback.description,
          introduction,
          methodology,
          citation_text: version.citation_text || fallback.citation_text,
          created_at: fallback.created_at,
          updated_at: fallback.updated_at,
        };
      }
    } catch (error) {
      console.warn(
        "API server unreachable for home intro, using fallback content",
        error,
      );
    }

    // Fallback to local content when the API is unavailable
    return fallback;
  },
);

/**
 * Server-only query to retrieve home intro data in all supported languages.
 */
export const getHomeIntrosMap = cache(
  async (): Promise<Record<"es" | "en", HomeIntroData>> => {
    const [es, en] = await Promise.all([
      getHomeIntro("es"),
      getHomeIntro("en"),
    ]);

    return { es, en };
  },
);