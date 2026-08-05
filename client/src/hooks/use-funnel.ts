"use client";

import { useEffect, type RefObject } from "react";

export function useFunnelAnimation(fnRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const fn = fnRef.current;
    if (!fn) return;

    const figbox = fn.closest(".fig") ?? fn;
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            figbox.classList.add("boxin");
            setTimeout(() => fn.classList.add("go"), 260);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 },
    );
    io.observe(fn);
    return () => io.disconnect();
  }, [fnRef]);
}

export interface RingArc {
  path: string;
  length: number;
  delay: number;
  highlighted: boolean;
}

export function buildRingArcs(radius = 48, count = 7, gap = 6): RingArc[] {
  const center = 60;
  const step = 360 / count;
  const sweep = step - gap;
  const arcs: RingArc[] = [];
  for (let i = 0; i < count; i++) {
    const a0 = (i * step * Math.PI) / 180;
    const a1 = ((i * step + sweep) * Math.PI) / 180;
    const x0 = center + radius * Math.cos(a0);
    const y0 = center + radius * Math.sin(a0);
    const x1 = center + radius * Math.cos(a1);
    const y1 = center + radius * Math.sin(a1);
    const length = (sweep / 360) * 2 * Math.PI * radius;
    arcs.push({
      path: `M${x0.toFixed(2)} ${y0.toFixed(2)} A${radius} ${radius} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`,
      length,
      delay: 0.3 + i * 0.09,
      highlighted: i >= count - 2,
    });
  }
  return arcs;
}

export function useRingAnimation(ringRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ring.classList.add("go");
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(ring);
    return () => io.disconnect();
  }, [ringRef]);
}
