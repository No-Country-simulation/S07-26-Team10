"use client";

import { useTranslations } from "next-intl";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}

export function HomeSectionProblem() {
  const t = useTranslations("HomePage");

  return (
    <section className="n" id="s01" data-n="01" data-t="theProblem">
      <div className="img" />
      <div className="fade" />
      <div className="wrap in">
        <div className="shead rv">
          <div className="snum">01</div>
          <div>
            <h2>{t("problemTitle")}</h2>
            <p className="lede">{t("problemLede")}</p>
          </div>
        </div>
        <div className="sbody rv">
          <div />
          <div style={{ maxWidth: 720 }}>
            <p>{t("problemBody")}</p>
            <a className="b line" style={{ marginTop: 26 }} href="#">
              {t("readTheDefinition")} <ArrowIcon />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
