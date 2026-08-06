"use client";

import { useEffect, type RefObject } from "react";

export interface BurstLine {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
  delay: string;
}

export function buildBurstLines(count = 44, cx = 150, cy = 100): BurstLine[] {
  const lines: BurstLine[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const len = 34 + ((i * 37) % 1000) / 1000 * 54;
    const x1 = cx + Math.cos(a) * 22;
    const y1 = cy + Math.sin(a) * 22;
    const x2 = cx + Math.cos(a) * (22 + len);
    const y2 = cy + Math.sin(a) * (22 + len);
    lines.push({
      x1: x1.toFixed(1),
      y1: y1.toFixed(1),
      x2: x2.toFixed(1),
      y2: y2.toFixed(1),
      delay: (i * 0.018).toFixed(3),
    });
  }
  return lines;
}

export function useBurstAnimation(burstRef: RefObject<SVGSVGElement | null>) {
  useEffect(() => {
    const burst = burstRef.current;
    if (!burst) return;
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            burst.classList.add("go");
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    io.observe(burst);
    return () => io.disconnect();
  }, [burstRef]);
}
