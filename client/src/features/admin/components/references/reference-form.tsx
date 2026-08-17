"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import {
  referenceFormSchema,
  type ReferenceFormInput,
  type ReferenceItem,
} from "../../schemas/reference-schema";
import {
  createReferenceAction,
  updateReferenceAction,
} from "../../actions/references-actions";
import { useVersion } from "@/features/admin/context";

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

  const defaultReportId =
    initialData?.report_version_id ||
    initialData?.report_id ||
    preselectedReportId ||
    activeReportVersion?.id ||
    activeReportId ||
    reportVersions?.[0]?.id ||
    "";

  const [autoOrder, setAutoOrder] = useState<boolean>(
    !isEditMode && initialData?.display_order === undefined,
  );
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

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReferenceFormInput>({
    resolver: zodResolver(referenceFormSchema),
    defaultValues: {
      report_id: defaultReportId,
      authors: initialData?.authors || "",
      title: initialData?.title || "",
      year: initialData?.year || new Date().getFullYear(),
      source: initialData?.source || "",
      citation_url: initialData?.citation_url || "",
      display_order: initialData?.display_order ?? 1,
    },
  });

  const watchTitle = useWatch({ control, name: "title" });

  const onSubmit = async (values: ReferenceFormInput) => {
    setFeedback(null);

    try {
      if (isEditMode && initialData?.id) {
        const res = await updateReferenceAction(
          initialData.id,
          {
            authors: values.authors,
            title: values.title,
            year: values.year,
            source: values.source,
            citation_url: values.citation_url,
            ...(autoOrder ? {} : { display_order: values.display_order ?? 1 }),
          },
          values.report_id,
        );

        if (res.success) {
          setFeedback({
            type: "success",
            message: res.message || t("successUpdated"),
          });
          setTimeout(() => {
            router.push("/admin/references");
            router.refresh();
          }, 800);
        } else {
          setFeedback({
            type: "error",
            message: res.message || t("errorUpdate"),
          });
        }
      } else {
        if (!values.report_id) {
          setFeedback({
            type: "error",
            message: t("noReportSelected"),
          });
          return;
        }

        const res = await createReferenceAction({
          report_version_id: values.report_id,
          report_id: values.report_id,
          authors: values.authors,
          title: values.title,
          year: values.year,
          source: values.source,
          citation_url: values.citation_url,
          ...(autoOrder ? {} : { display_order: values.display_order ?? 1 }),
        });

        if (res.success) {
          setFeedback({
            type: "success",
            message: res.message || t("successCreated"),
          });
          setTimeout(() => {
            router.push("/admin/references");
            router.refresh();
          }, 800);
        } else {
          setFeedback({
            type: "error",
            message: res.message || t("errorCreate"),
          });
        }
      }
    } catch (err) {
      console.error("Error saving reference:", err);
      setFeedback({
        type: "error",
        message: t("errorGeneric"),
      });
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
              {isEditMode
                ? t("editTitle", {
                    title: watchTitle || initialData?.title || "",
                  })
                : t("createTitle")}
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

        {/* ── Grid Principal de Formulario (8 cols + 4 cols en desktop, 1 col en móvil) ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Parámetros de la Referencia (8 cols en desktop, full en móvil) */}
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-6 w-full min-w-0">
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
                    {...register("report_id")}
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 13px",
                      border: errors.report_id
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
                  >
                    <option value="">{t("reportPlaceholder")}</option>
                    {reportOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.title}
                      </option>
                    ))}
                  </select>
                  {errors.report_id && (
                    <p
                      style={{
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "12px",
                        color: "#b3261e",
                        marginTop: "5px",
                        margin: 0,
                      }}
                    >
                      {errors.report_id.message}
                    </p>
                  )}
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
                    {...register("authors")}
                    placeholder={t("authorsPlaceholder")}
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 13px",
                      border: errors.authors
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
                  {errors.authors && (
                    <p
                      style={{
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "12px",
                        color: "#b3261e",
                        marginTop: "5px",
                        margin: 0,
                      }}
                    >
                      {errors.authors.message}
                    </p>
                  )}
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
                    {...register("title")}
                    placeholder={t("titlePlaceholder")}
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 13px",
                      border: errors.title
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
                  {errors.title && (
                    <p
                      style={{
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "12px",
                        color: "#b3261e",
                        marginTop: "5px",
                        margin: 0,
                      }}
                    >
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Año y Organización / Fuente */}
                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">
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
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      {...register("year", {
                        valueAsNumber: true,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "");
                          const parsed = digitsOnly ? parseInt(digitsOnly, 10) : "";
                          setValue("year", parsed as number, { shouldValidate: true });
                        },
                      })}
                      onKeyDown={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          ![
                            "Backspace",
                            "Delete",
                            "Tab",
                            "ArrowLeft",
                            "ArrowRight",
                            "Home",
                            "End",
                          ].includes(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 13px",
                        border: errors.year
                          ? "1px solid #b3261e"
                          : "1px solid #ebebeb",
                        borderRadius: "8px",
                        background: "#ffffff",
                        fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                        fontSize: "14px",
                        color: "#08090a",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    {errors.year && (
                      <p
                        style={{
                          fontFamily:
                            "var(--f, 'Inter Tight', system-ui, sans-serif)",
                          fontSize: "12px",
                          color: "#b3261e",
                          marginTop: "5px",
                          margin: 0,
                        }}
                      >
                        {errors.year.message}
                      </p>
                    )}
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
                      {...register("source")}
                      placeholder={t("sourcePlaceholder")}
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 13px",
                        border: errors.source
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
                    {errors.source && (
                      <p
                        style={{
                          fontFamily:
                            "var(--f, 'Inter Tight', system-ui, sans-serif)",
                          fontSize: "12px",
                          color: "#b3261e",
                          marginTop: "5px",
                          margin: 0,
                        }}
                      >
                        {errors.source.message}
                      </p>
                    )}
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
                    {...register("citation_url")}
                    placeholder={t("citationUrlPlaceholder")}
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

          {/* Columna Derecha: Orden y Guía Editorial (4 cols en desktop, full en móvil) */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-5 w-full min-w-0">
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
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      {...register("display_order", {
                        valueAsNumber: true,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "");
                          const parsed = digitsOnly ? parseInt(digitsOnly, 10) : 1;
                          setValue("display_order", parsed, { shouldValidate: true });
                        },
                      })}
                      onKeyDown={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          ![
                            "Backspace",
                            "Delete",
                            "Tab",
                            "ArrowLeft",
                            "ArrowRight",
                            "Home",
                            "End",
                          ].includes(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      style={{
                        width: "100%",
                        height: "38px",
                        padding: "0 12px",
                        border: errors.display_order
                          ? "1px solid #b3261e"
                          : "1px solid #ebebeb",
                        borderRadius: "8px",
                        background: "#ffffff",
                        fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                        fontSize: "13.5px",
                        color: "#08090a",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    {errors.display_order && (
                      <p
                        style={{
                          fontFamily:
                            "var(--f, 'Inter Tight', system-ui, sans-serif)",
                          fontSize: "12px",
                          color: "#b3261e",
                          marginTop: "5px",
                          margin: 0,
                        }}
                      >
                        {errors.display_order.message}
                      </p>
                    )}
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
                {t("apaGuideTitle")}
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
                {t("apaGuideDesc")}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ReferenceForm;
