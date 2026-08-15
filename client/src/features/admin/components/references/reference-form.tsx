"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { ReferenceItem } from "../../schemas/reference-schema";
import {
  createReferenceAction,
  updateReferenceAction,
} from "../../actions/references-actions";
import { useVersion } from "@/context/version-context";

interface ReferenceFormProps {
  initialData?: ReferenceItem;
  isEditMode?: boolean;
  preselectedReportId?: string;
}

export function ReferenceForm({
  initialData,
  isEditMode = false,
  preselectedReportId,
}: ReferenceFormProps) {
  const t = useTranslations("AdminPage.references.referenceForm");
  const tRoot = useTranslations("AdminPage.references");
  const router = useRouter();
  const { activeReportId, activeReportVersion, reportVersions } = useVersion();

  const [reportId, setReportId] = useState(
    () =>
      initialData?.report_version_id ||
      initialData?.report_id ||
      preselectedReportId ||
      activeReportVersion?.id ||
      activeReportId ||
      reportVersions?.[0]?.id ||
      "",
  );
  const [authors, setAuthors] = useState(initialData?.authors || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [year, setYear] = useState<number>(
    initialData?.year || new Date().getFullYear(),
  );
  const [source, setSource] = useState(initialData?.source || "");
  const [citationUrl, setCitationUrl] = useState(
    initialData?.citation_url || "",
  );
  const [displayOrder, setDisplayOrder] = useState<number>(
    initialData?.display_order ?? 1,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const reportOptions = React.useMemo(() => {
    if (reportVersions && reportVersions.length > 0) {
      return reportVersions.map((v) => ({
        id: v.id,
        title: `${v.title} (${v.version})`,
      }));
    }
    return [];
  }, [reportVersions]);

  const [autoOrder, setAutoOrder] = useState<boolean>(
    !isEditMode && initialData?.display_order === undefined,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (isEditMode && initialData?.id) {
        const res = await updateReferenceAction(
          initialData.id,
          {
            authors,
            title,
            year: Number(year),
            source,
            citation_url: citationUrl,
            ...(autoOrder ? {} : { display_order: Number(displayOrder) }),
          },
          reportId,
        );

        if (res.success) {
          setFeedback({
            type: "success",
            message: res.message || "Referencia actualizada exitosamente.",
          });
          setTimeout(() => {
            router.push("/admin/references");
            router.refresh();
          }, 800);
        } else {
          setFeedback({
            type: "error",
            message: res.message || "Error al actualizar la referencia.",
          });
        }
      } else {
        if (!reportId) {
          setFeedback({
            type: "error",
            message: "Debe seleccionar un reporte obligatoriamente.",
          });
          setIsSubmitting(false);
          return;
        }

        const res = await createReferenceAction({
          report_version_id: reportId,
          report_id: reportId,
          authors,
          title,
          year: Number(year),
          source,
          citation_url: citationUrl,
          ...(autoOrder ? {} : { display_order: Number(displayOrder) }),
        });

        if (res.success) {
          setFeedback({
            type: "success",
            message: res.message || "Referencia creada exitosamente.",
          });
          setTimeout(() => {
            router.push("/admin/references");
            router.refresh();
          }, 800);
        } else {
          setFeedback({
            type: "error",
            message: res.message || "Error al crear la referencia.",
          });
        }
      }
    } catch (err) {
      console.error("Error saving reference:", err);
      setFeedback({
        type: "error",
        message: "Ocurrió un error inesperado al guardar la referencia.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate>
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
            href="/admin/references"
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

          {/* Botones de Acción Superiores */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link href="/admin/references" className="b sec">
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
              <span>{isSubmitting ? t("saving") : t("saveReference")}</span>
            </button>
          </div>
        </div>

        {/* ── Banners de Feedback ───────────────────────────────────── */}
        {feedback && (
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
              border:
                feedback.type === "success"
                  ? "1px solid rgba(0,96,58,.25)"
                  : "1px solid rgba(179,38,30,.28)",
              borderLeft:
                feedback.type === "success"
                  ? "3px solid #00603a"
                  : "3px solid #b3261e",
              background:
                feedback.type === "success"
                  ? "rgba(0,96,58,.04)"
                  : "rgba(179,38,30,.04)",
              color: feedback.type === "success" ? "#00603a" : "#b3261e",
            }}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 style={{ width: 18, height: 18, flexShrink: 0 }} />
            ) : (
              <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* ── Grid Principal de Formulario ─────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Columna Izquierda: Parámetros de la Referencia (8 cols) */}
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
                {/* Reporte asociado */}
                <div>
                  <label
                    htmlFor="reference-report"
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
                    {t("reportLabel")}{" "}
                    <span style={{ color: "#b3261e" }}>*</span>
                  </label>
                  <select
                    id="reference-report"
                    value={reportId}
                    onChange={(e) => setReportId(e.target.value)}
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
                  >
                    <option value="">{t("reportPlaceholder")}</option>
                    {reportOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Autores */}
                <div>
                  <label
                    htmlFor="reference-authors"
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
                    {t("authorsLabel")}{" "}
                    <span style={{ color: "#b3261e" }}>*</span>
                  </label>
                  <input
                    id="reference-authors"
                    value={authors}
                    onChange={(e) => setAuthors(e.target.value)}
                    placeholder={t("authorsPlaceholder")}
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
                </div>

                {/* Título de la publicación */}
                <div>
                  <label
                    htmlFor="reference-title"
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
                    id="reference-title"
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
                </div>

                {/* Año y Organización / Fuente */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label
                      htmlFor="reference-year"
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
                      {t("yearLabel")}{" "}
                      <span style={{ color: "#b3261e" }}>*</span>
                    </label>
                    <input
                      id="reference-year"
                      type="number"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      required
                      min={1900}
                      max={2100}
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 13px",
                        border: "1px solid #ebebeb",
                        borderRadius: "8px",
                        background: "#ffffff",
                        fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                        fontSize: "14px",
                        color: "#08090a",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reference-source"
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
                      {t("sourceLabel")}{" "}
                      <span style={{ color: "#b3261e" }}>*</span>
                    </label>
                    <input
                      id="reference-source"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder={t("sourcePlaceholder")}
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
                  </div>
                </div>

                {/* URL de Citación */}
                <div>
                  <label
                    htmlFor="reference-url"
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
                    {t("citationUrlLabel")}
                  </label>
                  <input
                    id="reference-url"
                    value={citationUrl}
                    onChange={(e) => setCitationUrl(e.target.value)}
                    placeholder="https://doi.org/... o URL web"
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 13px",
                      border: "1px solid #ebebeb",
                      borderRadius: "8px",
                      background: "#ffffff",
                      fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                      fontSize: "13px",
                      color: "#08090a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
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
                    {t("citationUrlHelper")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Orden y Guía Editorial (4 cols) */}
          <div
            style={{
              gridColumn: "span 4",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
            className="col-span-12 lg:col-span-4"
          >
            {/* Card: Orden de Cita */}
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
                  {t("orderLabel")}
                </h3>
              </div>

              <div
                style={{
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {/* Switch Auto-Order */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <label
                    style={{
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#08090a",
                    }}
                  >
                    {t("autoOrderLabel")}
                  </label>
                  <Switch
                    checked={autoOrder}
                    onCheckedChange={setAutoOrder}
                  />
                </div>

                {autoOrder ? (
                  <p
                    style={{
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "12.5px",
                      color: "#6f6f6f",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {t("autoOrderNotice")}
                  </p>
                ) : (
                  <div>
                    <input
                      type="number"
                      min={1}
                      value={displayOrder}
                      onChange={(e) =>
                        setDisplayOrder(parseInt(e.target.value) || 1)
                      }
                      style={{
                        width: "100%",
                        height: "38px",
                        padding: "0 12px",
                        border: "1px solid #ebebeb",
                        borderRadius: "8px",
                        background: "#ffffff",
                        fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                        fontSize: "13.5px",
                        color: "#08090a",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Nota editorial APA 7 (.quote) */}
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
                Formato APA 7
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
                El orden de esta tabla define la numeración y citas dentro del
                texto del reporte. Se recomienda mantener consistencia en los
                nombres de autores y fuentes.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ReferenceForm;
