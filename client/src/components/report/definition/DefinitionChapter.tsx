"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useReveal } from "@/hooks/use-reveal"
import { ChapterMasthead } from "@/components/report/chapter/ChapterMasthead"
import { ReadingRail } from "@/components/report/chapter/ReadingRail"
import { Statement } from "@/components/report/chapter/Statement"

interface ARow {
  t: string
  d: string
  w: string
  b: string
}

interface ACard {
  title: string
  body: string
}

interface ALayer {
  name: string
  count: string
  body: string
  href: string
}

export function DefinitionChapter() {
  const t = useTranslations("Report")

  useReveal(".rv, .rvs")

  const notRows = t.raw("def.not") as ARow[]
  const why = t.raw("def.why") as ACard[]
  const layers = t.raw("def.where") as ALayer[]

  return (
    <>
      <ChapterMasthead
        mono={t("def.mono")}
        title1={t("def.title1")}
        title2={t("def.title2")}
        accent={t("def.accent")}
        lead={t("def.lead")}
        num={t("def.chmarkN")}
        name={t("def.chmarkT")}
      />

      <ReadingRail />

      <section className="dfn">
        <div className="in">
          <Statement
            quote={t.rich("def.cardQuote", {
              b: (chunks) => <b>{chunks}</b>,
            })}
            strip={t.raw("def.stmtStrip")}
            src={t("def.src")}
            words
          />
        </div>
      </section>

      <section className="dnot">
        <div className="in">
          <div className="shead rv">
            <div className="snum">02</div>
            <div>
              <h2>{t("def.notLabel")}</h2>
              <p className="lede">{t("def.notLede")}</p>
            </div>
          </div>
          <div className="ntable rv">
            {notRows.map((row) => (
              <div className="nt" key={row.t}>
                <div className="ntl">
                  <h3>{row.t}</h3>
                  <p className="ntd">{row.d}</p>
                </div>
                <div className="ntr">
                  <span className="ntw">{row.w}</span>
                  <p>{row.b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dwhy">
        <div className="in">
          <div className="shead rv">
            <div className="snum">03</div>
            <div>
              <h2>{t("def.whyLabel")}</h2>
              <p className="lede">{t("def.whyLede")}</p>
            </div>
          </div>
          <div className="wg rv">
            {why.map((c) => (
              <div className="wc" key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dwhere">
        <div className="in">
          <div className="shead rv">
            <div className="snum">04</div>
            <div>
              <h2>{t("def.whereLabel")}</h2>
              <p className="lede">{t("def.whereLede")}</p>
            </div>
          </div>
          <div className="lay rv">
            {layers.map((l) => (
              <Link className="ly" href={l.href} key={l.name}>
                <span className="lyn">{l.name}</span>
                <i>{l.count}</i>
                <p>{l.body}</p>
                <span className="lya">
                  <svg viewBox="0 0 24 24">
                    <path d="M7 17L17 7M8 7h9v9" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="chnav">
        <div className="in">
          <Link className="cnav" href="/">
            <span>{t("def.backLabel")}</span>
            <b>{t("def.backTitle")}</b>
          </Link>
          <Link className="cnav next" href="/report/taxonomy">
            <svg viewBox="0 0 24 24">
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
            <span>{t("def.nextLabel")}</span>
            <b>{t("def.nextTitle")}</b>
          </Link>
        </div>
      </section>
    </>
  )
}