import type { PublicSection, ChapterItem } from "./chapters-types";

/**
 * Client-safe utility functions for chapters.
 */

/**
 * Calculates estimated reading time in minutes based on word count.
 */
export function calculateReadingTime(content: string = ""): string {
  if (!content) return "1 min";
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min`;
}

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
