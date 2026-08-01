"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { createSectionSchema, type CreateSectionInput, type SectionItem } from "../../schemas/section-schema";
import { createSectionAction } from "../../actions/sections-actions";
import { MDXEditorComponent } from "@/features/admin/components/ui/mdx/mdx-editor-component";
import { MdxPreview } from "@/features/admin/components/ui/mdx/mdx-preview";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Save,
  Lock,
  CheckCircle2,
  AlertCircle,
  Settings,
  Lightbulb,
  Quote,
  Wand2,
  Eye,
  Trash2,
} from "lucide-react";

import { getResourcesBySectionAction } from "@/features/admin/actions/resources-actions";
import type { ResourceItem } from "@/features/admin/schemas/resource-schema";
import { DownloadCloud, FolderPlus, Copy } from "lucide-react";

interface SectionFormProps {
  initialData?: SectionItem;
  isEditMode?: boolean;
}

const MOCK_SECTION_DATA: SectionItem = {
  id: "SEC_001_INTRO",
  title: "Análisis de Resiliencia Térmica",
  slug: "analisis-resiliencia-termica",
  description: "Resumen ejecutivo de la sección para índices y metadatos...",
  introduction: "Escriba la introducción técnica aquí...",
  methodology: "Describa el proceso de obtención de datos...",
  citation_text: "Inserte aquí una frase clave para destacar en el reporte...",
};

