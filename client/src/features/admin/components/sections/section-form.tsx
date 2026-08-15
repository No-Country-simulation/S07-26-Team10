"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  sectionFormSchema,
  type SectionFormInput,
  type CreateSectionInput,
  type UpdateSectionInput,
  type SectionItem,
} from "../../schemas/section-schema";
import {
  createSectionAction,
  updateSectionAction,
  deleteSectionAction,
} from "../../actions/sections-actions";
import { MDXEditorComponent } from "@/features/admin/components/ui/mdx/mdx-editor-component";
import { MdxPreview } from "@/features/admin/components/ui/mdx/mdx-preview";
import { Switch } from "@/components/ui/switch";
import { useVersion } from "@/context/version-context";
import {
  getResourcesBySectionAction,
  deleteResourceAction,
} from "@/features/admin/actions/resources-actions";
import { getReferencesAction } from "@/features/admin/actions/references-actions";
import type { ResourceItem } from "@/features/admin/schemas/resource-schema";
import type { ReferenceItem } from "@/features/admin/schemas/reference-schema";
import {
  Copy,
  Pencil,
  Trash2,
  BookMarked,
  FolderPlus,
  Wand2,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface SectionFormProps {
  initialData?: SectionItem;
  isEditMode?: boolean;
}

export function SectionForm({
  initialData,
  isEditMode = false,
}: SectionFormProps) {
  const t = useTranslations("AdminPage.sectionForm");
  const router = useRouter();
  const {
    activeReportId,
    activeReport,
    activeReportVersion,
    activeVersionId,
    version,
    contentLanguage,
  } = useVersion();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Recursos y referencias asociadas
  const [sectionResources, setSectionResources] = useState<ResourceItem[]>([]);
  const [sectionReferences, setSectionReferences] = useState<ReferenceItem[]>(
    [],
  );

  useEffect(() => {
    if (initialData?.id) {
      void getResourcesBySectionAction(initialData.id).then(
        setSectionResources,
      );
    }
    const repId = initialData?.report_id || activeReportId;
    if (repId) {
      void getReferencesAction(repId).then(setSectionReferences);
    }
  }, [initialData?.id, initialData?.report_id, activeReportId]);

  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [isDeletingResource, setIsDeletingResource] = useState(false);

  const confirmDeleteResource = async () => {
    if (!resourceToDelete) return;
    setIsDeletingResource(true);
    try {
      const res = await deleteResourceAction(resourceToDelete);
      if (res.success) {
        setSectionResources((prev) =>
          prev.filter((r) => r.id !== resourceToDelete),
        );
        setResourceToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
    } finally {
      setIsDeletingResource(false);
    }
  };

  // Pestaña del contenido (Editor vs Vista previa)
  const [contentTab, setContentTab] = useState<"editor" | "preview">("editor");
  const [autoOrder, setAutoOrder] = useState<boolean>(
    !initialData?.display_order,
  );

  // Formulario react-hook-form
  const targetReportVersionId =
    activeReportVersion?.id ||
    activeVersionId ||
    initialData?.report_id ||
    activeReportId ||
    "";

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SectionFormInput>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      report_id: targetReportVersionId,
      title: initialData?.title || "",
      content: initialData?.content || "",
      display_order: initialData?.display_order ?? undefined,
      status: initialData?.status || "DRAFT",
      published: initialData?.published ?? true,
    },
  });

  const watchTitle = useWatch({ control, name: "title" });
  const watchContent = useWatch({ control, name: "content" });
  const watchDisplayOrder = useWatch({ control, name: "display_order" });
  const watchPublished = useWatch({ control, name: "published" });

  useEffect(() => {
    if (!isEditMode && targetReportVersionId) {
      setValue("report_id", targetReportVersionId, { shouldValidate: false });
    }
  }, [targetReportVersionId, isEditMode, setValue]);

  const onSubmit = async (values: SectionFormInput) => {
    setFeedback(null);

    try {
      const isPub = values.published ?? values.status === "PUBLISHED";
      const statusVal = isPub ? "PUBLISHED" : "DRAFT";

      if (isEditMode && initialData?.id) {
        const targetReportId =
          targetReportVersionId || initialData.report_id || "";
        const updateInput: UpdateSectionInput = {
          title: values.title,
          content: values.content,
          display_order: autoOrder ? undefined : (values.display_order ?? undefined),
          status: statusVal,
          published: isPub,
        };
        const res = await updateSectionAction(
          initialData.id,
          updateInput,
          targetReportId,
        );

        if (res.success) {
          setFeedback({
            type: "success",
            message: t("successUpdated", { title: values.title }),
          });
        } else {
          setFeedback({
            type: "error",
            message: res.message || t("genericError"),
          });
        }
      } else {
        if (!targetReportVersionId) {
          setFeedback({
            type: "error",
            message: t("noActiveReportWarning"),
          });
          return;
        }

        const createInput: CreateSectionInput = {
          report_id: targetReportVersionId,
          title: values.title,
          content: values.content,
          display_order: autoOrder ? undefined : (values.display_order ?? undefined),
          status: statusVal,
          published: isPub,
        };

        const res = await createSectionAction(createInput);
        if (res.success) {
          setFeedback({
            type: "success",
            message: t("successCreated", { title: values.title }),
          });
          setTimeout(() => {
            router.push("/admin/sections");
          }, 900);
        } else {
          setFeedback({
            type: "error",
            message: res.message || t("genericError"),
          });
        }
      }
    } catch {
      setFeedback({
        type: "error",
        message: t("genericError"),
      });
    }
  };

  const onError = (
    formErrors: Record<string, { message?: string } | undefined>,
  ) => {
    if (formErrors.title) {
      setFeedback({
        type: "error",
        message: formErrors.title.message ?? "El título es obligatorio.",
      });
    } else if (formErrors.content) {
      setFeedback({
        type: "error",
        message:
          formErrors.content.message ??
          "El contenido en markdown es obligatorio.",
      });
    } else {
      setFeedback({
        type: "error",
        message: t("genericError"),
      });
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;

    setIsDeleting(true);
    try {
      const targetReportId =
        targetReportVersionId || initialData.report_id || "";
      const res = await deleteSectionAction(initialData.id, targetReportId);

      if (res.success) {
        setShowDeleteDialog(false);
        router.push("/admin/sections");
      } else {
        setShowDeleteDialog(false);
        setFeedback({
          type: "error",
          message: res.message || "Error al eliminar la sección.",
        });
      }
    } catch {
      setShowDeleteDialog(false);
      setFeedback({
        type: "error",
        message: "Ocurrió un error al intentar eliminar la sección.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
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
          <span style={{ color: "#a8a8a8" }}>/</span>
          <Link
            href="/admin/sections"
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
              {isEditMode ? t("editSubtitle") : t("createSubtitle")}
            </p>
          </div>

          {/* Botones de acción superiores */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link href="/admin/sections" className="b sec">
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
              <span>
                {isSubmitting
                  ? t("saving")
                  : isEditMode
                    ? t("saveChanges")
                    : t("saveSection")}
              </span>
            </button>
          </div>
        </div>

        {/* ── Banner de Feedback ───────────────────────────────────── */}
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
              <CheckCircle2
                style={{
                  width: 18,
                  height: 18,
                  stroke: "#00603a",
                  flexShrink: 0,
                }}
              />
            ) : (
              <AlertCircle
                style={{
                  width: 18,
                  height: 18,
                  stroke: "#b3261e",
                  flexShrink: 0,
                }}
              />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* ── Layout Principal: 2 Columnas (8 cols + 4 cols) ────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Columna Izquierda: Formulario y Editor (8 cols) */}
          <div
            style={{
              gridColumn: "span 8",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
            className="col-span-12 lg:col-span-8"
          >
            {/* Card 01: Identificación y título */}
            <div className="card admin-card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  padding: "15px 20px",
                  borderBottom: "1px solid #ebebeb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
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
                    {t("card01Title")}
                  </h3>
                  <div
                    style={{
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "12.5px",
                      color: "#6f6f6f",
                      marginTop: "2px",
                    }}
                  >
                    {t("card01Desc")}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                {/* Título de la sección */}
                <div>
                  <label
                    htmlFor="title"
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
                    {t("sectionTitleLabel")}{" "}
                    <span style={{ color: "#b3261e" }}>*</span>
                  </label>
                  <input
                    id="title"
                    {...register("title")}
                    placeholder={t("sectionTitlePlaceholder")}
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
                      transition: "border-color .16s, box-shadow .16s",
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

                {/* Slug generado */}
                {isEditMode && initialData?.slug && (
                  <div>
                    <label
                      htmlFor="slug-display"
                      style={{
                        display: "block",
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#6f6f6f",
                        marginBottom: "6px",
                      }}
                    >
                      {t("slugLabel")} —{" "}
                      <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                        {t("slugAuto")}
                      </span>
                    </label>
                    <input
                      id="slug-display"
                      value={initialData.slug}
                      disabled
                      style={{
                        width: "100%",
                        height: "38px",
                        padding: "0 13px",
                        border: "1px solid #ebebeb",
                        borderRadius: "8px",
                        background: "#fafafa",
                        fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                        fontSize: "12.5px",
                        color: "#6f6f6f",
                        boxSizing: "border-box",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Card 02: Contenido Markdown / MDX */}
            <div className="card admin-card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  padding: "15px 20px",
                  borderBottom: "1px solid #ebebeb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
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
                    {t("card02Title")}
                  </h3>
                  <div
                    style={{
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "12.5px",
                      color: "#6f6f6f",
                      marginTop: "2px",
                    }}
                  >
                    {t("card02Desc")}
                  </div>
                </div>

                {/* Selector de Pestaña: Editor / Vista previa */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    background: "#f0f0f0",
                    padding: "3px",
                    borderRadius: "8px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setContentTab("editor")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "5px 12px",
                      borderRadius: "6px",
                      border: "none",
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "12.5px",
                      fontWeight: contentTab === "editor" ? 500 : 400,
                      background:
                        contentTab === "editor" ? "#ffffff" : "transparent",
                      color:
                        contentTab === "editor" ? "#08090a" : "#6f6f6f",
                      boxShadow:
                        contentTab === "editor"
                          ? "0 1px 3px rgba(0,0,0,0.08)"
                          : "none",
                      cursor: "pointer",
                      transition: "all .16s",
                    }}
                  >
                    <Wand2 style={{ width: 14, height: 14 }} />
                    <span>{t("tabEditor")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentTab("preview")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "5px 12px",
                      borderRadius: "6px",
                      border: "none",
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "12.5px",
                      fontWeight: contentTab === "preview" ? 500 : 400,
                      background:
                        contentTab === "preview" ? "#ffffff" : "transparent",
                      color:
                        contentTab === "preview" ? "#08090a" : "#6f6f6f",
                      boxShadow:
                        contentTab === "preview"
                          ? "0 1px 3px rgba(0,0,0,0.08)"
                          : "none",
                      cursor: "pointer",
                      transition: "all .16s",
                    }}
                  >
                    <Eye style={{ width: 14, height: 14 }} />
                    <span>{t("tabPreview")}</span>
                  </button>
                </div>
              </div>

              <div style={{ padding: "20px" }}>
                {contentTab === "editor" ? (
                  <MDXEditorComponent
                    markdown={watchContent || ""}
                    onChange={(val) =>
                      setValue("content", val, { shouldValidate: true })
                    }
                  />
                ) : (
                  <div
                    style={{
                      minHeight: "320px",
                      padding: "20px",
                      borderRadius: "8px",
                      background: "#ffffff",
                      border: "1px solid #ebebeb",
                    }}
                  >
                    <MdxPreview content={watchContent || ""} />
                  </div>
                )}
                {errors.content && (
                  <p
                    style={{
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "12px",
                      color: "#b3261e",
                      marginTop: "8px",
                      margin: 0,
                    }}
                  >
                    {errors.content.message}
                  </p>
                )}
              </div>
            </div>

            {/* Card 03: Recursos y Figuras Asociadas (solo en edición) */}
            {isEditMode ? (
              <div className="card admin-card" style={{ overflow: "hidden" }}>
                <div
                  style={{
                    padding: "15px 20px",
                    borderBottom: "1px solid #ebebeb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FolderPlus style={{ width: 18, height: 18, color: "#00603a" }} />
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
                      {t("resourcesTitle")}
                    </h3>
                  </div>
                  <Link
                    href={`/admin/resources/new?sectionId=${initialData?.id || ""}`}
                    className="b sec sm"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      textDecoration: "none",
                    }}
                  >
                    <FolderPlus style={{ width: 13, height: 13 }} />
                    <span>{t("addResourceBtn")}</span>
                  </Link>
                </div>

                <div style={{ padding: "16px 20px" }}>
                  {sectionResources.length === 0 ? (
                    <div
                      style={{
                        padding: "28px 16px",
                        textAlign: "center",
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "13px",
                        color: "#6f6f6f",
                        borderRadius: "8px",
                        border: "1px dashed #ebebeb",
                        background: "#fafafa",
                      }}
                    >
                      {t("noSectionResources")}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {sectionResources.map((res) => (
                        <div
                          key={res.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #ebebeb",
                            background: "#ffffff",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontFamily:
                                  "var(--f, 'Inter Tight', system-ui, sans-serif)",
                                fontSize: "13.5px",
                                fontWeight: 500,
                                color: "#08090a",
                              }}
                            >
                              {res.title}
                            </div>
                            <div
                              style={{
                                fontFamily:
                                  "var(--f, 'Inter Tight', system-ui, sans-serif)",
                                fontSize: "11.5px",
                                color: "#6f6f6f",
                                marginTop: "2px",
                              }}
                            >
                              {res.description || res.alt_text}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span className="bg soft">{res.type}</span>
                            {res.file_url && (
                              <button
                                type="button"
                                title={t("copyFileUrl")}
                                onClick={() => {
                                  void navigator.clipboard.writeText(
                                    res.file_url || "",
                                  );
                                }}
                                className="b icon ghost"
                              >
                                <Copy />
                              </button>
                            )}
                            {res.id && (
                              <Link
                                href={`/admin/resources/${res.id}`}
                                title={t("editResource")}
                                className="b icon ghost"
                              >
                                <Pencil />
                              </Link>
                            )}
                            {res.id && (
                              <button
                                type="button"
                                title={t("deleteResource")}
                                onClick={() => setResourceToDelete(res.id!)}
                                className="b icon danger"
                              >
                                <Trash2 />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: "12px",
                  border: "1px dashed #ebebeb",
                  background: "rgba(255,255,255,0.6)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontFamily:
                    "var(--f, 'Inter Tight', system-ui, sans-serif)",
                  fontSize: "13px",
                  color: "#6f6f6f",
                }}
              >
                <FolderPlus
                  style={{
                    width: 20,
                    height: 20,
                    color: "#00603a",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <strong style={{ color: "#08090a" }}>
                    {t("resourcesTitle")}:
                  </strong>{" "}
                  {t("saveFirstResourcesHint")}
                </div>
              </div>
            )}

            {/* Card 04: Referencias Bibliográficas Disponibles */}
            {isEditMode ? (
              <div className="card admin-card" style={{ overflow: "hidden" }}>
                <div
                  style={{
                    padding: "15px 20px",
                    borderBottom: "1px solid #ebebeb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <BookMarked
                      style={{ width: 18, height: 18, color: "#00603a" }}
                    />
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
                      {t("referencesTitle")}
                    </h3>
                  </div>
                  <Link
                    href={`/admin/references/new?reportId=${initialData?.report_id || activeReportId || ""}`}
                    className="b sec sm"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      textDecoration: "none",
                    }}
                  >
                    <BookMarked style={{ width: 13, height: 13 }} />
                    <span>{t("addReferenceBtn")}</span>
                  </Link>
                </div>

                <div style={{ padding: "16px 20px" }}>
                  {sectionReferences.length === 0 ? (
                    <div
                      style={{
                        padding: "28px 16px",
                        textAlign: "center",
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "13px",
                        color: "#6f6f6f",
                        borderRadius: "8px",
                        border: "1px dashed #ebebeb",
                        background: "#fafafa",
                      }}
                    >
                      {t("noSectionReferences")}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {sectionReferences.map((ref) => (
                        <div
                          key={ref.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #ebebeb",
                            background: "#ffffff",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontFamily:
                                  "var(--f, 'Inter Tight', system-ui, sans-serif)",
                                fontSize: "13px",
                                fontWeight: 500,
                                color: "#08090a",
                              }}
                            >
                              {ref.authors} ({ref.year})
                            </div>
                            <div
                              style={{
                                fontFamily:
                                  "var(--f, 'Inter Tight', system-ui, sans-serif)",
                                fontSize: "11.5px",
                                fontStyle: "italic",
                                color: "#00603a",
                                marginTop: "2px",
                              }}
                            >
                              {ref.title}
                            </div>
                          </div>
                          <span
                            style={{
                              fontFamily:
                                "var(--m, 'IBM Plex Mono', monospace)",
                              fontSize: "11px",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: "#f0f0f0",
                              color: "#6f6f6f",
                            }}
                          >
                            {ref.source}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Columna Derecha: Configuración Lateral (4 cols) */}
          <div
            style={{
              gridColumn: "span 4",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
            className="col-span-12 lg:col-span-4"
          >
            {/* Card: Configuración de Publicación y Estado */}
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
                  {t("configTitle")}
                </h3>
              </div>

              <div
                style={{
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                {/* Switch Estado de Publicación */}
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
                      style={{
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#08090a",
                      }}
                    >
                      {t("publicationLabel")}
                    </label>
                    <span className={watchPublished ? "bg pub" : "bg draft"}>
                      {watchPublished ? t("published") : t("draft")}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: "#fafafa",
                      border: "1px solid #ebebeb",
                    }}
                  >
                    <span
                      style={{
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "12.5px",
                        color: "#6f6f6f",
                      }}
                    >
                      {watchPublished ? t("published") : t("draft")}
                    </span>
                    <Switch
                      checked={watchPublished ?? false}
                      onCheckedChange={(checked) =>
                        setValue("published", checked, {
                          shouldValidate: true,
                        })
                      }
                    />
                  </div>
                </div>

                <div style={{ height: "1px", background: "#ebebeb" }} />

                {/* Orden en el informe */}
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
                      htmlFor="auto-order-switch"
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
                      id="auto-order-switch"
                      checked={autoOrder}
                      onCheckedChange={(checked) => {
                        setAutoOrder(checked);
                        if (checked) {
                          setValue("display_order", undefined, {
                            shouldValidate: true,
                          });
                        } else {
                          setValue(
                            "display_order",
                            initialData?.display_order || 1,
                            { shouldValidate: true },
                          );
                        }
                      }}
                    />
                  </div>

                  {autoOrder ? (
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        background: "rgba(122,102,48,.06)",
                        border: "1px solid rgba(122,102,48,.18)",
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "12px",
                        color: "#7a6630",
                        lineHeight: 1.4,
                      }}
                    >
                      {t("autoOrderNotice")}
                    </div>
                  ) : (
                    <div style={{ marginTop: "10px" }}>
                      <label
                        htmlFor="order"
                        style={{
                          display: "block",
                          fontFamily:
                            "var(--f, 'Inter Tight', system-ui, sans-serif)",
                          fontSize: "12px",
                          color: "#6f6f6f",
                          marginBottom: "4px",
                        }}
                      >
                        {t("orderLabel")}
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <input
                          id="order"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={watchDisplayOrder ?? 1}
                          onKeyDown={(e) => {
                            if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9]/g, "");
                            const val = raw ? parseInt(raw, 10) : undefined;
                            setValue("display_order", val, {
                              shouldValidate: true,
                            });
                          }}
                          style={{
                            width: "70px",
                            height: "36px",
                            textAlign: "center",
                            borderRadius: "8px",
                            border: "1px solid #ebebeb",
                            background: "#ffffff",
                            fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#08090a",
                            outline: "none",
                          }}
                        />
                        <span
                          style={{
                            fontFamily:
                              "var(--f, 'Inter Tight', system-ui, sans-serif)",
                            fontSize: "12px",
                            color: "#6f6f6f",
                          }}
                        >
                          {t("orderHelper")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ height: "1px", background: "#ebebeb" }} />

                {/* Informe y versión de destino */}
                <div
                  style={{
                    fontFamily:
                      "var(--f, 'Inter Tight', system-ui, sans-serif)",
                    fontSize: "12px",
                    color: "#6f6f6f",
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: "#08090a", display: "block" }}>
                    {activeReportVersion || activeReport
                      ? t("activeReportLabel", {
                          title:
                            activeReportVersion?.title ||
                            activeReport?.slug ||
                            "",
                          version: `v${version || "1"} (${(activeReportVersion?.language || contentLanguage || "ES").toUpperCase()})`,
                        })
                      : t("currentVersionLabel", {
                          version: `v${version || "1"} (${(contentLanguage || "ES").toUpperCase()})`,
                        })}
                  </strong>
                </div>
              </div>
            </div>

            {/* Card: Guía de Redacción Editorial (.quote del prototipo) */}
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
                {t("styleGuideTitle")}
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
                {t("styleGuideHint")}
              </p>
            </div>

            {/* Botón de Eliminar en Modo Edición */}
            {isEditMode && initialData?.id && (
              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(179,38,30,.20)",
                  background: "rgba(179,38,30,.03)",
                }}
              >
                <div
                  style={{
                    fontFamily:
                      "var(--f, 'Inter Tight', system-ui, sans-serif)",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#b3261e",
                    marginBottom: "4px",
                  }}
                >
                  {t("dangerZoneTitle")}
                </div>
                <p
                  style={{
                    fontFamily:
                      "var(--f, 'Inter Tight', system-ui, sans-serif)",
                    fontSize: "12px",
                    color: "#6f6f6f",
                    marginBottom: "12px",
                    lineHeight: 1.4,
                    margin: "0 0 12px 0",
                  }}
                >
                  {t("dangerZoneDesc")}
                </p>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteDialog(true)}
                  className="b danger sm"
                  style={{
                    width: "100%",
                    background: "rgba(179,38,30,.08)",
                    color: "#b3261e",
                    border: "1px solid rgba(179,38,30,.25)",
                    height: "34px",
                  }}
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                  <span>{isDeleting ? t("deleting") : t("deleteSection")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* ── Modal de Confirmación para Eliminar Sección ─────────────── */}
      {showDeleteDialog && (
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
              {t("deleteConfirmTitle")}
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
              {t("deleteConfirmDesc")}
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
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="b sec sm"
                style={{ height: "34px", padding: "0 14px" }}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
                className="b pri sm"
                style={{
                  height: "34px",
                  padding: "0 14px",
                  background: "#b3261e",
                  borderColor: "#b3261e",
                }}
              >
                {isDeleting ? t("deleting") : t("deleteConfirmBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Confirmación para Eliminar Recurso ──────────────── */}
      {resourceToDelete && (
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
              {t("deleteResourceModalTitle")}
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
              {t("deleteResourceModalDesc")}
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
                onClick={() => setResourceToDelete(null)}
                disabled={isDeletingResource}
                className="b sec sm"
                style={{ height: "34px", padding: "0 14px" }}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteResource()}
                disabled={isDeletingResource}
                className="b pri sm"
                style={{
                  height: "34px",
                  padding: "0 14px",
                  background: "#b3261e",
                  borderColor: "#b3261e",
                }}
              >
                {isDeletingResource ? "..." : t("deleteResourceConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SectionForm;
