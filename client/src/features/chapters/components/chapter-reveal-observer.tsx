"use client";

import { useReveal } from "@/hooks/use-reveal";

export function ChapterRevealObserver() {
  useReveal(".rv, .rvs");
  return null;
}
