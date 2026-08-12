"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  createSectionSchema,
  updateSectionSchema,
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Settings,
  Lightbulb,
  Wand2,
  Eye,
  Trash2,
  FolderPlus,
  Copy,
  BookMarked,
  Pencil,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useVersion } from "@/context/version-context";
import { getResourcesBySectionAction, deleteResourceAction } from "@/features/admin/actions/resources-actions";
import { getReferencesAction } from "@/features/admin/actions/references-actions";
import type { ResourceItem } from "@/features/admin/schemas/resource-schema";
import type { ReferenceItem } from "@/features/admin/schemas/reference-schema";

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
  const { activeReportId, activeReport, activeReportVersion, version, contentLanguage } = useVersion();


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Associated section resources and report references state
  const [sectionResources, setSectionResources] = useState<ResourceItem[]>([]);
  const [sectionReferences, setSectionReferences] = useState<ReferenceItem[]>(
    [],
  );

  React.useEffect(() => {
    if (initialData?.id) {
      getResourcesBySectionAction(initialData.id).then(setSectionResources);
    }
    const repId = initialData?.report_id || activeReportId;
    if (repId) {
      getReferencesAction(repId).then(setSectionReferences);
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
        setSectionResources((prev) => prev.filter((r) => r.id !== resourceToDelete));
        setResourceToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
    } finally {
      setIsDeletingResource(false);
    }
  };

  // Tab state for content (Markdown editor vs Preview)
  const [contentTab, setContentTab] = useState<"editor" | "preview">("editor");
  const [autoOrder, setAutoOrder] = useState<boolean>(!initialData?.display_order);

  // Form setup using appropriate schema for create vs edit mode
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateSectionInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(isEditMode ? updateSectionSchema : createSectionSchema) as any,
    defaultValues: {
      report_id: initialData?.report_id || activeReportId || "",
      title: initialData?.title || "",
      content: initialData?.content || "",
      display_order: initialData?.display_order ?? undefined,
      published: initialData?.published ?? true,
    },
  });

  const watchTitle = useWatch({
    control,
    name: "title",
    defaultValue: initialData?.title || "",
  });

  const watchContent = useWatch({
    control,
    name: "content",
    defaultValue: initialData?.content || "",
  });

  const watchDisplayOrder = useWatch({
    control,
    name: "display_order",
    defaultValue: initialData?.display_order,
  });

  const watchPublished = useWatch({
    control,
    name: "published",
    defaultValue: initialData?.published ?? true,
  });



  // Keep report_id updated if activeReportId changes in creation mode
  React.useEffect(() => {
    if (!isEditMode && activeReportId) {
      setValue("report_id", activeReportId, { shouldValidate: false });
    }
  }, [activeReportId, isEditMode, setValue]);

  const onSubmit = async (values: CreateSectionInput) => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const isPublished = values.published ?? (values.status === "PUBLISHED");
      const statusVal = isPublished ? "PUBLISHED" : "DRAFT";

      if (isEditMode && initialData?.id) {
        const targetReportId = initialData.report_id || activeReportId || "";
        const updateInput: UpdateSectionInput = {
          title: values.title,
          content: values.content,
          display_order: autoOrder ? undefined : values.display_order,
          status: statusVal,
          published: isPublished,
        };
        const res = await updateSectionAction(initialData.id, updateInput, targetReportId);

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
        const targetReportId = values.report_id || activeReportId || "";

        if (!targetReportId) {
          setFeedback({
            type: "error",
            message:
              "No hay un reporte activo seleccionado en el contexto de versión. Por favor seleccione una versión con reporte.",
          });
          setIsSubmitting(false);
          return;
        }

        const createInput: CreateSectionInput = {
          report_id: targetReportId,
          title: values.title,
          content: values.content,
          display_order: autoOrder ? undefined : values.display_order,
          status: statusVal,
          published: isPublished,
        };


        const res = await createSectionAction(createInput);
        if (res.success) {
          setFeedback({
            type: "success",
            message: t("successCreated", { title: values.title }),
          });
          setTimeout(() => {
            router.push("/admin/sections");
          }, 1000);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (formErrors: Record<string, { message?: string } | undefined>) => {
    console.warn("Form validation errors:", formErrors);
    if (formErrors.report_id) {
      setFeedback({
        type: "error",
        message:
          "No hay un reporte activo seleccionado para crear la sección. Seleccione una versión válida en la barra superior.",
      });
    } else if (formErrors.title) {
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
        message: "Por favor revise los campos obligatorios del formulario.",
      });
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;

    setIsDeleting(true);
    try {
      const targetReportId = initialData.report_id || activeReportId || "";
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
    <>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="flex flex-col gap-6 w-full max-w-6xl mx-auto"
      >
        {/* Breadcrumb Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Link href="/admin/sections" className="hover:text-foreground">
              {t("breadcrumbBase")}
            </Link>
            <span>›</span>
            <span className="text-foreground">
              {isEditMode ? t("breadcrumbEdit") : t("breadcrumbNew")}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {isEditMode
                  ? t("editTitle", {
                      title: watchTitle || initialData?.title || "",
                    })
                  : t("createTitle")}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {activeReportVersion || activeReport
                  ? t("activeReportLabel", {
                      title: activeReportVersion?.title || activeReport?.slug || "",
                      version: `${version || "v1"} (${(activeReportVersion?.language || contentLanguage || "ES").toUpperCase()})`,
                    })
                  : t("currentVersionLabel", {
                      version: `${version || "N/A"} (${(contentLanguage || "ES").toUpperCase()})`,
                    })}
              </p>


            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/admin/sections">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl px-4 border-border/60"
                >
                  {t("cancel")}
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl px-5 gap-2 shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="size-4" />
                <span>
                  {isSubmitting
                    ? t("saving")
                    : isEditMode
                      ? t("saveChanges")
                      : t("saveSection")}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Missing Active Report Warning when creating */}
        {!isEditMode && !activeReportId && (
          <div className="p-4 rounded-xl text-sm font-medium flex items-center gap-3 border bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300">
            <AlertCircle className="size-5 shrink-0" />
            <span>
              {t("noActiveReportWarning")}
            </span>
          </div>
        )}

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 border ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="size-5 shrink-0" />
            ) : (
              <AlertCircle className="size-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Grid Layout: Main Form (8 cols) & Right Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Content Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 01: Identificación y Datos Básicos */}
            <Card className="border border-border/60 bg-card shadow-xs rounded-2xl p-6">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    01
                  </span>
                  <CardTitle className="text-base font-semibold">
                    {t("card01Title")}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="p-0 space-y-5">
                {/* Title Input */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs font-medium">
                    {t("sectionTitleLabel")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder={t("sectionTitlePlaceholder")}
                    className="rounded-xl bg-background text-sm font-medium"
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Slug (Read-only if edit mode or auto-generated) */}
                {isEditMode && initialData?.slug && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="slug-display"
                      className="text-xs font-medium"
                    >
                      {t("slugLabel")} — {t("slugAuto")}
                    </Label>
                    <Input
                      id="slug-display"
                      value={initialData.slug}
                      disabled
                      className="rounded-xl bg-muted/50 font-mono text-xs text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 02: Contenido Markdown / MDX */}
            <Card className="border border-border/60 bg-card shadow-xs rounded-2xl p-6 space-y-6">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                      02
                    </span>
                    <CardTitle className="text-base font-semibold">
                      {t("card02Title")}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-muted rounded-xl border border-border/40 text-xs">
                    <button
                      type="button"
                      onClick={() => setContentTab("editor")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                        contentTab === "editor"
                          ? "bg-background text-foreground font-medium shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Wand2 className="size-3.5" />
                      <span>{t("tabEditor")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentTab("preview")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                        contentTab === "preview"
                          ? "bg-background text-foreground font-medium shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Eye className="size-3.5" />
                      <span>{t("tabPreview")}</span>
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0 space-y-4">
                {contentTab === "editor" ? (
                  <MDXEditorComponent
                    markdown={watchContent || ""}
                    onChange={(val) =>
                      setValue("content", val, { shouldValidate: true })
                    }
                  />
                ) : (
                  <MdxPreview content={watchContent || ""} />
                )}
                {errors.content && (
                  <p className="text-xs text-destructive">
                    {errors.content.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Card 03: Recursos Asociados */}
            {isEditMode ? (
              <Card className="border border-border/60 bg-card shadow-xs rounded-2xl p-6">
                <CardHeader className="p-0 mb-4 pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FolderPlus className="size-4 text-emerald-700 dark:text-emerald-400" />
                    <CardTitle className="text-base font-semibold">
                      {t("resourcesTitle")}
                    </CardTitle>
                  </div>
                  <Link
                    href={`/admin/resources/new?sectionId=${initialData?.id || ""}`}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-emerald-900/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/10 text-xs font-semibold gap-1.5 px-3 py-1"
                    >
                      <FolderPlus className="size-3.5" />
                      <span>{t("addResourceBtn")}</span>
                    </Button>
                  </Link>
                </CardHeader>

                <CardContent className="p-0">
                  {sectionResources.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-border/60 rounded-xl bg-muted/20 text-xs text-muted-foreground">
                      {t("noSectionResources")}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {sectionResources.map((res) => (
                        <div
                          key={res.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/60"
                        >
                          <div>
                            <h5 className="text-xs font-bold text-foreground">
                              {res.title}
                            </h5>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {res.description || res.alt_text}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 border border-emerald-500/20">
                              {res.type}
                            </span>
                            {res.file_url && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title={t("copyFileUrl")}
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    res.file_url || "",
                                  );
                                }}
                                className="size-7 text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400"
                              >
                                <Copy className="size-3.5" />
                              </Button>
                            )}
                            {res.id && (
                              <Link href={`/admin/resources/${res.id}`}>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  title={t("editResource")}
                                  className="size-7 text-muted-foreground hover:text-foreground"
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                              </Link>
                            )}
                            {res.id && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title={t("deleteResource")}
                                onClick={() => setResourceToDelete(res.id!)}
                                className="size-7 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-border/60 bg-muted/20 shadow-xs rounded-2xl p-5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <FolderPlus className="size-5 text-muted-foreground/60 shrink-0" />
                  <p>
                    <strong className="text-foreground">
                      {t("resourcesTitle")}:
                    </strong>{" "}
                    {t("saveFirstResourcesHint")}
                  </p>
                </div>
              </Card>
            )}

            {/* Card 04: Referencias Bibliográficas */}
            {isEditMode ? (
              <Card className="border border-border/60 bg-card shadow-xs rounded-2xl p-6">
                <CardHeader className="p-0 mb-4 pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <BookMarked className="size-4 text-emerald-700 dark:text-emerald-400" />
                    <CardTitle className="text-base font-semibold">
                      {t("referencesTitle")}
                    </CardTitle>
                  </div>
                  <Link
                    href={`/admin/references/new?reportId=${initialData?.report_id || activeReportId || ""}`}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-emerald-900/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/10 text-xs font-semibold gap-1.5 px-3 py-1"
                    >
                      <BookMarked className="size-3.5" />
                      <span>{t("addReferenceBtn")}</span>
                    </Button>
                  </Link>
                </CardHeader>

                <CardContent className="p-0">
                  {sectionReferences.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-border/60 rounded-xl bg-muted/20 text-xs text-muted-foreground">
                      {t("noSectionReferences")}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {sectionReferences.map((ref) => (
                        <div
                          key={ref.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/60"
                        >
                          <div>
                            <h5 className="text-xs font-bold text-foreground">
                              {ref.authors} ({ref.year})
                            </h5>
                            <p className="text-[11px] italic font-serif text-emerald-900 dark:text-emerald-300 mt-0.5">
                              {ref.title}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40">
                            {ref.source}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-border/60 bg-muted/20 shadow-xs rounded-2xl p-5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <BookMarked className="size-5 text-muted-foreground/60 shrink-0" />
                  <p>
                    <strong className="text-foreground">
                      {t("referencesTitle")}:
                    </strong>{" "}
                    {t("saveFirstReferencesHint")}
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Right Sidebar Area (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card: Atributos de Configuración */}
            <Card className="border border-border/60 bg-card shadow-xs rounded-2xl p-6">
              <CardHeader className="p-0 mb-5 pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Settings className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">
                    {t("configTitle")}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="p-0 space-y-5 text-xs">
                {/* Orden de visualización */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-order-switch" className="text-xs text-muted-foreground font-medium">
                      {t("autoOrderLabel")}
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-foreground">
                        {autoOrder ? t("autoOrderToggle") : t("customOrderToggle")}
                      </span>
                      <Switch
                        id="auto-order-switch"
                        checked={autoOrder}
                        onCheckedChange={(checked) => {
                          setAutoOrder(checked);
                          if (checked) {
                            setValue("display_order", undefined, { shouldValidate: true });
                          } else {
                            setValue("display_order", initialData?.display_order || 1, { shouldValidate: true });
                          }
                        }}
                      />
                    </div>
                  </div>

                  {autoOrder ? (
                    <div className="p-3 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                      {t("autoOrderNotice")}
                    </div>
                  ) : (
                    <div className="space-y-1.5 pt-1">
                      <Label
                        htmlFor="order"
                        className="text-xs text-muted-foreground font-medium"
                      >
                        {t("orderLabel")}
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="order"
                          type="number"
                          min={1}
                          value={watchDisplayOrder ?? 1}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setValue(
                              "display_order",
                              isNaN(val) ? undefined : val,
                              { shouldValidate: true },
                            );
                          }}
                          className="w-20 rounded-xl bg-background font-mono font-semibold text-center h-9 text-xs"
                        />
                        <span className="text-[11px] text-muted-foreground">
                          {t("orderHelper")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-border/40" />

                {/* Estado de sección (Publicada / Borrador) */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium">
                    {t("publicationLabel")}
                  </Label>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      {watchPublished ? t("published") : t("draft")}
                    </span>
                    <Switch
                      checked={watchPublished ?? false}
                      onCheckedChange={(checked) =>
                        setValue("published", checked, { shouldValidate: true })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card: Guía de Estilo */}
            <Card className="border border-dashed border-border/70 bg-card/60 shadow-xs rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground">
                    {t("styleGuideTitle")}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t("styleGuideHint")}
                  </p>
                </div>
              </div>
            </Card>

            {/* Delete Action Button (Visible only in edit mode) */}
            {isEditMode && initialData?.id && (
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={() => setShowDeleteDialog(true)}
                className="w-full"
              >
                <Trash2 className="size-4" />
                <span>{isDeleting ? t("deleting") : t("deleteSection")}</span>
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Modal de confirmación para eliminar la sección */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              {t("deleteConfirmTitle") || "¿Eliminar esta sección?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              {t("deleteConfirmDesc") ||
                "Esta acción no se puede deshacer. Se eliminará permanentemente la sección y todo su contenido del sistema."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 flex items-center justify-end gap-2">
            <AlertDialogCancel className="rounded-xl border-border/60 text-xs font-semibold">
              {t("cancel") || "Cancelar"}
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? t("deleting") : t("deleteSection")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Modal de confirmación para eliminar recurso */}
      <AlertDialog open={!!resourceToDelete} onOpenChange={(open) => { if (!open) setResourceToDelete(null); }}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              {t("deleteResourceModalTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              {t("deleteResourceModalDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 flex items-center justify-end gap-2">
            <AlertDialogCancel className="rounded-xl border-border/60 text-xs font-semibold">
              {t("cancel")}
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeletingResource}
              onClick={confirmDeleteResource}
              className="rounded-xl px-4 text-xs font-semibold"
            >
              {isDeletingResource ? t("deleting") : t("deleteResourceConfirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default SectionForm;
