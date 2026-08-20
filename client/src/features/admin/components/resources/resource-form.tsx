"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Upload,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  resourceFormSchema,
  type ResourceFormInput,
  type ResourceItem,
} from "../../schemas/resource-schema";
import { getSectionOptionsAction } from "../../actions/sections-actions";
import {
  createResourceAction,
  updateResourceAction,
  uploadFileAction,
} from "../../actions/resources-actions";
import { useVersion } from "@/features/admin/context";

interface ResourceFormProps {
  initialData?: ResourceItem;
  isEditMode?: boolean;
  preselectedSectionId?: string;
}

export function ResourceForm({
  initialData,
  isEditMode = false,
  preselectedSectionId,
}: ResourceFormProps) {
  const t = useTranslations("AdminPage.resources.resourceForm");
  const tRoot = useTranslations("AdminPage.resources");
  const router = useRouter();
  const { activeReportId } = useVersion();

  // File upload state & Mutually exclusive Source Mode state
  const [sourceMode, setSourceMode] = useState<"file" | "url">(
    initialData?.file_url && !initialData.cloudinary_public_id ? "url" : "file",
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [sectionOptions, setSectionOptions] = useState<
    { id: string; title: string }[]
  >([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormInput>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      section_id: initialData?.section_id || preselectedSectionId || "",
      type: initialData?.type || "IMAGE",
      title: initialData?.title || "",
      description: initialData?.description || "",
      file_url: initialData?.file_url || "",
      cloudinary_public_id: initialData?.cloudinary_public_id || "",
      alt_text: initialData?.alt_text || "",
      downloadable: initialData?.downloadable ?? true,
    },
  });

  const watchTitle = useWatch({ control, name: "title" });
  const watchType = useWatch({ control, name: "type" });
  const watchFileUrl = useWatch({ control, name: "file_url" });
  const watchAltText = useWatch({ control, name: "alt_text" });
  const watchDownloadable = useWatch({ control, name: "downloadable" });

  useEffect(() => {
    let isMounted = true;
    async function loadSections() {
      setIsLoadingSections(true);
      try {
        const secs = await getSectionOptionsAction(activeReportId ?? undefined);
        if (!isMounted) return;
        setSectionOptions(secs);
        if (
          !initialData?.section_id &&
          !preselectedSectionId &&
          secs.length > 0
        ) {
          setValue("section_id", secs[0].id, { shouldValidate: true });
        }
      } catch (err) {
        console.error("Failed to load sections for resource form", err);
      } finally {
        if (isMounted) {
          setIsLoadingSections(false);
        }
      }
    }
    void loadSections();
    return () => {
      isMounted = false;
    };
  }, [initialData, preselectedSectionId, activeReportId, setValue]);

  const onSubmit = async (values: ResourceFormInput) => {
    setFeedback(null);

    let finalFileUrl = values.file_url;
    let finalCloudinaryId = values.cloudinary_public_id;

    try {
      // 1. Si sube archivo a Cloudinary
      if (sourceMode === "file" && selectedFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        const isImage =
          selectedFile.type.startsWith("image/") ||
          values.type.toUpperCase() === "IMAGE";
        const resourceType = isImage ? "image" : "raw";

        const uploadRes = await uploadFileAction(formData, resourceType);
        setIsUploading(false);

        const uploadData = uploadRes.data as
          | { file_url?: string; public_id?: string }
          | undefined;

        if (!uploadRes.success || !uploadData?.file_url) {
          setFeedback({
            type: "error",
            message: uploadRes.message || t("errorUpload"),
          });
          return;
        }

        finalFileUrl = uploadData.file_url;
        finalCloudinaryId = uploadData.public_id || "";
        setValue("file_url", finalFileUrl);
        setValue("cloudinary_public_id", finalCloudinaryId);
      }

      if (!finalFileUrl && !selectedFile) {
        setFeedback({
          type: "error",
          message: t("errorNoFileOrUrl"),
        });
        return;
      }

      if (isEditMode && initialData?.id) {
        const res = await updateResourceAction(
          initialData.id,
          {
            type: values.type,
            title: values.title,
            description: values.description,
            file_url: finalFileUrl,
            cloudinary_public_id: finalCloudinaryId,
            alt_text: values.alt_text,
            downloadable: values.downloadable,
          },
          values.section_id,
        );

        if (res.success) {
          setFeedback({
            type: "success",
            message: t("successUpdated"),
          });
          setTimeout(() => {
            router.push("/admin/resources");
            router.refresh();
          }, 800);
        } else {
          setFeedback({
            type: "error",
            message: res.message || t("errorUpdated"),
          });
        }
      } else {
        const res = await createResourceAction({
          section_id: values.section_id,
          type: values.type,
          title: values.title,
          description: values.description,
          file_url: finalFileUrl,
          cloudinary_public_id: finalCloudinaryId,
          alt_text: values.alt_text,
          downloadable: values.downloadable,
        });

        if (res.success) {
          setFeedback({
            type: "success",
            message: t("successCreated"),
          });
          setTimeout(() => {
            router.push("/admin/resources");
            router.refresh();
          }, 800);
        } else {
          setFeedback({
            type: "error",
            message: res.message || t("errorCreated"),
          });
        }
      }
    } catch (err) {
      console.error("Error submitting resource form:", err);
      setFeedback({
        type: "error",
        message: t("errorGeneric", { defaultValue: "Ocurrió un error inesperado al guardar el recurso." }),
      });
    } finally {
      setIsUploading(false);
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
            href="/admin/resources"
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
            <Link href="/admin/resources" className="b sec">
              {t("cancel")}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="b pri"
              style={{
                background: "#00603a",
                borderColor: "#00603a",
                color: "#ffffff",
              }}
            >
              {isUploading ? (
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
              <span>
                {isSubmitting || isUploading ? t("saving") : t("saveResource")}
              </span>
            </button>
          </div>
        </div>

        {/* ── Banners de Alerta / Feedback ─────────────────────────── */}
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
          {/* Columna Izquierda: Parámetros del Recurso (8 cols en desktop, full en móvil) */}
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
                {/* Sección vinculada */}
                <div>
                  <label
                    htmlFor="resource-section"
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
                    {t("sectionLabel")}{" "}
                    <span style={{ color: "#b3261e" }}>*</span>
                  </label>
                  {isLoadingSections ? (
                    <Skeleton className="h-10 w-full rounded-md" />
                  ) : sectionOptions.length === 0 ? (
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        background: "rgba(122,102,48,.06)",
                        border: "1px solid rgba(122,102,48,.18)",
                        fontSize: "13px",
                        color: "#7a6630",
                      }}
                    >
                      {t("noSectionsWarning")}{" "}
                      <Link
                        href="/admin/sections/new"
                        style={{
                          color: "#00603a",
                          textDecoration: "underline",
                          fontWeight: 500,
                        }}
                      >
                        {t("createSectionBtn")}
                      </Link>
                    </div>
                  ) : (
                    <select
                      id="resource-section"
                      {...register("section_id")}
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 13px",
                        border: errors.section_id
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
                      {sectionOptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.section_id && (
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
                      {errors.section_id.message}
                    </p>
                  )}
                </div>

                {/* Tipo de recurso y Título */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="resource-type"
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
                      {t("typeLabel")}
                    </label>
                    <select
                      id="resource-type"
                      {...register("type")}
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
                    >
                      <option value="IMAGE">{t("typeImage")}</option>
                      <option value="GRAPH">{t("typeGraph")}</option>
                      <option value="DIAGRAM">{t("typeDiagram")}</option>
                      <option value="FILE">{t("typeFile")}</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="resource-title"
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
                      id="resource-title"
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
                </div>

                {/* Descripción */}
                <div>
                  <label
                    htmlFor="resource-desc"
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
                    {t("descLabel")}
                  </label>
                  <textarea
                    id="resource-desc"
                    {...register("description")}
                    placeholder={t("descPlaceholder")}
                    rows={2}
                    style={{
                      width: "100%",
                      padding: "10px 13px",
                      border: "1px solid #ebebeb",
                      borderRadius: "8px",
                      background: "#ffffff",
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "14px",
                      color: "#08090a",
                      outline: "none",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Origen del archivo (Subir archivo vs URL) */}
                <div
                  style={{
                    border: "1px solid #ebebeb",
                    borderRadius: "8px",
                    padding: "16px",
                    background: "#fafafa",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "14px",
                    }}
                  >
                    <label
                      style={{
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "13.5px",
                        fontWeight: 500,
                        color: "#08090a",
                      }}
                    >
                      {t("assetSourceLabel")}
                    </label>

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
                        onClick={() => setSourceMode("file")}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "4px",
                          border: "none",
                          fontFamily:
                            "var(--f, 'Inter Tight', system-ui, sans-serif)",
                          fontSize: "12px",
                          fontWeight: sourceMode === "file" ? 500 : 400,
                          background:
                            sourceMode === "file" ? "#ffffff" : "transparent",
                          color:
                            sourceMode === "file" ? "#08090a" : "#6f6f6f",
                          cursor: "pointer",
                        }}
                      >
                        {t("uploadFileBtn")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSourceMode("url")}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "4px",
                          border: "none",
                          fontFamily:
                            "var(--f, 'Inter Tight', system-ui, sans-serif)",
                          fontSize: "12px",
                          fontWeight: sourceMode === "url" ? 500 : 400,
                          background:
                            sourceMode === "url" ? "#ffffff" : "transparent",
                          color:
                            sourceMode === "url" ? "#08090a" : "#6f6f6f",
                          cursor: "pointer",
                        }}
                      >
                        {t("urlBtn")}
                      </button>
                    </div>
                  </div>

                  {sourceMode === "file" ? (
                    <div>
                      <label
                        htmlFor="file-dropzone"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "24px 16px",
                          borderRadius: "8px",
                          border: "1px dashed #d0d0d0",
                          background: "#ffffff",
                          cursor: "pointer",
                          textAlign: "center",
                        }}
                      >
                        <Upload
                          style={{
                            width: 24,
                            height: 24,
                            color: "#00603a",
                            marginBottom: "8px",
                          }}
                        />
                        <span
                          style={{
                            fontFamily:
                              "var(--f, 'Inter Tight', system-ui, sans-serif)",
                            fontSize: "13.5px",
                            fontWeight: 500,
                            color: "#08090a",
                          }}
                        >
                          {selectedFile
                            ? selectedFile.name
                            : t("dropzoneClick")}
                        </span>
                        <span
                          style={{
                            fontFamily:
                              "var(--f, 'Inter Tight', system-ui, sans-serif)",
                            fontSize: "12px",
                            color: "#6f6f6f",
                            marginTop: "4px",
                          }}
                        >
                          {selectedFile
                            ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                            : t("dropzoneHint")}
                        </span>
                        <input
                          id="file-dropzone"
                          type="file"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setSelectedFile(e.target.files[0]);
                            }
                          }}
                          style={{ display: "none" }}
                        />
                      </label>
                      {watchFileUrl && !selectedFile && (
                        <p
                          style={{
                            fontFamily:
                              "var(--m, 'IBM Plex Mono', monospace)",
                            fontSize: "11.5px",
                            color: "#6f6f6f",
                            marginTop: "8px",
                            margin: "8px 0 0",
                            wordBreak: "break-all",
                          }}
                        >
                          {t("currentFile", { url: watchFileUrl })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        {...register("file_url")}
                        placeholder={t("fileUrlPlaceholder")}
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
                        {t("fileUrlHelper")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Texto Alternativo (Alt Text) */}
                <div>
                  <label
                    htmlFor="resource-alt"
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
                    {t("altTextLabel")}{" "}
                    <span style={{ color: "#b3261e" }}>*</span>
                  </label>
                  <input
                    id="resource-alt"
                    {...register("alt_text")}
                    placeholder={t("altTextPlaceholder")}
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 13px",
                      border: errors.alt_text
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
                  {errors.alt_text && (
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
                      {errors.alt_text.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Configuración Lateral y Vista Previa (4 cols en desktop, full en móvil) */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-5 w-full min-w-0">
            {/* Card: Configuración */}
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

              <div style={{ padding: "18px" }}>
                {/* Switch Descargable */}
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
                    {t("downloadableLabel")}
                  </label>
                  <span className={watchDownloadable ? "bg pub" : "bg draft"}>
                    {watchDownloadable ? tRoot("yes") : tRoot("no")}
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
                    {watchDownloadable ? tRoot("yes") : tRoot("no")}
                  </span>
                  <Switch
                    checked={watchDownloadable ?? true}
                    onCheckedChange={(checked) =>
                      setValue("downloadable", checked, {
                        shouldValidate: true,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Card: Vista Previa del Asset */}
            {(watchFileUrl || selectedFile) && (
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
                    {t("previewTitle")}
                  </h3>
                </div>
                <div
                  style={{
                    padding: "16px",
                    display: "grid",
                    placeItems: "center",
                    background: "#fafafa",
                  }}
                >
                  {watchType.toUpperCase() === "IMAGE" ||
                  watchType.toUpperCase() === "GRAPH" ||
                  watchType.toUpperCase() === "DIAGRAM" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        selectedFile
                          ? URL.createObjectURL(selectedFile)
                          : watchFileUrl
                      }
                      alt={watchAltText || watchTitle}
                      style={{
                        maxHeight: "180px",
                        maxWidth: "100%",
                        objectFit: "contain",
                        borderRadius: "6px",
                        border: "1px solid #ebebeb",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#6f6f6f",
                        fontSize: "13px",
                      }}
                    >
                      <FileCheck
                        style={{ width: 24, height: 24, color: "#00603a" }}
                      />
                      <span>{t("docReady")}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Nota editorial de accesibilidad (.quote del prototipo) */}
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
                {t("accessibilityTitle")}
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
                {t("accessibilityDesc")}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ResourceForm;
