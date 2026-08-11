"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useReveal } from "@/hooks/use-reveal"
import { ChapterMasthead } from "@/components/report/chapter/ChapterMasthead"

interface ACard {
  title: string
  body: string
}

export function AboutChapter() {
  const t = useTranslations("Report")

  useReveal(".rv, .rvs")

  const pillars = t.raw("about.pillars") as ACard[]

  return (
    <>
      <ChapterMasthead
        mono={t("about.mono")}
        title1={t("about.title1")}
        title2={t("about.title2")}
        accent={t("about.accent")}
        lead={t("about.lead")}
      />

      <section className="dfn">
        <div className="in">
          <div className="gc dcard rvs">
            <span className="gt">{t("about.cardLabel")}</span>
            <p className="dq">{t("about.cardQuote")}</p>
            <div className="dsrc">{t("about.src")}</div>
          </div>
        </div>
      </section>

      <section className="dnot">
        <div className="in">
          <div className="shead rv">
            <div className="snum">01</div>
            <div>
              <h2>{t("about.missionLabel")}</h2>
              <p className="lede">{t("about.missionLede")}</p>
            </div>
          </div>
          <div className="ntable rv">
            <div className="nt">
              <div className="ntl">
                <h3>{t("about.missionTitle")}</h3>
                <p className="ntd">{t("about.missionBody")}</p>
              </div>
              <div className="ntr">
                <span className="ntw">{t("about.missionTag")}</span>
                <p>{t("about.missionNote")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dwhy">
        <div className="in">
          <div className="shead rv">
            <div className="snum">02</div>
            <div>
              <h2>{t("about.pillarsLabel")}</h2>
              <p className="lede">{t("about.pillarsLede")}</p>
            </div>
          </div>
          <div className="wg rv">
            {pillars.map((c) => (
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
          <Link className="cnav" href="/report/references">
            <span>{t("about.backLabel")}</span>
            <b>{t("about.backTitle")}</b>
          </Link>
          <Link className="cnav next" href="/report/how-to-cite">
            <svg viewBox="0 0 24 24">
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
            <span>{t("about.nextLabel")}</span>
            <b>{t("about.nextTitle")}</b>
          </Link>
        </div>
      </section>
    </>
  )
}