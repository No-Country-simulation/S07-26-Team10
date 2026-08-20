"use client";

import { useTranslations } from "next-intl";
import type { CSSProperties, ReactNode } from "react";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v12M7 12l5 5 5-5M5 20h14" />
    </svg>
  );
}

function Block({
  delay,
  className,
  children,
}: {
  delay: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <div className={className} style={{ "--b": delay } as CSSProperties}>
      {children}
    </div>
  );
}

export function HomeHero({
  downloadButton,
}: {
  downloadButton?: ReactNode;
}) {
  const t = useTranslations("HomePage");

  return (
    <section className="hero">
      <div className="img" />
      <div className="fade" />
      <div className="in">
        <h1>
          <span className="ln">
            <em>{t("heroLine1")}</em>
          </span>
          <span className="ln">
            <em className="soft">{t("heroLine2")}</em>
          </span>
        </h1>
        <p className="sub blk" style={{ "--b": "520ms" } as CSSProperties}>
          {t.rich("heroSub", {
            b: (chunks) => <b>{chunks}</b>,
          })}
        </p>
        <Block className="hbtn blk" delay="680ms">
          <a className="b solid" href="#s01">
            {t("readTheReport")} <ArrowIcon />
          </a>
          {downloadButton ?? (
            <a className="b line" href="/report">
              {t("downloadPdf")} <DownloadIcon />
            </a>
          )}
        </Block>
        <Block className="hmono blk" delay="800ms">
          {t("heroMono")}
        </Block>
      </div>
    </section>
  );
}
