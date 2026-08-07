import "server-only";
import { cache } from "react";
import { HomeIntroData } from "./home-types";
import { env } from "@/lib/env";
import { FALLBACK_HOME_DATA } from "./data/HomeIntro";




/**
 * Server-only query to fetch the home intro data and MDX content for a given language ("es" | "en").
 * Wrapped in React cache() for request-level deduplication.
 */
export const getHomeIntro = cache(
  async (lang: "es" | "en" = "es"): Promise<HomeIntroData> => {
    const targetLang = lang === "en" ? "en" : "es";


    if (env.apiUrl) {
      try {
        const response = await fetch(
          `${env.apiUrl}/reports/stranded-capacity-ai-infrastructure`,
          {
            headers: { "Content-Type": "application/json" },
            next: { revalidate: 3600 },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const fallback = FALLBACK_HOME_DATA[targetLang];

          return {
            id: data.id || fallback.id,
            title: data.title || fallback.title,
            slug: data.slug || fallback.slug,
            description: data.summary || data.description || fallback.description,
            introduction:
              data.introduction || data.content || fallback.introduction,
            methodology: data.methodology || fallback.methodology,
            citation_text:
              data.citation_text || data.citationText || fallback.citation_text,
            created_at:
              data.created_at || data.createdAt || fallback.created_at,
            updated_at:
              data.updated_at || data.updatedAt || fallback.updated_at,
          };
        }
      } catch (error) {
        console.warn(
          "API server unreachable for home intro, using fallback content",
          error,
        );
      }
    }

    // Fallback to local content when the API is unavailable
    return FALLBACK_HOME_DATA[targetLang];
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



