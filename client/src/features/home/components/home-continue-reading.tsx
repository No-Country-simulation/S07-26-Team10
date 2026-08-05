"use client";

import { useTranslations } from "next-intl";
import { useScrollProgress } from "@/hooks/use-scroll-progress";

export function HomeContinueReading() {
  const t = useTranslations("HomePage");
  const { pastHero } = useScrollProgress();

  return (
    <a
      className={`cont${pastHero ? " hide" : ""}`}
      id="cont"
      href="#s01"
    >
      {t("continueReading")}
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M6 13l6 6 6-6" />
      </svg>
    </a>
  );
}
