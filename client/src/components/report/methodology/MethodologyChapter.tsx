"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useReveal } from "@/hooks/use-reveal"
import { ChapterMasthead } from "@/components/report/chapter/ChapterMasthead"
import { ReadingRail } from "@/components/report/chapter/ReadingRail"
import { Statement } from "@/components/report/chapter/Statement"

interface NRow {
  title: string
  def: string
  why: string
  body: string
}

interface ACard {
  title: string
  body: string
}

export function MethodologyChapter() {
  const t = useTranslations("Report")

  useReveal(".rv, .rvs")

  const qualify = t.raw("meth.qualify") as NRow[]
  const labels = t.raw("meth.labels") as NRow[]
  const measure = t.raw("meth.measure") as NRow[]
  const claims = t.raw("meth.claims") as NRow[]
  const versioning = t.raw("meth.versioning") as ACard[]

  return (
    <>
      <ChapterMasthead
        mono={t("meth.mono")}
        title1={t("meth.title1")}
        title2={t("meth.title2")}
        accent={t("meth.accent")}
        lead={t("meth.lead")}
        num={t("meth.chmarkN")}
        name={t("meth.chmarkT")}
        backHref="/report/taxonomy"
        backText={t("meth.backtopText")}
      />

      <ReadingRail />

      <section className="dfn">
        <div className="in">
          <Statement
            quote={t.rich("meth.statusQuote", {
              b: (chunks) => <b>{chunks}</b>,
            })}
            strip={t.raw("meth.stmtStrip")}
            src={t("meth.src")}
          />
        </div>
      </section>

      <section className="dnot">
        <div className="in">
          <div className="shead rv">
            <div className="snum">01</div>
            <div>
              <h2>{t("meth.qualifyLabel")}</h2>
              <p className="lede">{t("meth.qualifyLede")}</p>
            </div>
          </div>
          <div className="ntable rv">
            {qualify.map((row) => (
              <div className="nt" key={row.title}>
                <div className="ntl">
                  <h3>{row.title}</h3>
                  <p className="ntd">{row.def}</p>
                </div>
                <div className="ntr">
                  <span className="ntw">{row.why}</span>
                  <p>{row.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dnot">
        <div className="in">
          <div className="shead rv">
            <div className="snum">02</div>
            <div>
              <h2>{t("meth.labelsLabel")}</h2>
              <p className="lede">{t("meth.labelsLede")}</p>
            </div>
          </div>
          <div className="ntable rv">
            {labels.map((row) => (
              <div className="nt" key={row.title}>
                <div className="ntl">
                  <h3>{row.title}</h3>
                  <p className="ntd">{row.def}</p>
                </div>
                <div className="ntr">
                  <span className="ntw">{row.why}</span>
                  <p>{row.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dnot">
        <div className="in">
          <div className="shead rv">
            <div className="snum">03</div>
            <div>
              <h2>{t("meth.measureLabel")}</h2>
              <p className="lede">{t("meth.measureLede")}</p>
            </div>
          </div>
          <div className="ntable rv">
            {measure.map((row) => (
              <div className="nt" key={row.title}>
                <div className="ntl">
                  <h3>{row.title}</h3>
                  <p className="ntd">{row.def}</p>
                </div>
                <div className="ntr">
                  <span className="ntw">{row.why}</span>
                  <p>{row.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dnot" id="limits">
        <div className="in">
          <div className="shead rv">
            <div className="snum">04</div>
            <div>
              <h2>{t("meth.claimsLabel")}</h2>
              <p className="lede">{t("meth.claimsLede")}</p>
            </div>
          </div>
          <div className="ntable rv">
            {claims.map((row) => (
              <div className="nt" key={row.title}>
                <div className="ntl">
                  <h3>{row.title}</h3>
                  <p className="ntd">{row.def}</p>
                </div>
                <div className="ntr">
                  <span className="ntw">{row.why}</span>
                  <p>{row.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dwhy">
        <div className="in">
          <div className="shead rv">
            <div className="snum">05</div>
            <div>
              <h2>{t("meth.versioningLabel")}</h2>
              <p className="lede">{t("meth.versioningLede")}</p>
            </div>
          </div>
          <div className="wg rv">
            {versioning.map((c) => (
              <div className="wc" key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="chnav">
        <div className="in">
          <Link className="cnav" href="/report/taxonomy">
            <span>{t("meth.backLabel")}</span>
            <b>{t("meth.backTitle")}</b>
          </Link>
          <Link className="cnav next" href="/report/references">
            <svg viewBox="0 0 24 24">
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
            <span>{t("meth.nextLabel")}</span>
            <b>{t("meth.nextTitle")}</b>
          </Link>
        </div>
      </section>
    </>
  )
}