"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import {
  buildRingArcs,
  useFunnelAnimation,
  useRingAnimation,
} from "@/hooks/use-funnel";
import { useReveal } from "@/hooks/use-reveal";
import { funnelSteps, lossSources } from "../data/funnel";

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5" />
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

function TableIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 10h16M10 10v10" />
    </svg>
  );
}

function CiteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 8h10M7 12h10M7 16h6" />
    </svg>
  );
}

function FunnelRows({
  animated,
  fnRef,
  onHover,
  onLeave,
}: {
  animated: boolean;
  fnRef?: React.RefObject<HTMLDivElement | null>;
  onHover: (stepIndex: number) => void;
  onLeave: () => void;
}) {
  const t = useTranslations("HomePage");

  return (
    <div
      className={`fn${animated ? " go" : ""}`}
      id="fn"
      ref={fnRef}
      onMouseLeave={onLeave}
    >
      {funnelSteps.map((step, i) => (
        <div
          key={step.id}
          className={`r${step.key ? " key" : ""}`}
          onMouseEnter={() => onHover(i)}
        >
          <span className="st">{step.id}</span>
          <span className="nm">
            <b>{t(`${step.tKey}.name`)}</b>
            <em>{t(`${step.tKey}.desc`)}</em>
          </span>
          <span
            className="bar"
            style={{ "--w": step.width } as CSSProperties}
          >
            <i
              style={
                {
                  "--w": step.width,
                  "--c": step.color,
                  "--d": step.delay,
                } as CSSProperties
              }
            />
          </span>
          <span className="vl">{step.value}</span>
        </div>
      ))}
    </div>
  );
}

function FunnelFigure({
  expanded,
  fnRef,
  onExpand,
}: {
  expanded: boolean;
  fnRef?: React.RefObject<HTMLDivElement | null>;
  onExpand?: () => void;
}) {
  const t = useTranslations("HomePage");
  const [caption, setCaption] = useState<{
    no: string;
    name: string;
    text: string;
  } | null>(null);

  const handleHover = (i: number) => {
    const step = funnelSteps[i];
    setCaption({
      no: `${String(i + 1).padStart(2, "0")} -> ${String(
        Math.min(i + 2, funnelSteps.length),
      ).padStart(2, "0")}`,
      name: t(`${step.tKey}.name`),
      text: t(`${step.tKey}.caption`),
    });
  };

  return (
    <div className={`fig${expanded ? " boxin" : ""}`}>
      <div className="fh">
        <span className="fnum">{t("figureNum")}</span>
        <span className="ftt">{t("figureTitle")}</span>
        <span className="chip">
          <i style={{ color: "var(--phi-gold)" }} />
          {t("illustrative")}
        </span>
        {!expanded && onExpand && (
          <button className="fexp" id="fx" onClick={onExpand}>
            <ExpandIcon />
            {t("expand")}
          </button>
        )}
      </div>
      <div className="fb">
        <FunnelRows
          animated={expanded}
          fnRef={fnRef}
          onHover={handleHover}
          onLeave={() => setCaption(null)}
        />
        <div className={`fcap${caption ? " on" : ""}`} id="fcap">
          {caption ? (
            <>
              <span className="no">{caption.no}</span>
              <span className="tx">
                <b>{caption.name}</b> — {caption.text}
              </span>
            </>
          ) : (
            <span className="idle">{t("funnelIdle")}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function FunnelRing() {
  const ringRef = useRef<HTMLDivElement>(null);
  useRingAnimation(ringRef);
  const t = useTranslations("HomePage");
  const arcs = buildRingArcs();

  return (
    <div className="dring" ref={ringRef}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="tr" cx="60" cy="60" r="48" />
        <g className="seg">
          {arcs.map((arc, i) => (
            <path
              key={i}
              className={arc.highlighted ? "k" : undefined}
              d={arc.path}
              style={
                {
                  "--l": `${arc.length}`,
                  "--dd": `${arc.delay}s`,
                } as CSSProperties
              }
            />
          ))}
        </g>
      </svg>
      <div className="rc">
        <b>07</b>
        <em>{t("stepsLabel")}</em>
      </div>
    </div>
  );
}

export function HomeFunnel() {
  const t = useTranslations("HomePage");
  const fnRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState(false);

  useReveal(".phi .rv, .phi .rvs");
  useFunnelAnimation(fnRef);

  return (
    <section
      className="n glassbg"
      style={{ borderBottom: 0 }}
      id="s03"
      data-n="03"
      data-t="theCapacityFunnel"
    >
      <div className="wrap in">
        <div className="shead rv">
          <div className="snum">03</div>
          <div>
            <h2>{t("funnelTitle")}</h2>
            <p className="lede">{t("funnelLede")}</p>
          </div>
        </div>
      </div>
      <div className="fwide">
        <div className="fgrid rvs">
          <FunnelFigure
            expanded={false}
            fnRef={fnRef}
            onExpand={() => setLightbox(true)}
          />
          <aside className="rail">
            <div className="gc">
              <span className="gt">{t("gc1Title")}</span>
              <FunnelRing />
              <p>{t("gc1Body")}</p>
              <span className="chip sm">
                <i style={{ color: "var(--phi-gold)" }} />
                {t("illustrativeModel")}
              </span>
            </div>
            <div className="gc">
              <span className="gt">{t("gc2Title")}</span>
              {lossSources.map((src) => (
                <Link key={src.labelKey} className="lk" href={src.href}>
                  <span>{t(src.labelKey)}</span>
                  <i>{src.count}</i>
                </Link>
              ))}
              <p className="gn">{t("gc2Foot")}</p>
            </div>
            <div className="gc">
              <span className="gt">{t("gc3Title")}</span>
              <p>{t("gc3Body")}</p>
              <a className="mlink" href="/methodology">
                {t("exploreMethodology")}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h13M12 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          </aside>
        </div>
        <div className="fmeta rvs">
          <div className="fmL">
            <p className="disc open" id="disc">
              {t("disc")}
            </p>
            <div className="s1">{t("source")}</div>
            <div className="s2">{t("version")}</div>
          </div>
          <div className="fdl">
            <a href="#">
              <DownloadIcon />
              PNG
            </a>
            <a href="#">
              <DownloadIcon />
              SVG
            </a>
            <a href="#">
              <TableIcon />
              {t("downloadTable")}
            </a>
            <a href="#">
              <CiteIcon />
              {t("citeFigure")}
            </a>
          </div>
        </div>
      </div>

      {lightbox && (
        <div className="lbox on" id="lb">
          <button
            className="sclose"
            id="lbx"
            aria-label="Close"
            onClick={() => setLightbox(false)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <div className="inner" id="lbin">
            <FunnelFigure expanded />
          </div>
        </div>
      )}
    </section>
  );
}
