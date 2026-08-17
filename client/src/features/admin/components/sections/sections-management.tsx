"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getSectionsWithResourcesAction,
  getSectionsAction,
  deleteSectionAction,
  type SectionWithResources,
} from "../../actions/sections-actions";
import { useVersion } from "@/features/admin/context";
import { Layers } from "lucide-react";

export function SectionsManagement() {
  const t = useTranslations("AdminPage");
  const {
    activeReportVersion,
    activeVersionId,
    reportVersions,
    contentLanguage,
    version,
  } = useVersion();

  const [sections, setSections] = useState<SectionWithResources[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [translatedCount, setTranslatedCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    async function loadSections() {
      if (!activeVersionId) {
        setSections([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getSectionsWithResourcesAction(activeVersionId);
        if (isMounted) {
          const sorted = [...data].sort(
            (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
          );
          setSections(sorted);
        }
      } catch (err) {
        console.error("Failed to load sections", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void loadSections();
    return () => {
      isMounted = false;
    };
  }, [activeVersionId]);

  // Cálculo de secciones traducidas comparando display_order con la versión del otro idioma
  useEffect(() => {
    let isMounted = true;
    async function calculateTranslated() {
      if (!activeReportVersion || sections.length === 0) {
        if (isMounted) setTranslatedCount(0);
        return;
      }

      const currentLang = (
        activeReportVersion.language ||
        contentLanguage ||
        "ES"
      ).toUpperCase();
      const targetLang = currentLang === "ES" ? "EN" : "ES";
      const currentVerNum = activeReportVersion.version
        .toLowerCase()
        .replace(/^v/, "");

      // Buscar si existe la versión homóloga en el otro idioma
      const otherVersion = reportVersions.find(
        (rv) =>
          rv.report_id === activeReportVersion.report_id &&
          rv.version.toLowerCase().replace(/^v/, "") === currentVerNum &&
          (rv.language || "ES").toUpperCase() === targetLang,
      );

      // Si no existe la versión en el otro idioma, el conteo es 0
      if (!otherVersion) {
        if (isMounted) setTranslatedCount(0);
        return;
      }

      try {
        const otherSections = await getSectionsAction(otherVersion.id);
        if (!isMounted) return;

        // Conjunto de display_order presentes en la versión del otro idioma
        const otherOrders = new Set(
          otherSections
            .map((s) => s.display_order)
            .filter((ord): ord is number => ord !== undefined && ord !== null),
        );

        // Secciones actuales cuyo display_order existe en la otra versión
        const matchedInOther = sections.filter((s) => {
          if (s.display_order === undefined || s.display_order === null)
            return false;
          return otherOrders.has(s.display_order);
        }).length;

        setTranslatedCount(matchedInOther);
      } catch (err) {
        console.error("Error calculating translated sections:", err);
        if (isMounted) setTranslatedCount(0);
      }
    }

    void calculateTranslated();
    return () => {
      isMounted = false;
    };
  }, [activeReportVersion, contentLanguage, reportVersions, sections]);

  const handleDelete = async (id: string) => {
    if (!id) return;
    setIsDeleting(true);
    try {
      const res = await deleteSectionAction(id, activeVersionId || undefined);
      if (res.success) {
        setSections((prev) => prev.filter((s) => s.id !== id));
        setDeleteId(null);
      }
    } catch (err) {
      console.error("Failed to delete section", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Métricas para el bloque de 4 estadísticas
  const totalSections = sections.length;
  const publishedCount = sections.filter(
    (s) => s.status?.toUpperCase() === "PUBLISHED" || s.published,
  ).length;
  const draftCount = sections.filter(
    (s) => s.status?.toUpperCase() !== "PUBLISHED" && !s.published,
  ).length;
  const publishedPercent =
    totalSections > 0 ? Math.round((publishedCount / totalSections) * 100) : 0;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    } catch {
      return "—";
    }
  };

  // Helper para extraer un snippet limpio del contenido
  const extractSnippet = (content?: string) => {
    if (!content) return "";
    const clean = content
      .replace(/[#*`_\[\]()]/g, "")
      .replace(/\n+/g, " ")
      .trim();
    return clean.length > 55 ? clean.slice(0, 55) + "…" : clean;
  };

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
        <span>{t("sections.headerTag")}</span>
      </div>

      {/* ── Título, Subtítulo y Botón Nueva Sección (.mh del prototipo) ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "20px",
          margin: "16px 0 32px",
          flexWrap: "wrap",
        }}
      >
        <div>
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
            {t("sections.title")}
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
            {t("sections.subtitle")}
          </p>
        </div>

        <Link
          href="/admin/sections/new"
          className="b pri"
          style={{
            background: "#00603a",
            color: "#ffffff",
            borderRadius: "8px",
            height: "38px",
            padding: "0 16px",
            fontSize: "14px",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            style={{
              width: 16,
              height: 16,
              stroke: "#ffffff",
              fill: "none",
              strokeWidth: 2,
            }}
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>{t("sections.newSectionBtn")}</span>
        </Link>
      </div>

      {/* ── Advertencia si no hay versión activa ─────────────────── */}
      {!activeVersionId && !loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 16px",
            borderRadius: "8px",
            border: "1px solid rgba(122,102,48,.25)",
            borderLeft: "3px solid #7a6630",
            background: "rgba(122,102,48,.04)",
            marginBottom: "24px",
            fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
            fontSize: "13.5px",
            color: "#08090a",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            style={{
              width: 18,
              height: 18,
              stroke: "#7a6630",
              fill: "none",
              strokeWidth: 1.9,
              flexShrink: 0,
            }}
          >
            <path d="M12 8v5M12 16.5v.5" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          <span>
            {t("sections.noActiveReportWarning", {
              version: version || "N/A",
            })}
          </span>
        </div>
      )}

      {/* ── Cuadrícula de 4 Métricas (.stats del prototipo) ────────── */}
      <div
        className="stats admin-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1px",
          background: "#ebebeb",
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: "32px",
        }}
      >
        {/* Stat 1: Total */}
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
            {t("sections.statsTotal")}
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
            {totalSections}
          </b>
        </div>

        {/* Stat 2: Publicadas + barra de progreso */}
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
            {t("sections.statsPublished")}
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
          {/* Progress track */}
          <div
            style={{
              height: "3px",
              background: "#ebebeb",
              borderRadius: "2px",
              marginTop: "4px",
              overflow: "hidden",
            }}
          >
            <i
              style={{
                display: "block",
                height: "100%",
                width: `${publishedPercent}%`,
                background: "#00603a",
                borderRadius: "2px",
                transition: "width .4s ease",
              }}
            />
          </div>
        </div>

        {/* Stat 3: Borradores */}
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
            {t("sections.statsDraft")}
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

        {/* Stat 4: Traducidas (de {totalSections}) */}
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
            {t("sections.statsTranslated")}
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
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
              {translatedCount}
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
              {t("sections.statsTranslatedTag", { total: totalSections })}
            </em>
          </div>
        </div>
      </div>

      {/* ── Card de Secciones con Tabla (.card del prototipo) ──────── */}
      <div className="card admin-card" style={{ overflow: "hidden" }}>
        {/* Cabecera de la Card (sin botón de reordenar por indicación del usuario) */}
        <div
          style={{
            padding: "15px 18px",
            borderBottom: "1px solid #ebebeb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
              {t("sections.cardTitle")}
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
              {t("sections.cardSubtitle")}
            </div>
          </div>
        </div>

        {/* Contenido de la Tabla */}
        {loading ? (
          <div style={{ padding: "20px" }} className="space-y-3">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-14 w-full rounded-md" />
            <Skeleton className="h-14 w-full rounded-md" />
            <Skeleton className="h-14 w-full rounded-md" />
          </div>
        ) : sections.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "rgba(0,96,58,0.08)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 14px",
              }}
            >
              <Layers style={{ width: 22, height: 22, stroke: "#00603a" }} />
            </div>
            <h4
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "16px",
                fontWeight: 500,
                color: "#08090a",
                marginBottom: "6px",
              }}
            >
              {t("sections.emptyTitle")}
            </h4>
            <p
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "13.5px",
                color: "#706f6f",
                marginBottom: "16px",
              }}
            >
              {t("sections.emptyDesc")}
            </p>
            <Link
              href="/admin/sections/new"
              className="b pri sm"
              style={{
                background: "#00603a",
                color: "#ffffff",
                borderRadius: "6px",
                height: "32px",
                padding: "0 14px",
                fontSize: "13px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                style={{
                  width: 14,
                  height: 14,
                  stroke: "#ffffff",
                  fill: "none",
                  strokeWidth: 2,
                }}
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>{t("sections.createFirstSection")}</span>
            </Link>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: "90px" }}>{t("sections.colOrder")}</th>
                <th>{t("sections.colSection")}</th>
                <th style={{ width: "160px" }}>{t("sections.colChapter")}</th>
                <th style={{ width: "120px" }}>{t("sections.colStatus")}</th>
                <th style={{ width: "110px" }}>{t("sections.colUpdated")}</th>
                <th style={{ width: "92px", textAlign: "right" }}>
                  {t("sections.colActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sections.map((sec, idx) => {
                const isPublished =
                  sec.status?.toUpperCase() === "PUBLISHED" || sec.published;
                const displayOrder = String(
                  sec.display_order ?? idx + 1,
                ).padStart(2, "0");
                const snippet = extractSnippet(sec.content);

                return (
                  <tr key={sec.id}>
                    {/* Orden */}
                    <td className="mono">{displayOrder}</td>

                    {/* Título de sección (con dot al inicio) y subtítulo alineado al inicio del punto */}
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "9px",
                          fontFamily:
                            "var(--f, 'Inter Tight', system-ui, sans-serif)",
                          fontWeight: 500,
                          letterSpacing: "-0.01em",
                          color: "#08090a",
                          fontSize: "15px",
                          lineHeight: 1.3,
                        }}
                      >
                        <span
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: isPublished ? "#00603a" : "#7a6630",
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />
                        <span>{sec.title || t("sections.unnamed")}</span>
                      </div>
                      <div
                        style={{
                          fontFamily:
                            "var(--f, 'Inter Tight', system-ui, sans-serif)",
                          fontSize: "12.5px",
                          color: "#6f6f6f",
                          lineHeight: 1.4,
                          marginTop: "2px",
                        }}
                      >
                        {snippet || t("sections.noIntro")}
                      </div>
                    </td>

                    {/* Slug / Capítulo */}
                    <td className="mono">{sec.slug}</td>

                    {/* Estado con badge de marca */}
                    <td>
                      <span className={isPublished ? "bg pub" : "bg draft"}>
                        {isPublished
                          ? t("sections.statusPublished")
                          : t("sections.statusDraft")}
                      </span>
                    </td>

                    {/* Fecha de actualización */}
                    <td className="mono">
                      {formatDate(sec.updated_at || sec.created_at)}
                    </td>

                    {/* Acciones siempre visibles y estáticas sin movimiento en hover */}
                    <td className="act">
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: "4px",
                        }}
                      >
                        {/* Botón Editar */}
                        <Link
                          href={`/admin/sections/${sec.id}`}
                          className="b icon ghost"
                          title={t("sections.editTooltip")}
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="M4 20h4l10-10-4-4L4 16z" />
                          </svg>
                        </Link>

                        {/* Botón Eliminar */}
                        <button
                          type="button"
                          onClick={() => setDeleteId(sec.id)}
                          className="b icon danger"
                          title={t("sections.deleteTooltip")}
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Nota de conteo al pie (.note del prototipo) ───────────── */}
      {!loading && sections.length > 0 && (
        <p
          className="note"
          style={{
            marginTop: "14px",
            fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
            fontSize: "11px",
            letterSpacing: ".04em",
            color: "#6f6f6f",
          }}
        >
          {t("sections.noteCount", {
            count: sections.length,
            total: sections.length,
          })}
        </p>
      )}

      {/* ── Modal de Confirmación de Eliminación ──────────────────── */}
      {deleteId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,9,10,0.45)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 50,
            padding: "20px",
          }}
        >
          <div
            className="admin-card"
            style={{
              width: "100%",
              maxWidth: "420px",
              padding: "24px",
              borderRadius: "12px",
              background: "#ffffff",
              boxShadow: "0 10px 30px -10px rgba(8,9,10,0.2)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "18px",
                fontWeight: 500,
                color: "#08090a",
                margin: "0 0 8px 0",
              }}
            >
              {t("sections.deleteConfirmTitle")}
            </h3>
            <p
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "14px",
                color: "#706f6f",
                margin: "0 0 20px 0",
                lineHeight: 1.45,
              }}
            >
              {t("sections.deleteConfirmDesc")}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="b sec sm"
                style={{
                  height: "34px",
                  padding: "0 14px",
                  fontSize: "13px",
                }}
              >
                {t("sections.cancelBtn")}
              </button>
              <button
                type="button"
                onClick={() => deleteId && void handleDelete(deleteId)}
                disabled={isDeleting}
                className="b pri sm"
                style={{
                  height: "34px",
                  padding: "0 14px",
                  fontSize: "13px",
                  background: "#b3261e",
                  borderColor: "#b3261e",
                }}
              >
                {isDeleting ? "..." : t("sections.deleteConfirmBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SectionsManagementSkeleton() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>
      <div style={{ marginBottom: "32px" }}>
        <Skeleton className="h-10 w-64 rounded-lg" style={{ marginBottom: "8px" }} />
        <Skeleton className="h-4 w-full max-w-xl rounded-md" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[#ebebeb] rounded-xl overflow-hidden mb-8">
        <Skeleton className="h-28 w-full bg-white" />
        <Skeleton className="h-28 w-full bg-white" />
        <Skeleton className="h-28 w-full bg-white" />
        <Skeleton className="h-28 w-full bg-white" />
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}
