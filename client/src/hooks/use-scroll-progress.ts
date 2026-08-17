"use client";

import { useEffect, useState } from "react";

interface UseScrollProgressOptions {
  disableShrink?: boolean;
  shrinkThreshold?: number;
}

export function useScrollProgress({ disableShrink = false, shrinkThreshold = 340 }: UseScrollProgressOptions = {}) {
  const [progress, setProgress] = useState(0);
  const [shrink, setShrink] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (!disableShrink) setShrink(y > shrinkThreshold);
      setPastHero(y > 140);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (y / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [disableShrink, shrinkThreshold]);

  return { progress, shrink, pastHero };
}
