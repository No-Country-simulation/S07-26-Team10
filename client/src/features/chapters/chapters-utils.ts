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
