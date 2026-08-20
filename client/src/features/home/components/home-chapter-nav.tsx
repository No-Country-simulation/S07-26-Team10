"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}

export function HomeChapterNav() {
  const t = useTranslations("HomePage");

  return (
    <section className="chnav home">
      <div className="in">
        <Link className="b line" href="/report/taxonomy">
          <ArrowIcon /> {t("browseTaxonomy")}
        </Link>
        <Link className="b solid" href="/report">
          {t("startReading")} <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}