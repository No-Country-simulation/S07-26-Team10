"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

function DownloadSvg() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v12M7 12l5 5 5-5M5 20h14" />
    </svg>
  );
}

export function NavigationFooter() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="fg">
        <div className="fb">
          <Link href="/" className="lock">
            <img
              className="iso"
              style={{ height: 34, width: 34 }}
              src="/images/physaflow-logo.jpg"
              alt="PhysaFlow"
            />
            <p className="wmk">PhysaFlow</p>
          </Link>
          <p>{t("description")}</p>
          <a className="b line fdl-b" style={{ marginTop: 22 }} href="#">
            {t("downloadPdf")} <DownloadSvg />
          </a>
        </div>
        <div>
          <h4>{t("report")}</h4>
          <Link href="/report">{t("definition")}</Link>
          <Link href="/#s02">{t("capacityFunnel")}</Link>
          <Link href="/report/taxonomy">{t("taxonomy")}</Link>
          <Link href="/methodology">{t("methodology")}</Link>
          <Link href="/report/references">{t("references")}</Link>
        </div>
        <div>
          <h4>{t("publication")}</h4>
          <a href="#">{t("howToCite")}</a>
          <a href="#">{t("changelog")}</a>
          <a href="#">{t("licence")}</a>
        </div>
        <div>
          <h4>{t("contact")}</h4>
          <a href="#">{t("linkedin")}</a>
          <a href="#">{t("contactPending")}</a>
          <a href="#">{t("pressPending")}</a>
        </div>
      </div>
      <div className="pubmeta">
        <div>
          <b>{t("author")}</b>
          <span>{t("physaflowPending")}</span>
        </div>
        <div>
          <b>{t("published")}</b>
          <span>{t("datePending")}</span>
        </div>
        <div>
          <b>{t("version")}</b>
          <span>{t("draft")}</span>
        </div>
        <div>
          <b>{t("publisher")}</b>
          <span>{t("pending")}</span>
        </div>
      </div>
      <div className="fbot">
        <div className="in">
          <span>{t("copyright", { year })}</span>
          <span style={{ marginLeft: "auto" }}>{t("noPartnership")}</span>
        </div>
      </div>
    </footer>
  );
}
