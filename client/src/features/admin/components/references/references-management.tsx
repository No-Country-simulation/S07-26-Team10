"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getReferencesAction,
  deleteReferenceAction,
} from "../../actions/references-actions";
import { getSectionsAction } from "../../actions/sections-actions";
import type { ReferenceItem } from "../../schemas/reference-schema";
import type { SectionItem } from "../../schemas/section-schema";
import { useVersion } from "@/features/admin/context";
import { BookOpen, ExternalLink } from "lucide-react";

export function ReferencesManagementSkeleton() {
  return (
    <div>
      {/* ── Encabezado y Breadcrumb ────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
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
          }}
        />
        <span>Módulo de citación</span>
      </div>

      {/* ── Título Principal, Subtítulo y Botón ─────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "20px",
          margin: "16px 0 28px",
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
            Administrar referencias
          </h1>
          <p
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "15px",
              color: "#706f6f",
              marginTop: "8px",
              maxWidth: "74ch",
              lineHeight: 1.45,
              letterSpacing: "-0.01em",
            }}
          >
            Las fuentes bibliográficas del informe. Garantizan la trazabilidad de
            todo lo que se afirma.
          </p>
        </div>

        <div className="b pri" style={{ opacity: 0.6, cursor: "default" }}>
          <svg
            viewBox="0 0 24 24"
            style={{
              width: 15,
              height: 15,
              stroke: "#ffffff",
              fill: "none",
              strokeWidth: 2,
            }}
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>Nueva referencia</span>
        </div>
      </div>

      {/* ── Dos Tarjetas Superiores (.two) ──────────────────────────── */}
      <div
        className="two"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
          marginBottom: "28px",
        }}
      >
        <div className="card admin-card" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #ebebeb",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "17px",
                fontWeight: 500,
                color: "#08090a",
                margin: 0,
              }}
            >
              Formato
            </h3>
          </div>
          <div style={{ padding: "20px" }}>
            <p
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "14px",
                color: "#6f6f6f",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              APA 7. El sistema genera las citas en el texto según el orden de
              esta tabla.
            </p>
          </div>
        </div>

        <div className="card admin-card" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #ebebeb",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "17px",
                fontWeight: 500,
                color: "#08090a",
                margin: 0,
              }}
            >
              Cobertura
            </h3>
          </div>
          <div
            style={{
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #ebebeb",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                  fontSize: "14px",
                  color: "#08090a",
                }}
              >
                Entradas que citan una fuente
              </span>
              <Skeleton className="h-4 w-12 rounded-sm" />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                  fontSize: "14px",
                  color: "#08090a",
                }}
              >
                Fuentes de contexto
              </span>
              <Skeleton className="h-4 w-8 rounded-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabla de Referencias Skeleton ───────────────────────────── */}
      <div className="card admin-card" style={{ overflow: "hidden" }}>
        <div style={{ width: "100%", overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: "70px", textAlign: "left" }}>Orden</th>
                <th style={{ textAlign: "left" }}>Referencia</th>
                <th style={{ width: "170px", textAlign: "left" }}>
                  Organización / Fuente
                </th>
                <th style={{ width: "85px", textAlign: "left" }}>Año</th>
                <th
                  style={{
                    width: "92px",
                    textAlign: "right",
                    paddingRight: "20px",
                  }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i}>
                  <td className="mono">
                    <Skeleton className="h-4 w-6 rounded-sm" />
                  </td>
                  <td>
                    <Skeleton className="h-4 w-48 rounded-sm mb-1.5" />
                    <Skeleton className="h-3 w-32 rounded-sm" />
                  </td>
                  <td>
                    <Skeleton className="h-4 w-20 rounded-sm" />
                  </td>
                  <td>
                    <Skeleton className="h-4 w-10 rounded-sm" />
                  </td>
                  <td
                    className="act"
                    style={{ paddingRight: "20px", textAlign: "right" }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Skeleton className="h-7 w-7 rounded-md" />
                      <Skeleton className="h-7 w-7 rounded-md" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ReferencesManagement() {
  const t = useTranslations("AdminPage.references");
  const { activeReportId, activeVersionId, activeReportVersion } = useVersion();
  const targetVersionId =
    activeReportVersion?.id || activeVersionId || activeReportId;

  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [referenceToDelete, setReferenceToDelete] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!targetVersionId) {
        setReferences([]);
        setSections([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [refData, sectionsData] = await Promise.all([
          getReferencesAction(targetVersionId),
          getSectionsAction(targetVersionId),
        ]);
        const sortedRefs = [...refData].sort(
          (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
        );
        setReferences(sortedRefs);
        setSections(sectionsData);
      } catch (err) {
        console.error("Failed to load references data", err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [targetVersionId]);

  const confirmDelete = async () => {
    if (!referenceToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const targetRef = references.find((r) => r.id === referenceToDelete);
      const versionId =
        targetRef?.report_version_id ||
        targetRef?.report_id ||
        targetVersionId ||
        undefined;
      const res = await deleteReferenceAction(referenceToDelete, versionId);
      if (res.success) {
        setReferences((prev) =>
          prev.filter((r) => r.id !== referenceToDelete),
        );
        setReferenceToDelete(null);
      } else {
        setDeleteError(res.message || "Error al eliminar la referencia.");
      }
    } catch (err) {
      console.error("Failed to delete reference", err);
      setDeleteError("Error al eliminar la referencia.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Cobertura: Entradas que citan fuentes vs Total de secciones
  const totalSections = sections.length;
  const citedCount = Math.min(references.length, totalSections);

  return (
    <div>
      {/* ── Encabezado y Breadcrumb (.eyebrow del prototipo) ────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
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
        <span>{t("headerTag")}</span>
      </div>

      {/* ── Título Principal, Subtítulo y Botón Nueva Referencia (.mh) ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "20px",
          margin: "16px 0 28px",
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
            {t("title")}
          </h1>
          <p
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "15px",
              color: "#706f6f",
              marginTop: "8px",
              maxWidth: "74ch",
              lineHeight: 1.45,
              letterSpacing: "-0.01em",
            }}
          >
            {t("subtitle")}
          </p>
        </div>

        <Link
          href={`/admin/references/new${
            targetVersionId ? `?reportId=${targetVersionId}` : ""
          }`}
          className="b pri"
          style={{ textDecoration: "none" }}
        >
          <svg
            viewBox="0 0 24 24"
            style={{
              width: 15,
              height: 15,
              stroke: "#ffffff",
              fill: "none",
              strokeWidth: 2,
            }}
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>{t("newReferenceBtn")}</span>
        </Link>
      </div>

      {/* ── Banner de Error al Eliminar ────────────────────────────── */}
      {deleteError && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
            fontSize: "13.5px",
            border: "1px solid rgba(179,38,30,.25)",
            borderLeft: "3px solid #b3261e",
            background: "rgba(179,38,30,.04)",
            color: "#b3261e",
          }}
        >
          {deleteError}
        </div>
      )}

      {/* ── Dos Tarjetas Superiores: Formato y Cobertura (.two) ──────── */}
      <div
        className="two"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
          marginBottom: "28px",
        }}
      >
        {/* Tarjeta 1: Formato (Texto 100% estático) */}
        <div className="card admin-card" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #ebebeb",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "17px",
                fontWeight: 500,
                color: "#08090a",
                margin: 0,
              }}
            >
              {t("formatTitle")}
            </h3>
          </div>
          <div style={{ padding: "20px" }}>
            <p
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "14px",
                color: "#6f6f6f",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {t("formatDesc")}
            </p>
          </div>
        </div>

        {/* Tarjeta 2: Cobertura (Labels estáticos + datos dinámicos) */}
        <div className="card admin-card" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #ebebeb",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "17px",
                fontWeight: 500,
                color: "#08090a",
                margin: 0,
              }}
            >
              {t("coverageTitle")}
            </h3>
          </div>
          <div
            style={{
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #ebebeb",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                  fontSize: "14px",
                  color: "#08090a",
                }}
              >
                {t("coverageCitingEntries")}
              </span>
              {loading ? (
                <Skeleton className="h-4 w-14 rounded-sm" />
              ) : (
                <span
                  className="mono"
                  style={{
                    fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                    fontSize: "13px",
                    color: "#00603a",
                    fontWeight: 500,
                  }}
                >
                  {citedCount} {t("of")} {totalSections}
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                  fontSize: "14px",
                  color: "#08090a",
                }}
              >
                {t("coverageContextSources")}
              </span>
              {loading ? (
                <Skeleton className="h-4 w-8 rounded-sm" />
              ) : (
                <span
                  className="mono"
                  style={{
                    fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                    fontSize: "13px",
                    color: "#08090a",
                    fontWeight: 500,
                  }}
                >
                  {references.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabla Principal de Referencias (.card + .tbl) ───────────── */}
      {!targetVersionId && !loading ? (
        <div
          className="card admin-card"
          style={{
            padding: "56px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(0,96,58,.08)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 14px",
              color: "#00603a",
            }}
          >
            <BookOpen style={{ width: 24, height: 24 }} />
          </div>
          <p
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "16px",
              fontWeight: 500,
              color: "#08090a",
              margin: 0,
            }}
          >
            {t("noActiveReport")}
          </p>
        </div>
      ) : (
        <div className="card admin-card" style={{ overflow: "hidden" }}>
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: "70px", textAlign: "left" }}>
                    {t("colOrder")}
                  </th>
                  <th style={{ textAlign: "left" }}>{t("colReference")}</th>
                  <th style={{ width: "170px", textAlign: "left" }}>
                    {t("colOrganisation")}
                  </th>
                  <th style={{ width: "85px", textAlign: "left" }}>
                    {t("colYear")}
                  </th>
                  <th
                    style={{
                      width: "92px",
                      textAlign: "right",
                      paddingRight: "20px",
                    }}
                  >
                    {t("colActions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4].map((i) => (
                    <tr key={i}>
                      <td className="mono">
                        <Skeleton className="h-4 w-6 rounded-sm" />
                      </td>
                      <td>
                        <Skeleton className="h-4 w-44 rounded-sm mb-1.5" />
                        <Skeleton className="h-3 w-28 rounded-sm" />
                      </td>
                      <td>
                        <Skeleton className="h-4 w-20 rounded-sm" />
                      </td>
                      <td>
                        <Skeleton className="h-4 w-10 rounded-sm" />
                      </td>
                      <td
                        className="act"
                        style={{ paddingRight: "20px", textAlign: "right" }}
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Skeleton className="h-7 w-7 rounded-md" />
                          <Skeleton className="h-7 w-7 rounded-md" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : references.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div
                        style={{
                          padding: "36px 24px",
                          textAlign: "center",
                          fontFamily:
                            "var(--f, 'Inter Tight', system-ui, sans-serif)",
                          fontSize: "13.5px",
                          color: "#6f6f6f",
                        }}
                      >
                        {t("noReferences")}
                      </div>
                    </td>
                  </tr>
                ) : (
                  references.map((ref, idx) => {
                    const formattedOrder = String(
                      ref.display_order ?? idx + 1,
                    ).padStart(2, "0");
                    const subtitle =
                      ref.citation_url || ref.authors || "—";

                    return (
                      <tr key={ref.id}>
                        {/* Orden 2 dígitos en mono */}
                        <td
                          className="mono"
                          style={{
                            color: "#6f6f6f",
                            fontWeight: 500,
                            letterSpacing: ".04em",
                          }}
                        >
                          {formattedOrder}
                        </td>

                        {/* Nombre y URL/Autores */}
                        <td>
                          <div
                            style={{
                              fontFamily:
                                "var(--f, 'Inter Tight', system-ui, sans-serif)",
                              fontSize: "15px",
                              fontWeight: 500,
                              color: "#08090a",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {ref.title}
                          </div>
                          <div
                            style={{
                              fontFamily:
                                "var(--f, 'Inter Tight', system-ui, sans-serif)",
                              fontSize: "12.5px",
                              color: "#6f6f6f",
                              marginTop: "2px",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {subtitle}
                          </div>
                        </td>

                        {/* Organización / Fuente */}
                        <td
                          className="mono"
                          style={{
                            color: "#08090a",
                            fontSize: "13px",
                          }}
                        >
                          {ref.source || "—"}
                        </td>

                        {/* Año */}
                        <td
                          className="mono"
                          style={{
                            color: "#08090a",
                            fontSize: "13px",
                          }}
                        >
                          {ref.year || "—"}
                        </td>

                        {/* Acciones: Estáticas y listas para click */}
                        <td
                          className="act"
                          style={{
                            paddingRight: "20px",
                            textAlign: "right",
                          }}
                        >
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {ref.citation_url && (
                              <a
                                href={ref.citation_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="b icon ghost"
                                title={ref.citation_url}
                              >
                                <ExternalLink
                                  style={{ width: 14, height: 14 }}
                                />
                              </a>
                            )}
                            <Link
                              href={`/admin/references/${ref.id}`}
                              className="b icon ghost"
                              title={t("editTooltip")}
                            >
                              <svg viewBox="0 0 24 24">
                                <path d="M4 20h4l10-10-4-4L4 16z" />
                              </svg>
                            </Link>
                            <button
                              type="button"
                              onClick={() => setReferenceToDelete(ref.id || null)}
                              className="b icon danger"
                              title={t("deleteTooltip")}
                            >
                              <svg viewBox="0 0 24 24">
                                <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Nota Editorial (.quote del prototipo) ───────────────────── */}
      <div
        style={{
          borderLeft: "2px solid #00603a",
          padding: "4px 0 4px 16px",
          marginTop: "28px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
            fontSize: "11px",
            letterSpacing: ".07em",
            textTransform: "uppercase",
            color: "#00603a",
            display: "block",
            marginBottom: "4px",
          }}
        >
          {t("quoteTag")}
        </span>
        <p
          style={{
            fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
            fontSize: "13.5px",
            color: "#404040",
            lineHeight: 1.5,
            margin: "0 0 4px 0",
          }}
        >
          {t("quoteNote")}
        </p>
        <cite
          style={{
            fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
            fontStyle: "normal",
            fontSize: "11.5px",
            color: "#6f6f6f",
            letterSpacing: ".04em",
            textTransform: "uppercase",
          }}
        >
          {t("quoteAuthor")}
        </cite>
      </div>

      {/* ── Modal de Confirmación para Eliminar Referencia ─────────── */}
      {referenceToDelete && (
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
              maxWidth: "440px",
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
              {t("deleteModalTitle")}
            </h3>
            <p
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "13.5px",
                color: "#706f6f",
                margin: "0 0 20px 0",
                lineHeight: 1.45,
              }}
            >
              {t("deleteModalDesc")}
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
                onClick={() => setReferenceToDelete(null)}
                disabled={isDeleting}
                className="b sec sm"
                style={{ height: "34px", padding: "0 14px" }}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={isDeleting}
                className="b pri sm"
                style={{
                  height: "34px",
                  padding: "0 14px",
                  background: "#b3261e",
                  borderColor: "#b3261e",
                }}
              >
                {isDeleting ? t("deleting") : t("deleteConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReferencesManagement;
