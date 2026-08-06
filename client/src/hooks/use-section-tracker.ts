"use client";

import { useEffect, useState } from "react";

export function useSectionTracker(selector: string) {
  const [active, setActive] = useState<{ n: string; t: string }>({
    n: "01",
    t: "",
  });

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(selector);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const n = entry.target.getAttribute("data-n") ?? "";
            const t = entry.target.getAttribute("data-t") ?? "";
            setActive({ n, t });
            sections.forEach((o) => o.classList.remove("cur"));
            entry.target.classList.add("cur");
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [selector]);

  return active;
}
