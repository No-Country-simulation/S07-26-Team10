"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { chapters } from "../data/chapters";

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
          <div className="chap">
            {chapters.map((c) => (
              <Link key={c.num} href={c.href}>
                <span className="n">{c.num}</span>
                <div>
                  <h3>
                    {c.ns === "nav"
                      ? tnav(c.titleKey)
                      : t(`chapters.${c.titleKey}`)}
                  </h3>
                </div>
                <span className="t">{c.time}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
