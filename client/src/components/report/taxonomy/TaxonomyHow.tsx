"use client"

import { useTranslations } from "next-intl"

export function TaxonomyHow() {
  const t = useTranslations("Report")

  return (
    <section className="how rv">
      <div className="in">
        <div className="hg">
          <div className="hc">
            <span className="hn">{t("entryIsTitle")}</span>
            <p>{t.rich("entryIsBody", { em: (chunks) => <em>{chunks}</em> })}</p>
          </div>
          <div className="hc">
            <span className="hn">{t("entryIsNotTitle")}</span>
            <p>{t("entryIsNotBody")}</p>
          </div>
          <div className="hc">
            <span className="hn">{t("twoLabelsTitle")}</span>
            <p>
              {t.rich("twoLabelsBody", {
                est: (chunks) => <b className="es est mini">{chunks}</b>,
                prop: (chunks) => <b className="es prop mini">{chunks}</b>,
              })}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}