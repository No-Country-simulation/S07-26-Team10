"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { BaseReport, ReportVersion } from "../../schemas/report-schema";
import {
  createReportAction,
  getReportsAction,
  createReportVersionAction,
  updateReportVersionAction,
} from "../../actions/reports-actions";
import { MDXEditorComponent } from "@/features/admin/components/ui/mdx/mdx-editor-component";
import { MdxPreview } from "@/features/admin/components/ui/mdx/mdx-preview";
import { useLanguage } from "@/context/language-context";
import { useVersion } from "@/context/version-context";

interface ReportFormProps {
  initialData?: ReportVersion;
  isEditMode?: boolean;
}

const parseInitialVersion = (initialVersion?: string) => {
  if (!initialVersion) return "1";
  const sanitized = initialVersion.replace(/[^0-9]/g, "");
  return sanitized || "1";
};

export function ReportForm({
  initialData,
  isEditMode = false,
}: ReportFormProps) {
  const t = useTranslations("AdminPage.reports.reportForm");
  const tRoot = useTranslations("AdminPage.reports");
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedReportId = searchParams?.get("reportId");

  const { language: currentContextLang } = useLanguage();
  const { contentLanguage, refreshReports } = useVersion();

  const [availableBaseReports, setAvailableBaseReports] = useState<
    BaseReport[]
  >([]);
  const [selectedReportId, setSelectedReportId] = useState<string>("new");

  const [versionNumber, setVersionNumber] = useState<string>(
    parseInitialVersion(initialData?.version),
  );
  const [language, setLanguage] = useState<"ES" | "EN">(
    isEditMode
      ? (initialData?.language as "ES" | "EN") || "ES"
      : (contentLanguage.toUpperCase() as "ES" | "EN") ||
          (currentContextLang.toUpperCase() as "ES" | "EN") ||
          "ES",
  );
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initialData?.status || "DRAFT",
  );

  const cleanVer = versionNumber.replace(/[^0-9]/g, "");
  const formattedVersion = `v${cleanVer || "1"}`;
  const [title, setTitle] = useState(initialData?.title || "");

  const [summary, setSummary] = useState(initialData?.summary || "");
  const [citationText, setCitationText] = useState(
    initialData?.citation_text || "",
  );
  const [summaryTab, setSummaryTab] = useState<"editor" | "preview">("editor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function loadBaseReports() {
      try {
        const reports = await getReportsAction();
        setAvailableBaseReports(reports);
        if (!isEditMode) {
          if (
            preselectedReportId &&
            reports.some((r) => r.id === preselectedReportId)
          ) {
            setSelectedReportId(preselectedReportId);
          } else if (reports.length > 0) {
            setSelectedReportId(reports[0].id);
          } else {
            setSelectedReportId("new");
          }
        }
      } catch (err) {
        console.error("Failed to load base reports for version form", err);
      }
    }
    void loadBaseReports();
  }, [isEditMode, preselectedReportId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccessMsg("");

    const validationErrors: Record<string, string[]> = {};
    if (!title.trim()) {
      validationErrors.title = ["El título es obligatorio."];
    }
    if (!summary.trim()) {
      validationErrors.summary = ["El resumen ejecutivo es obligatorio."];
    }
    if (!citationText.trim()) {
      validationErrors.citation_text = ["El texto de citación es obligatorio."];
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditMode && initialData?.id) {
        const res = await updateReportVersionAction(
          initialData.report_id,
          initialData.id,
          {
            title,
            summary,
            citation_text: citationText,
            status,
          },
        );

        if (res.success) {
          setSuccessMsg("Versión actualizada correctamente.");
          await refreshReports();
          setTimeout(() => {
            router.push("/admin/reports");
            router.refresh();
          }, 800);
        } else {
          if (res.errors) setErrors(res.errors);
          else
            setErrors({
              global: [res.message || "Error al actualizar la versión."],
            });
        }
      } else {
        let parentReportId = selectedReportId;

        if (selectedReportId === "new") {
          const createBaseRes = await createReportAction();

          if (!createBaseRes.success || !createBaseRes.data?.id) {
            setErrors({
              global: [
                createBaseRes.message ||
                  "No se pudo crear el contenedor de Reporte Base.",
              ],
            });
            setIsSubmitting(false);
            return;
          }
          parentReportId = createBaseRes.data.id;
        }

        const res = await createReportVersionAction(parentReportId, {
          version: formattedVersion,
          title,
          summary,
          citation_text: citationText,
          language,
          status,
        });

        if (res.success) {
          setSuccessMsg("Versión creada exitosamente.");
          await refreshReports();
          setTimeout(() => {
            router.push("/admin/reports");
            router.refresh();
          }, 800);
        } else {
          if (res.errors) setErrors(res.errors);
          else
            setErrors({
              global: [res.message || "Error al crear la versión."],
            });
        }
      }
    } catch (err) {
      console.error("Error submitting report version form:", err);
      setErrors({
        global: ["Ocurrió un error inesperado al guardar la versión."],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
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
          <span>{tRoot("headerTag")}</span>
          <span style={{ color: "#a8a8a8" }}>/</span>
          <Link
            href="/admin/reports"
            style={{
              color: "#6f6f6f",
              textDecoration: "none",
              transition: "color .16s",
            }}
          >
            {t("breadcrumbBase")}
          </Link>
          <span style={{ color: "#a8a8a8" }}>/</span>
          <span style={{ color: "#08090a", fontWeight: 500 }}>
            {isEditMode ? t("breadcrumbEdit") : t("breadcrumbNew")}
          </span>
        </div>

        {/* ── Título, Subtítulo y Botones de Acción (.mh del prototipo) ── */}
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
              {isEditMode ? t("editTitle", { title }) : t("createTitle")}
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

          {/* Botones Superiores */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link href="/admin/reports" className="b sec">
              {t("cancel")}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="b pri"
              style={{
                background: "#00603a",
                borderColor: "#00603a",
                color: "#ffffff",
              }}
            >
              {isSubmitting ? (
                <Loader2
                  style={{
                    width: 15,
                    height: 15,
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
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
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              )}
              <span>{isSubmitting ? t("saving") : t("saveReport")}</span>
            </button>
          </div>
        </div>

        {/* ── Banners de Error y Éxito ──────────────────────────────── */}
        {successMsg && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "13.5px",
              border: "1px solid rgba(0,96,58,.25)",
              borderLeft: "3px solid #00603a",
              background: "rgba(0,96,58,.04)",
              color: "#00603a",
            }}
          >
            <CheckCircle2 style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {errors.global && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "13.5px",
              border: "1px solid rgba(179,38,30,.28)",
              borderLeft: "3px solid #b3261e",
              background: "rgba(179,38,30,.04)",
              color: "#b3261e",
            }}
          >
            <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{errors.global.join(", ")}</span>
          </div>
        )}

        {/* ── Grid Principal de Formulario (8 cols + 4 cols) ─────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Columna Izquierda: Parámetros del Reporte (8 cols) */}
          <div
            style={{
              gridColumn: "span 8",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
            className="col-span-12 lg:col-span-8"
          >
            <div className="card admin-card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  padding: "15px 20px",
                  borderBottom: "1px solid #ebebeb",
                }}
              >
                <h3
                  style={{
                    fontFamily:
                      "var(--f, 'Inter Tight', system-ui, sans-serif)",
                    fontSize: "17px",
                    fontWeight: 500,
                    color: "#08090a",
                    margin: 0,
                  }}
                >
                  {t("cardTitle")}
                </h3>
              </div>

              <div
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                {/* Contenedor Reporte Base */}
                {!isEditMode && (
                  <div>
                    <label
                      htmlFor="base-report"
                      style={{
                        display: "block",
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "14px",
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                        color: "#00603a",
                        marginBottom: "6px",
                      }}
                    >
                      {t("baseReportLabel")}{" "}
                      <span style={{ color: "#b3261e" }}>*</span>
                    </label>
                    <select
                      id="base-report"
                      value={selectedReportId}
                      onChange={(e) => setSelectedReportId(e.target.value)}
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 13px",
                        border: "1px solid #ebebeb",
                        borderRadius: "8px",
                        background: "#ffffff",
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "14px",
                        color: "#08090a",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="new">{t("newBaseReportOption")}</option>
                      {availableBaseReports.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.slug}
                        </option>
                      ))}
                    </select>
                    <p
                      style={{
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "12px",
                        color: "#6f6f6f",
                        marginTop: "6px",
                        margin: "6px 0 0",
                      }}
                    >
                      {selectedReportId === "new"
                        ? t("newBaseReportNotice")
                        : t("existingBaseReportNotice")}
                    </p>
                  </div>
                )}

                {/* Título de la Versión / Reporte */}
                <div>
                  <label
                    htmlFor="report-title"
                    style={{
                      display: "block",
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "14px",
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      color: "#00603a",
                      marginBottom: "6px",
                    }}
                  >
                    {t("titleLabel")}{" "}
                    <span style={{ color: "#b3261e" }}>*</span>
                  </label>
                  <input
                    id="report-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("titlePlaceholder")}
                    required
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 13px",
                      border: "1px solid #ebebeb",
                      borderRadius: "8px",
                      background: "#ffffff",
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "14px",
                      color: "#08090a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {errors.title && (
                    <p
                      style={{
                        color: "#b3261e",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.title[0]}
                    </p>
                  )}
                </div>

                {/* Resumen Ejecutivo (Con tabs de Editor y Preview sobre fondo blanco) */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <label
                      style={{
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "14px",
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                        color: "#00603a",
                      }}
                    >
                      {t("summaryLabel")}{" "}
                      <span style={{ color: "#b3261e" }}>*</span>
                    </label>

                    {/* Tabs Editor / Preview */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                        background: "#ebebeb",
                        padding: "2px",
                        borderRadius: "6px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSummaryTab("editor")}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "4px",
                          border: "none",
                          fontFamily:
                            "var(--f, 'Inter Tight', system-ui, sans-serif)",
                          fontSize: "12px",
                          fontWeight: summaryTab === "editor" ? 500 : 400,
                          background:
                            summaryTab === "editor"
                              ? "#ffffff"
                              : "transparent",
                          color:
                            summaryTab === "editor"
                              ? "#08090a"
                              : "#6f6f6f",
                          cursor: "pointer",
                        }}
                      >
                        {t("tabEditor")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSummaryTab("preview")}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "4px",
                          border: "none",
                          fontFamily:
                            "var(--f, 'Inter Tight', system-ui, sans-serif)",
                          fontSize: "12px",
                          fontWeight: summaryTab === "preview" ? 500 : 400,
                          background:
                            summaryTab === "preview"
                              ? "#ffffff"
                              : "transparent",
                          color:
                            summaryTab === "preview"
                              ? "#08090a"
                              : "#6f6f6f",
                          cursor: "pointer",
                        }}
                      >
                        {t("tabPreview")}
                      </button>
                    </div>
                  </div>

                  {summaryTab === "editor" ? (
                    <div
                      style={{
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: errors.summary
                          ? "1px solid #b3261e"
                          : "1px solid #ebebeb",
                        background: "#ffffff",
                      }}
                    >
                      <MDXEditorComponent
                        markdown={summary}
                        onChange={setSummary}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "20px",
                        borderRadius: "8px",
                        border: "1px solid #ebebeb",
                        background: "#ffffff",
                        minHeight: "140px",
                      }}
                    >
                      <MdxPreview content={summary} />
                    </div>
                  )}
                  {errors.summary && (
                    <p
                      style={{
                        color: "#b3261e",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.summary[0]}
                    </p>
                  )}
                </div>

                {/* Texto de Citación */}
                <div>
                  <label
                    htmlFor="report-citation"
                    style={{
                      display: "block",
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "14px",
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      color: "#00603a",
                      marginBottom: "6px",
                    }}
                  >
                    {t("citationLabel")}{" "}
                    <span style={{ color: "#b3261e" }}>*</span>
                  </label>
                  <input
                    id="report-citation"
                    value={citationText}
                    onChange={(e) => setCitationText(e.target.value)}
                    placeholder={t("citationPlaceholder")}
                    required
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 13px",
                      border: errors.citation_text
                        ? "1px solid #b3261e"
                        : "1px solid #ebebeb",
                      borderRadius: "8px",
                      background: "#ffffff",
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "14px",
                      color: "#08090a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {errors.citation_text && (
                    <p
                      style={{
                        color: "#b3261e",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.citation_text[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Configuración de Versión (4 cols) */}
          <div
            style={{
              gridColumn: "span 4",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
            className="col-span-12 lg:col-span-4"
          >
            {/* Card: Configuración de Versión */}
            <div className="card admin-card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  padding: "15px 18px",
                  borderBottom: "1px solid #ebebeb",
                }}
              >
                <h3
                  style={{
                    fontFamily:
                      "var(--f, 'Inter Tight', system-ui, sans-serif)",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#08090a",
                    margin: 0,
                  }}
                >
                  {t("versionConfigTitle")}
                </h3>
              </div>

              <div
                style={{
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Número de Versión */}
                {!isEditMode ? (
                  <div>
                    <label
                      htmlFor="version-number"
                      style={{
                        display: "block",
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "13.5px",
                        fontWeight: 500,
                        color: "#00603a",
                        marginBottom: "6px",
                      }}
                    >
                      {t("versionLabel")}{" "}
                      <span style={{ color: "#b3261e" }}>*</span>
                    </label>
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: "12px",
                          fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                          fontSize: "13.5px",
                          color: "#6f6f6f",
                        }}
                      >
                        v
                      </span>
                      <input
                        id="version-number"
                        type="number"
                        min="1"
                        step="1"
                        value={cleanVer}
                        onChange={(e) => setVersionNumber(e.target.value)}
                        placeholder="1"
                        required
                        style={{
                          width: "100%",
                          height: "38px",
                          paddingLeft: "26px",
                          paddingRight: "12px",
                          border: "1px solid #ebebeb",
                          borderRadius: "8px",
                          background: "#ffffff",
                          fontFamily:
                            "var(--m, 'IBM Plex Mono', monospace)",
                          fontSize: "14px",
                          color: "#08090a",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "13.5px",
                        fontWeight: 500,
                        color: "#6f6f6f",
                        marginBottom: "4px",
                      }}
                    >
                      {t("versionLabel")}
                    </label>
                    <span
                      className="mono"
                      style={{
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "#00603a",
                      }}
                    >
                      {formattedVersion}
                    </span>
                  </div>
                )}

                {/* Idioma */}
                <div>
                  <label
                    htmlFor="report-lang"
                    style={{
                      display: "block",
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "13.5px",
                      fontWeight: 500,
                      color: "#00603a",
                      marginBottom: "6px",
                    }}
                  >
                    {t("langLabel")}
                  </label>
                  <select
                    id="report-lang"
                    value={language}
                    onChange={(e) =>
                      setLanguage(e.target.value as "ES" | "EN")
                    }
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 12px",
                      border: "1px solid #ebebeb",
                      borderRadius: "8px",
                      background: "#ffffff",
                      fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                      fontSize: "13px",
                      color: "#08090a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="ES">ES (Español)</option>
                    <option value="EN">EN (English)</option>
                  </select>
                </div>

                {/* Estado de Publicación */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <label
                      htmlFor="report-status"
                      style={{
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "13.5px",
                        fontWeight: 500,
                        color: "#00603a",
                      }}
                    >
                      {t("statusLabel")}
                    </label>
                    <span
                      className={
                        status === "PUBLISHED" ? "bg pub" : "bg draft"
                      }
                    >
                      {status === "PUBLISHED" ? "Publicada" : "Borrador"}
                    </span>
                  </div>
                  <select
                    id="report-status"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "DRAFT" | "PUBLISHED")
                    }
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 12px",
                      border: "1px solid #ebebeb",
                      borderRadius: "8px",
                      background: "#ffffff",
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "13.5px",
                      color: "#08090a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="DRAFT">{t("statusDraft")}</option>
                    <option value="PUBLISHED">{t("statusPublished")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Nota editorial (.quote) */}
            <div
              style={{
                borderLeft: "2px solid #00603a",
                padding: "2px 0 2px 14px",
                margin: "4px 0",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                  fontSize: "11px",
                  letterSpacing: ".07em",
                  textTransform: "uppercase",
                  color: "#00603a",
                  marginBottom: "4px",
                }}
              >
                Inmutabilidad de versiones
              </div>
              <p
                style={{
                  fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                  fontSize: "12.5px",
                  color: "#6f6f6f",
                  lineHeight: 1.45,
                  margin: 0,
                }}
              >
                Una versión publicada mantiene la integridad histórica de los
                datos. Para cambios estructurales posteriores, cree una nueva
                versión (ej. v2).
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ReportForm;
