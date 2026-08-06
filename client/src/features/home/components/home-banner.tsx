"use client";

import { useRef, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { buildBurstLines, useBurstAnimation } from "@/hooks/use-burst";

export function HomeBanner() {
  const t = useTranslations("HomePage");
  const burstRef = useRef<SVGSVGElement>(null);
  useBurstAnimation(burstRef);
  const lines = buildBurstLines();

  return (
    <section className="banner">
      <div className="bimg" />
      <div className="vig" />
      <div className="in">
        <svg
          className="burst"
          ref={burstRef}
          id="bu"
          viewBox="0 0 300 200"
          aria-hidden="true"
        >
          <circle className="core" cx="150" cy="100" r="7" />
          <circle className="ring" cx="150" cy="100" r="16" />
          {lines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              style={{ "--d": `${line.delay}s` } as CSSProperties}
            />
          ))}
        </svg>
        <div className="btx">
          <span className="tag">{t("milestoneTag")}</span>
          <p>{t("bannerText")}</p>
        </div>
        <span className="foot">{t("bannerFoot")}</span>
      </div>
    </section>
  );
}
