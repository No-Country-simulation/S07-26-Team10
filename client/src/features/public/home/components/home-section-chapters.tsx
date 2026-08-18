"use client";

import { useTranslations } from "next-intl";
import { ChaptersList } from "@/features/chapters";

export function HomeSectionChapters() {
  const t = useTranslations("HomePage");
  const tnav = useTranslations("Nav");

  return (
    <section
      className="n"
      id="s02"
      data-n="02"
      data-t="chapters"
      suppressHydrationWarning
    >
      <div className="wrap in">
        <div className="shead rv">
          <div className="snum">02</div>
          <div>
            <h2>{tnav("chapters")}</h2>
            <p className="lede">{t("chaptersLede")}</p>
          </div>
        </div>
        <div className="sbody rv">
          <div />
          <ChaptersList />
        </div>
      </div>
    </section>
  );
}
