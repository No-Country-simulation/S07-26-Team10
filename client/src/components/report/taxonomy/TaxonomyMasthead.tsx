"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import type { CSSProperties } from "react"

function Words({
  text,
  base = 0,
  accent,
}: {
  text: string
  base?: number
  accent?: string
}) {
  const words = text.split(" ")
  let idx = 0
  return (
    <>
      {words.map((word, i) => {
        if (word === accent) {
          return (
            <span
              key={i}
              className="au wr"
              style={{ "--i": base + idx++ } as CSSProperties}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          )
        }
        return (
          <span
            key={i}
            className="wr"
            style={{ "--i": base + idx++ } as CSSProperties}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        )
      })}
    </>
  )
}

export function TaxonomyMasthead() {
  const t = useTranslations("Report")
  const line1Count = t("mastTitle1").split(" ").length
  const line2 = [t("mastTitle2Pre"), t("mastTitleAccent"), t("mastTitle2Post")]
    .filter(Boolean)
    .join(" ")

  return (
    <section className="mast">
      <div className="img" />
      <div className="fade" />
      <div className="in">
        <Link className="backtop blk" style={{ "--b": "20ms" } as CSSProperties} href="/">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H6M12 6l-6 6 6 6" />
          </svg>
          {t("backToIndex")}
        </Link>
        <div className="emono blk" style={{ "--b": "60ms" } as CSSProperties}>
          {t("taxonomyMono", { count: 18 })}
        </div>
        <h1>
          <span className="ln">
            <em>
              <Words text={t("mastTitle1")} base={1} />
            </em>
          </span>
          <span className="ln">
            <em>
              <Words text={line2} base={line1Count + 1} accent={t("mastTitleAccent")} />
            </em>
          </span>
        </h1>
        <p className="lead blk" style={{ "--b": "560ms" } as CSSProperties}>
          {t("mastLead")}
        </p>
      </div>
    </section>
  )
}