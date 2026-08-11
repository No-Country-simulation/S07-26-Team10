"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useReveal } from "@/hooks/use-reveal"
import { ChapterMasthead } from "@/components/report/chapter/ChapterMasthead"
import { CiteBlock } from "@/features/report/components/cite-block"

export default function HowToCitePage() {
  const t = useTranslations("HowToCite")

  useReveal(".rv, .rvs")

  return (
    <>
      <ChapterMasthead
        mono={t("mono")}
        title1={t("title1")}
        title2={t("title2")}
        accent={t("accent")}
        lead={t("lead")}
      />

      <section className="dnot">
        <div className="in">
          <div className="shead rv">
            <div className="snum">01</div>
            <div>
              <h2>{t("reportSection")}</h2>
              <p className="lede">{t("reportLede")}</p>
            </div>
          </div>
          <div className="ntable rv">
            <CiteBlock label={t("academicLabel")} text={t("reportAcademic")} />
            <CiteBlock
              label={t("journalisticLabel")}
              text={t("reportJournalistic")}
            />
          </div>
        </div>
      </section>

      <section id="figure-01" className="dnot">
        <div className="in">
          <div className="shead rv">
            <div className="snum">02</div>
            <div>
              <h2>{t("figureSection")}</h2>
              <p className="lede">{t("figureLede")}</p>
            </div>
          </div>
          <div className="ntable rv">
            <CiteBlock
              label={`${t("exampleFigure")} — ${t("academicLabel")}`}
              text={t("figureAcademic")}
            />
            <CiteBlock
              label={`${t("exampleFigure")} — ${t("journalisticLabel")}`}
              text={t("figureJournalistic")}
            />
          </div>
          <div className="dsrc" style={{ marginTop: 26 }}>
            {t("attribution")}: {t("attributionText")}
          </div>
        </div>
      </section>

      <section className="dwhy">
        <div className="in">
          <div className="shead rv">
            <div className="snum">03</div>
            <div>
              <h2>{t("chapterSection")}</h2>
              <p className="lede">{t("chapterLede")}</p>
            </div>
          </div>
          <div className="wg rv">
            <div className="wc">
              <h3>{t("noteTitle")}</h3>
              <p>{t("noteText")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="chnav">
        <div className="in">
          <Link className="cnav" href="/report/references">
            <span>{t("backLabel")}</span>
            <b>{t("backTitle")}</b>
          </Link>
          <Link className="cnav next" href="/">
            <svg viewBox="0 0 24 24">
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
            <span>{t("nextLabel")}</span>
            <b>{t("nextTitle")}</b>
          </Link>
        </div>
      </section>
    </>
  )
}