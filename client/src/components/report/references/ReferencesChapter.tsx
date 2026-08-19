"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useReveal } from "@/hooks/use-reveal"
import { ChapterMasthead } from "@/components/report/chapter/ChapterMasthead"
import type { PublicReference } from "@/features/public/references/types"

interface ACard {
  title: string
  body: string
}

export function ReferencesChapter({ references }: { references: PublicReference[] }) {
  const t = useTranslations("Report")

  useReveal(".rv, .rvs")

  useEffect(() => {
    const rawHash = decodeURIComponent(window.location.hash.replace(/^#/, "")).trim()
    if (!rawHash) return

    setTimeout(() => {
      const el =
        document.getElementById(rawHash) ||
        document.querySelector(`[data-id="${rawHash}"]`)

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
        el.classList.add("search-target-highlight")
        setTimeout(() => {
          el.classList.remove("search-target-highlight")
        }, 3500)
      }
    }, 200)
  }, [references])

  const missing = t.raw("refs.missing") as ACard[]

  return (
    <>
      <ChapterMasthead
        mono={t("refs.mono")}
        title1={t("refs.title1")}
        title2={t("refs.title2")}
        accent={t("refs.accent")}
        lead={t("refs.lead")}
      />

      <section className="dfn">
        <div className="in">
          <div className="gc dcard rvs">
            <span className="gt">{t("refs.statusLabel")}</span>
            <p className="dq">{t("refs.statusQuote")}</p>
            <div className="lk" style={{ marginTop: 18 }}>
              <span>{t("refs.lkEntries")}</span>
              <i>{t("refs.lkEntriesVal")}</i>
            </div>
            <div className="lk">
              <span>{t("refs.lkFigures")}</span>
              <i>{t("refs.lkFiguresVal")}</i>
            </div>
            <div className="lk">
              <span>{t("refs.lkBackground")}</span>
              <i>{t("refs.lkBackgroundVal", { count: references.length })}</i>
            </div>
            <div className="dsrc">{t("refs.src")}</div>
          </div>
        </div>
      </section>

      <section className="dnot">
        <div className="in">
          <div className="shead rv">
            <div className="snum">01</div>
            <div>
              <h2>{t("refs.sourcesLabel")}</h2>
              <p className="lede">{t("refs.sourcesLede")}</p>
            </div>
          </div>
          <div className="ntable rv">
            {references.map((ref) => (
              <div
                className="nt"
                key={ref.id || ref.title}
                id={ref.id}
                data-id={ref.id}
              >
                <div className="ntl">
                  <h3>{ref.title}</h3>
                  <p className="ntd">
                    {ref.authors} · {ref.year}
                  </p>
                </div>
                <div className="ntr">
                  <span className="ntw">{t("refs.howUsed")}</span>
                  <p>
                    {ref.usage ? t(`refs.${ref.usage}`) : ref.source}
                  </p>
                  <a
                    className="reflink"
                    href={ref.citationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ref.citationUrl.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dwhy">
        <div className="in">
          <div className="shead rv">
            <div className="snum">02</div>
            <div>
              <h2>{t("refs.missingLabel")}</h2>
              <p className="lede">{t("refs.missingLede")}</p>
            </div>
          </div>
          <div className="wg rv">
            {missing.map((c) => (
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
          <Link className="cnav" href="/methodology">
            <span>{t("refs.backLabel")}</span>
            <b>{t("refs.backTitle")}</b>
          </Link>
          <Link className="cnav next" href="/">
            <svg viewBox="0 0 24 24">
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
            <span>{t("refs.nextLabel")}</span>
            <b>{t("refs.nextTitle")}</b>
          </Link>
        </div>
      </section>
    </>
  )
}