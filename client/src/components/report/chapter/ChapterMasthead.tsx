"use client"

import type { CSSProperties } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export function Words({
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

export function ChapterMasthead({
  mono,
  title1,
  title2,
  accent,
  lead,
  num,
  name,
  backHref = "/",
  backText,
}: {
  mono: string
  title1: string
  title2: string
  accent?: string
  lead: string
  num?: string
  name?: string
  backHref?: string
  backText?: string
}) {
  const t = useTranslations("Report")
  const line1Count = title1.split(" ").length

  return (
    <section className="mast">
      <div className="img" />
      <div className="fade" />
      <div className="in">
        <Link className="backtop blk" style={{ "--b": "20ms" } as CSSProperties} href={backHref}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H6M12 6l-6 6 6 6" />
          </svg>
          {backText ?? t("backToIndex")}
        </Link>
        {num && name ? (
          <div className="chmark blk" style={{ "--b": "40ms" } as CSSProperties}>
            <span className="cm-n">{num}</span>
            <span className="cm-t">{name}</span>
          </div>
        ) : (
          <div className="emono blk" style={{ "--b": "40ms" } as CSSProperties}>
            {mono}
          </div>
        )}
        <h1>
          <span className="ln">
            <em>
              <Words text={title1} base={1} />
            </em>
          </span>
          <span className="ln">
            <em>
              <Words text={title2} base={line1Count + 1} accent={accent} />
            </em>
          </span>
        </h1>
        <p className="lead blk" style={{ "--b": "560ms" } as CSSProperties}>
          {lead}
        </p>
      </div>
    </section>
  )
}