export function SectionForm({ initialData, isEditMode = false }: SectionFormProps) {
  const t = useTranslations("AdminPage.sectionForm");
  const router = useRouter();
  const data = initialData || (isEditMode ? MOCK_SECTION_DATA : undefined);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Associated section resources state
  const [sectionResources, setSectionResources] = useState<ResourceItem[]>([]);

  React.useEffect(() => {
    if (initialData?.id) {
      getResourcesBySectionAction(initialData.id).then(setSectionResources);
    }
  }, [initialData?.id]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [autoSlug, setAutoSlug] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [activeInReport, setActiveInReport] = useState<boolean>(true);
  const [includeRawData, setIncludeRawData] = useState<boolean>(false);

  // Tabs state for Introduction and Methodology
  const [introTab, setIntroTab] = useState<"editor" | "preview">("editor");
  const [methodTab, setMethodTab] = useState<"editor" | "preview">("editor");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateSectionInput>({
    resolver: zodResolver(createSectionSchema),
    defaultValues: {
      title: data?.title || "",
      slug: data?.slug || "",
      description: data?.description || "",
      introduction: data?.introduction || "",
      methodology: data?.methodology || "",
      citation_text: data?.citation_text || "",
    },
  });

  const watchTitle = watch("title");
  const watchIntroduction = watch("introduction");
  const watchMethodology = watch("methodology");

  // Auto-generate slug when title changes if autoSlug is active
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("title", val, { shouldValidate: true });

    if (autoSlug && !isEditMode) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: CreateSectionInput) => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await createSectionAction(values);
      if (res.success) {
        setFeedback({
          type: "success",
          message: isEditMode
            ? t("successUpdated", { title: values.title })
            : t("successCreated", { title: values.title }),
        });
      } else {
        setFeedback({
          type: "error",
          message: res.message || t("genericError"),
        });
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

  const handleDelete = async () => {
    if (!window.confirm(t("deleteConfirmDesc"))) return;

    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      router.push("/admin/sections");
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Link href="/admin/sections" className="hover:text-foreground">
            {t("breadcrumbBase")}
          </Link>
          <span>›</span>
          <span className="text-foreground">{isEditMode ? t("breadcrumbEdit") : t("breadcrumbNew")}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isEditMode ? t("editTitle", { title: watchTitle || data?.title || "" }) : t("createTitle")}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {t("subtitle")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/admin/sections">
              <Button type="button" variant="outline" className="rounded-xl px-4 border-border/60">
                {t("cancel")}
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl px-5 gap-2 shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="size-4" />
              <span>{isSubmitting ? t("saving") : isEditMode ? t("saveChanges") : t("saveSection")}</span>
            </Button>
          </div>
        </div>
      </div>

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
          {/* Card 01: Identificación y Ruta */}
          <Card className="border border-border/60 bg-card shadow-xs rounded-2xl p-6">
            <CardHeader className="p-0 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                  01
                </span>
                <CardTitle className="text-base font-semibold">{t("card01Title")}</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-5">
              {/* Title & Slug in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs font-medium">
                    {t("sectionTitleLabel")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={watchTitle || ""}
                    onChange={handleTitleChange}
                    placeholder={t("sectionTitlePlaceholder")}
                    className="rounded-xl bg-background text-sm"
                  />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slug" className="text-xs font-medium">
                      {t("slugLabel")} <span className="text-destructive">*</span>
                    </Label>
                    <button
                      type="button"
                      onClick={() => setAutoSlug(!autoSlug)}
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Lock className="size-3" />
                      <span>{autoSlug ? t("slugAuto") : t("slugManual")}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="slug"
                      {...register("slug")}
                      placeholder={t("slugPlaceholder")}
                      className="rounded-xl bg-muted/40 font-mono text-xs pr-8"
                    />
                    <Lock className="size-3.5 absolute right-3 top-3 text-muted-foreground/60" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t("slugHelper")}
                  </p>
                  {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
                </div>
              </div>

              {/* Brief Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-medium">
                  {t("descLabel")}
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  rows={3}
                  placeholder={t("descPlaceholder")}
                  className="rounded-xl bg-background text-xs leading-relaxed p-3 border-border/60"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 02: Cuerpo Editorial */}
          <Card className="border border-border/60 bg-card shadow-xs rounded-2xl p-6 space-y-6">
            <CardHeader className="p-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                  02
                </span>
                <CardTitle className="text-base font-semibold">{t("card02Title")}</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-6">
              {/* Introducción del Módulo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">{t("introLabel")}</Label>
                  <div className="flex items-center gap-1 p-1 bg-muted rounded-xl border border-border/40 text-xs">
                    <button
                      type="button"
                      onClick={() => setIntroTab("editor")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                        introTab === "editor"
                          ? "bg-background text-foreground font-medium shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Wand2 className="size-3.5" />
                      <span>{t("tabEditor")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIntroTab("preview")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                        introTab === "preview"
                          ? "bg-background text-foreground font-medium shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Eye className="size-3.5" />
                      <span>{t("tabPreview")}</span>
                    </button>
                  </div>
                </div>

                {introTab === "editor" ? (
                  <MDXEditorComponent
                    markdown={watchIntroduction || ""}
                    onChange={(val) => setValue("introduction", val, { shouldValidate: true })}
                  />
                ) : (
                  <MdxPreview content={watchIntroduction || ""} />
                )}
              </div>

              {/* Metodología Aplicada */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">{t("methodologyLabel")}</Label>
                  <div className="flex items-center gap-1 p-1 bg-muted rounded-xl border border-border/40 text-xs">
                    <button
                      type="button"
                      onClick={() => setMethodTab("editor")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                        methodTab === "editor"
                          ? "bg-background text-foreground font-medium shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Wand2 className="size-3.5" />
                      <span>{t("tabEditor")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethodTab("preview")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                        methodTab === "preview"
                          ? "bg-background text-foreground font-medium shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Eye className="size-3.5" />
                      <span>{t("tabPreview")}</span>
                    </button>
                  </div>
                </div>

                {methodTab === "editor" ? (
                  <MDXEditorComponent
                    markdown={watchMethodology || ""}
                    onChange={(val) => setValue("methodology", val, { shouldValidate: true })}
                  />
                ) : (
                  <MdxPreview content={watchMethodology || ""} />
                )}
              </div>

              {/* Texto de Citación / Destacado */}
              <div className="p-4 rounded-xl border-l-4 border-amber-500/80 bg-amber-500/5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Quote className="size-4" />
                  <span>{t("citationLabel")}</span>
                </div>
                <Textarea
                  id="citation_text"
                  {...register("citation_text")}
                  rows={2}
                  placeholder={t("citationPlaceholder")}
                  className="bg-transparent border-0 focus-visible:ring-0 p-0 text-xs text-foreground/90 italic font-medium placeholder:text-muted-foreground/60 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 03: Recursos Asociados a esta Sección (Visible solo al editar o con aviso en creación) */}
          {isEditMode ? (
            <Card className="border border-border/60 bg-card shadow-xs rounded-2xl p-6">
              <CardHeader className="p-0 mb-4 pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FolderPlus className="size-4 text-emerald-700 dark:text-emerald-400" />
                  <CardTitle className="text-base font-semibold">Recursos Visuales y Documentos</CardTitle>
                </div>
                <Link href={`/admin/resources/new?sectionId=${initialData?.id || ""}`}>
                  <Button type="button" variant="outline" size="sm" className="rounded-xl border-emerald-900/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/10 text-xs font-semibold gap-1.5 px-3 py-1">
                    <FolderPlus className="size-3.5" />
                    <span>+ Agregar Recurso</span>
                  </Button>
                </Link>
              </CardHeader>

              <CardContent className="p-0">
                {sectionResources.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-border/60 rounded-xl bg-muted/20 text-xs text-muted-foreground">
                    No hay recursos adjuntos a esta sección. Utilice el botón superior para asociar diagramas e imágenes.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {sectionResources.map((res) => (
                      <div key={res.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/60">
                        <div>
                          <h5 className="text-xs font-bold text-foreground">{res.title}</h5>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{res.description || res.alt_text}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                            {res.type}
                          </span>
                          {res.file_url && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              title="Copiar enlace del archivo"
                              onClick={() => {
                                navigator.clipboard.writeText(res.file_url || "");
                              }}
                              className="size-7 text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400"
                            >
                              <Copy className="size-3.5" />
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
                  <strong className="text-foreground">Recursos Visuales:</strong> Primero guarde la sección para poder vincular diagramas, gráficos e imágenes.
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
                <CardTitle className="text-sm font-semibold">{t("configTitle")}</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-5 text-xs">
              {/* Orden de visualización */}
              <div className="space-y-1.5">
                <Label htmlFor="order" className="text-xs text-muted-foreground font-medium">
                  {t("orderLabel")}
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="order"
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-20 rounded-xl bg-background font-mono font-semibold text-center h-9 text-xs"
                  />
                  <span className="text-[11px] text-muted-foreground">{t("orderHelper")}</span>
                </div>
              </div>

              <div className="h-px bg-border/40" />

              {/* Estado de sección */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium">{t("statusLabel")}</Label>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    {activeInReport ? t("statusActive") : t("statusInactive")}
                  </span>
                  <Switch
                    checked={activeInReport}
                    onCheckedChange={setActiveInReport}
                  />
                </div>
              </div>

              <div className="h-px bg-border/40" />

              {/* Visibilidad técnica */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium">{t("visibilityLabel")}</Label>
                <div className="flex items-start gap-2 pt-1">
                  <Checkbox
                    id="raw_data"
                    checked={includeRawData}
                    onCheckedChange={(checked) => setIncludeRawData(!!checked)}
                  />
                  <Label htmlFor="raw_data" className="text-xs font-normal text-foreground leading-snug cursor-pointer">
                    {t("includeRawData")}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Guía de Estilo */}
          <Card className="border border-dashed border-border/70 bg-card/60 shadow-xs rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground">{t("styleGuideTitle")}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t("styleGuideDesc")}
                </p>
              </div>
            </div>
          </Card>

          {/* Delete Action Button (Visible only in edit mode) */}
          {isEditMode && (
            <div className="pt-2">
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDelete}
                className="w-full rounded-xl gap-2 shadow-xs bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border border-destructive/20 transition-all text-xs font-medium h-10"
              >
                <Trash2 className="size-4" />
                <span>{isDeleting ? t("deleting") : t("deleteSection")}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

export default SectionForm;
