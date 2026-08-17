"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useVersion } from "@/features/admin/context";
import { getSectionsWithResourcesAction } from "@/features/admin/actions/sections-actions";
import { checkBackendHealthAction } from "@/features/admin/actions/reports-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers } from "lucide-react";

export function AdminDashboard() {
  const t = useTranslations("AdminPage");
  const { activeReport, activeReportVersion, activeVersionId } = useVersion();

  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);
  const [totalSections, setTotalSections] = useState<number>(0);
  const [publishedCount, setPublishedCount] = useState<number>(0);
  const [draftCount, setDraftCount] = useState<number>(0);
  const [figuresCount, setFiguresCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Health check al backend GET /api/v1/health
  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        const result = await checkBackendHealthAction();
        if (isMounted) {
          setIsBackendOnline(result.online);
        }
      } catch {
        if (isMounted) setIsBackendOnline(false);
      }
    }
    void checkHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Cargar métricas de secciones y recursos de la versión activa
  useEffect(() => {
    let isMounted = true;
    async function loadVersionData() {
      if (!activeVersionId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const sections = await getSectionsWithResourcesAction(activeVersionId);
        if (isMounted) {
          setTotalSections(sections.length);
          const published = sections.filter(
            (s) => s.status?.toUpperCase() === "PUBLISHED",
          ).length;
          const drafts = sections.filter(
            (s) => s.status?.toUpperCase() !== "PUBLISHED",
          ).length;
          setPublishedCount(published);
          setDraftCount(drafts);

          const totalResources = sections.reduce(
            (acc, s) => acc + (s.resources?.length || 0),
            0,
          );
          setFiguresCount(totalResources);
        }
      } catch (err) {
        console.error("Error loading dashboard metrics:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadVersionData();
    return () => {
      isMounted = false;
    };
  }, [activeVersionId]);

  // Si no hay versión seleccionada o activa
  if (!activeVersionId && !isLoading) {
    return (
      <div style={{ padding: "40px 0" }}>
        <div
          className="admin-card"
          style={{
            padding: "48px 24px",
            textAlign: "center",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(0,96,58,0.08)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
            }}
          >
            <Layers style={{ width: 24, height: 24, stroke: "#00603a" }} />
          </div>
          <h2
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "20px",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "#08090a",
              marginBottom: "8px",
            }}
          >
            {t("dashboard.noVersionSelectedTitle")}
          </h2>
          <p
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "14px",
              color: "#706f6f",
              maxWidth: "50ch",
              margin: "0 auto",
              lineHeight: 1.45,
            }}
          >
            {t("dashboard.noVersionSelectedDesc")}
          </p>
        </div>
      </div>
    );
  }

  const auditId = activeReport?.slug || "PF-ADM-00";
  const versionDisplay = activeReportVersion?.version
    ? activeReportVersion.version.replace(/^v/i, "")
    : "0.1";
  const isPublished = activeReportVersion?.status?.toUpperCase() === "PUBLISHED";

  const syncPercentage =
    totalSections > 0 ? Math.round((publishedCount / totalSections) * 100) : 0;

  return (
    <div>
      {/* ── Encabezado de Módulo (.eyebrow del prototipo) ────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "11px",
          fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
          fontSize: "11px",
          letterSpacing: ".07em",
          textTransform: "uppercase",
          color: "#00603a",
        }}
      >
        <span
          style={{
            width: "22px",
            height: "1px",
            background: "#00603a",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span>{t("dashboard.startModule")}</span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
            fontSize: "11px",
            letterSpacing: ".05em",
            color: "#6f6f6f",
            textTransform: "none",
          }}
        >
          ID: {auditId}
        </span>
      </div>

      {/* ── Título y Descripción (.mh del prototipo) ──────────────── */}
      <div style={{ margin: "16px 0 34px" }}>
        <h1
          style={{
            fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
            fontSize: "34px",
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#08090a",
            margin: 0,
          }}
        >
          {t("dashboard.title")}
        </h1>
        <p
          style={{
            fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
            fontSize: "15px",
            color: "#706f6f",
            marginTop: "9px",
            maxWidth: "74ch",
            lineHeight: 1.45,
            letterSpacing: "-0.01em",
          }}
        >
          {t("dashboard.descriptionPrefix")}
          <b style={{ fontWeight: 500, color: "#08090a" }}>
            {activeReportVersion?.title ||
              activeReport?.slug ||
              t("dashboard.descriptionHighlight")}
          </b>
          {t("dashboard.descriptionSuffix")}
        </p>
      </div>

      {/* ── Cuadrícula de 2 Cards (.two del prototipo) ─────────────── */}
      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ gap: "18px" }}
      >
        {/* Card 1: Base de datos */}
        <div className="card admin-card">
          <div
            style={{
              padding: "15px 18px",
              borderBottom: "1px solid #ebebeb",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                  fontSize: "17px",
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  color: "#08090a",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                {t("dashboard.database.title")}
              </h3>
              <div
                style={{
                  fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                  fontSize: "12.5px",
                  color: isBackendOnline ? "#00603a" : "#b3261e",
                  marginTop: "2px",
                  letterSpacing: "-0.01em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: isBackendOnline ? "#00603a" : "#b3261e",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span>
                  {isBackendOnline
                    ? t("dashboard.database.statusOnline")
                    : t("dashboard.database.statusOffline")}
                </span>
              </div>
            </div>
          </div>
          <div style={{ padding: "18px" }}>
            <p
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "14px",
                color: "#706f6f",
                lineHeight: 1.45,
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              {t("dashboard.database.description")}
            </p>
            {/* Barra de progreso (.track del prototipo) */}
            <div
              style={{
                height: "4px",
                background: "#ebebeb",
                borderRadius: "999px",
                overflow: "hidden",
                position: "relative",
                marginTop: "18px",
              }}
            >
              <i
                style={{
                  display: "block",
                  height: "100%",
                  width: `${syncPercentage}%`,
                  background: "#00603a",
                  borderRadius: "inherit",
                  transition: "width .4s ease",
                }}
              />
            </div>
            {/* Notas monoespaciadas (.note del prototipo) */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "9px",
                fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                fontSize: "11px",
                letterSpacing: ".04em",
                color: "#6f6f6f",
              }}
            >
              <span>
                {t("dashboard.database.synced", { percent: syncPercentage })}
              </span>
              <span>v{versionDisplay}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Cambios recientes */}
        <div className="card admin-card">
          <div
            style={{
              padding: "15px 18px",
              borderBottom: "1px solid #ebebeb",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "17px",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "#08090a",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {t("dashboard.changes.title")}
            </h3>
            <div
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "12.5px",
                color: "#6f6f6f",
                marginTop: "2px",
                letterSpacing: "-0.01em",
              }}
            >
              {t("dashboard.changes.subtitle")}
            </div>
          </div>
          <div style={{ padding: "18px" }}>
            <p
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "14px",
                color: "#706f6f",
                lineHeight: 1.45,
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              {t("dashboard.changes.description")}
            </p>

            {/* Caja de alerta (.alert del prototipo) */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "12px 14px",
                border:
                  draftCount > 0
                    ? "1px solid rgba(179,38,30,.25)"
                    : "1px solid rgba(0,96,58,.25)",
                borderLeft:
                  draftCount > 0 ? "3px solid #b3261e" : "3px solid #00603a",
                background:
                  draftCount > 0
                    ? "rgba(179,38,30,.03)"
                    : "rgba(0,96,58,.03)",
                borderRadius: "8px",
                marginTop: "16px",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                style={{
                  width: 16,
                  height: 16,
                  stroke: draftCount > 0 ? "#b3261e" : "#00603a",
                  fill: "none",
                  strokeWidth: 1.9,
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                <path d="M12 8v5M12 16.5v.5" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b
                  style={{
                    display: "block",
                    fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                    fontSize: "13.5px",
                    fontWeight: 500,
                    color: "#08090a",
                    lineHeight: 1.3,
                  }}
                >
                  {draftCount > 0
                    ? t("dashboard.changes.pendingTitle")
                    : t("dashboard.changes.upToDateTitle")}
                </b>
                <p
                  style={{
                    fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                    fontSize: "12.5px",
                    color: "#706f6f",
                    marginTop: "2px",
                    lineHeight: 1.4,
                    letterSpacing: "-0.01em",
                    margin: 0,
                  }}
                >
                  {draftCount > 0
                    ? draftCount === 1
                      ? t("dashboard.changes.pendingDescSingle")
                      : t("dashboard.changes.pendingDescPlural", {
                          count: draftCount,
                        })
                    : t("dashboard.changes.upToDateDesc")}
                </p>
              </div>
              <Link
                href="/admin/sections"
                style={{
                  height: "30px",
                  padding: "0 12px",
                  borderRadius: "6px",
                  border: "1px solid #ebebeb",
                  background: "#ffffff",
                  fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#08090a",
                  letterSpacing: "-0.01em",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "auto",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  transition: "border-color .16s, background .16s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "#08090a";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "#ebebeb";
                }}
              >
                {t("dashboard.changes.reviewBtn")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nota Editorial (.quote del prototipo) ─────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          paddingLeft: "16px",
          borderLeft: "2px solid #00603a",
          margin: "32px 0",
        }}
      >
        <span
          style={{
            fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
            fontSize: "12px",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "#00603a",
          }}
        >
          {t("dashboard.editorialNote.tag")}
        </span>
        <p
          style={{
            fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
            fontSize: "17px",
            color: "#08090a",
            lineHeight: 1.55,
            letterSpacing: "-0.015em",
            margin: 0,
            maxWidth: "78ch",
          }}
        >
          {t("dashboard.editorialNote.quote")}
        </p>
      </div>

      {/* ── Estado del Índice (.sec y .stats del prototipo) ───────── */}
      <div style={{ marginTop: "40px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h2
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "22px",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "#08090a",
              margin: 0,
            }}
          >
            {t("dashboard.indexState.title")}
          </h2>
        </div>

        <div
          className="stats admin-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1px",
            background: "#ebebeb",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: 0,
          }}
        >
          {/* Stat 1: Versión */}
          <div
            style={{
              background: "#ffffff",
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                fontSize: "12.5px",
                letterSpacing: ".04em",
                color: "#6f6f6f",
              }}
            >
              {t("dashboard.indexState.versionLabel")}
            </span>
            <b
              style={{
                fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                fontSize: "40px",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "#08090a",
                lineHeight: 1,
              }}
            >
              {versionDisplay}
            </b>
            <em
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontStyle: "normal",
                fontSize: "12.5px",
                color: "#6f6f6f",
                letterSpacing: "-0.01em",
              }}
            >
              {isPublished
                ? t("dashboard.indexState.versionPublished")
                : t("dashboard.indexState.versionDraft")}
            </em>
          </div>

          {/* Stat 2: Entradas definidas (Secciones en borrador) */}
          <div
            style={{
              background: "#ffffff",
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                fontSize: "12.5px",
                letterSpacing: ".04em",
                color: "#6f6f6f",
              }}
            >
              {t("dashboard.indexState.definedEntriesLabel")}
            </span>
            <b
              style={{
                fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                fontSize: "40px",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "#08090a",
                lineHeight: 1,
              }}
            >
              {draftCount}
            </b>
          </div>

          {/* Stat 3: Entradas medidas (Secciones publicadas en verde) */}
          <div
            style={{
              background: "#ffffff",
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                fontSize: "12.5px",
                letterSpacing: ".04em",
                color: "#6f6f6f",
              }}
            >
              {t("dashboard.indexState.measuredEntriesLabel")}
            </span>
            <b
              style={{
                fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                fontSize: "40px",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "#00603a",
                lineHeight: 1,
              }}
            >
              {publishedCount}
            </b>
          </div>

          {/* Stat 4: Figuras publicadas (Recursos totales de la versión) */}
          <div
            style={{
              background: "#ffffff",
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                fontSize: "12.5px",
                letterSpacing: ".04em",
                color: "#6f6f6f",
              }}
            >
              {t("dashboard.indexState.publishedFiguresLabel")}
            </span>
            <b
              style={{
                fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                fontSize: "40px",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "#08090a",
                lineHeight: 1,
              }}
            >
              {figuresCount}
            </b>
            <em
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontStyle: "normal",
                fontSize: "12.5px",
                color: "#6f6f6f",
                letterSpacing: "-0.01em",
              }}
            >
              {t("dashboard.indexState.figuresTag")}
            </em>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div style={{ maxWidth: "1200px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>
      <div style={{ marginBottom: "34px" }}>
        <Skeleton className="h-10 w-72 rounded-lg" style={{ marginBottom: "9px" }} />
        <Skeleton className="h-5 w-full max-w-2xl rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]" style={{ marginBottom: "28px" }}>
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-44 w-full rounded-xl" />
      </div>
      <Skeleton className="h-16 w-full rounded-lg" style={{ marginBottom: "36px" }} />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}
