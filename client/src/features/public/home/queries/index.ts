import "server-only";
import { cache } from "react";
import type { HomeIntroData } from "../types";
import { env } from "@/lib/env";
import { FALLBACK_HOME_DATA } from "../data/HomeIntro";

interface ApiReport {
  id: string;
  slug: string;
}

interface ApiVersion {
  id: string;
  title: string | null;
  version: string | null;
  language: string;
  summary: string | null;
  citation_text: string | null;
}

interface ApiSection {
  slug: string;
  content: string | null;
}

/**
 * Server-only query to fetch the home intro data and MDX content for a given language ("es" | "en").
 * Wrapped in React cache() for request-level deduplication.
 */
export const getHomeIntro = cache(
  async (lang: "es" | "en" = "es"): Promise<HomeIntroData> => {
    const targetLang = lang === "en" ? "en" : "es";
    const fallback = FALLBACK_HOME_DATA[targetLang];

    if (env.apiUrl) {
      try {
        const response = await fetch(
          `${env.apiUrl}/reports/by-slug/stranded-capacity-index-2026`,
          {
            headers: { "Content-Type": "application/json" },
            next: { revalidate: 3600 },
          },
        );

        if (response.ok) {
          const data: ApiReport = await response.json();

          const versionsRes = await fetch(
            `${env.apiUrl}/reports/${data.id}/versions/published`,
            { headers: { "Content-Type": "application/json" } },
          );

          if (versionsRes.ok) {
            const versions: ApiVersion[] = await versionsRes.json();
            const version =
              versions.find(
                (v) => v.language.toLowerCase() === targetLang,
              ) || versions[0];

            if (version) {
              let introduction = fallback.introduction;
              let methodology = fallback.methodology;

              try {
                const sectionsRes = await fetch(
                  `${env.apiUrl}/report-versions/${version.id}/sections`,
                  { headers: { "Content-Type": "application/json" } },
                );
                if (sectionsRes.ok) {
                  const sections: ApiSection[] = await sectionsRes.json();
                  const introSection = sections.find((s) =>
                    s.slug.toLowerCase().includes("intro"),
                  );
                  const methSection = sections.find((s) =>
                    s.slug.toLowerCase().includes("method"),
                  );
                  if (introSection?.content) introduction = introSection.content;
                  if (methSection?.content) methodology = methSection.content;
                }
              } catch {
                // sections unreachable → keep fallback
              }

              return {
                id: data.id || fallback.id,
                title: version.title || fallback.title,
                slug: data.slug || fallback.slug,
                description: version.summary || fallback.description,
                introduction,
                methodology,
                citation_text: version.citation_text || fallback.citation_text,
                created_at: fallback.created_at,
                updated_at: fallback.updated_at,
              };
            }
          }
        }
      } catch (error) {
        console.warn(
          "API server unreachable for home intro, using fallback content",
          error,
        );
      }
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