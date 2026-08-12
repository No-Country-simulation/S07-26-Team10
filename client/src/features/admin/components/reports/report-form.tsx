"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, FileText, Wand2, Eye } from "lucide-react";
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";

interface ReportFormProps {
  initialData?: ReportVersion;
  isEditMode?: boolean;
}

const parseInitialVersion = (initialVersion?: string) => {
  if (!initialVersion) return "1";
  const sanitized = initialVersion.replace(/[^0-9]/g, "");
  return sanitized || "1";
};

export function ReportForm({ initialData, isEditMode = false }: ReportFormProps) {
  const t = useTranslations("AdminPage.reports.reportForm");
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedReportId = searchParams?.get("reportId");

  const { language: currentContextLang } = useLanguage();
  const { contentLanguage, refreshReports } = useVersion();

  const [availableBaseReports, setAvailableBaseReports] = useState<BaseReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>("new");

  const [versionNumber, setVersionNumber] = useState<string>(
    parseInitialVersion(initialData?.version)
  );
  const [language, setLanguage] = useState<"ES" | "EN">(
    isEditMode
      ? (initialData?.language as "ES" | "EN") || "ES"
      : (contentLanguage.toUpperCase() as "ES" | "EN") ||
        (currentContextLang.toUpperCase() as "ES" | "EN") ||
        "ES"
  );
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initialData?.status || "DRAFT"
  );

  const cleanVer = versionNumber.replace(/[^0-9]/g, "");
  const formattedVersion = `v${cleanVer || "1"}`;
  const [title, setTitle] = useState(initialData?.title || "");

  const [summary, setSummary] = useState(initialData?.summary || "");
  const [citationText, setCitationText] = useState(initialData?.citation_text || "");
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
          if (preselectedReportId && reports.some((r) => r.id === preselectedReportId)) {
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
    loadBaseReports();
  }, [isEditMode, preselectedReportId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccessMsg("");

    try {
      if (isEditMode && initialData?.report_id && initialData?.id) {
        const result = await updateReportVersionAction(
          initialData.report_id,
          initialData.id,
          {
            title,
            summary,
            citation_text: citationText,
            status,
          }
        );

        if (result.success) {
          setSuccessMsg(result.message || "Versión actualizada con éxito.");
          await refreshReports();
          setTimeout(() => {
            router.push("/admin/reports");
          }, 400);
        } else {
          const mergedErrors: Record<string, string[]> = { ...(result.errors || {}) };
          if (result.message) {
            mergedErrors.general = [result.message];
          }
          setErrors(mergedErrors);
        }
      } else {
        let targetReportId = selectedReportId;

        if (targetReportId === "new" || !targetReportId) {
          const createBaseRes = await createReportAction();
          if (createBaseRes.success && createBaseRes.data?.id) {
            targetReportId = createBaseRes.data.id;
          } else {
            setErrors({ general: [createBaseRes.message || "Error al crear el reporte base."] });
            setIsSubmitting(false);
            return;
          }
        }

        const result = await createReportVersionAction(targetReportId, {
          title,
          version: formattedVersion,
          language,
          summary,
          citation_text: citationText,
        });

        if (result.success) {
          setSuccessMsg(result.message || "Versión creada exitosamente.");
          await refreshReports();
          setTimeout(() => {
            router.push("/admin/reports");
          }, 400);
        } else {
          const mergedErrors: Record<string, string[]> = { ...(result.errors || {}) };
          if (result.message) {
            mergedErrors.general = [result.message];
          }
          setErrors(mergedErrors);
        }
      }
    } catch {
      setErrors({ general: ["Ocurrió un error inesperado al procesar la solicitud."] });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-2">
      {/* Breadcrumb Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Link href="/admin/reports" className="hover:text-foreground">
            {t("breadcrumbBase")}
          </Link>
          <span>›</span>
          <span className="text-foreground">{isEditMode ? t("breadcrumbEdit") : t("breadcrumbNew")}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isEditMode ? t("editTitle", { title: initialData?.title || "" }) : t("createTitle")}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/reports">
              <Button type="button" variant="outline" className="rounded-xl border-border/60">
                {t("cancel")}
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl px-5 gap-2 shadow-xs bg-emerald-950 text-emerald-100 hover:bg-emerald-900"
            >
              <Save className="size-4" />
              <span>{isSubmitting ? t("saving") : t("saveReport")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-300 font-medium">
          {successMsg}
        </div>
      )}

      {/* Error Messages */}
      {errors.general && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive font-medium">
          {errors.general.join(", ")}
        </div>
      )}

      <Card className="border border-border/60 bg-card shadow-xs rounded-2xl p-6">
        <CardHeader className="p-0 mb-6 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <FileText className="size-5 text-emerald-700 dark:text-emerald-400" />
            <CardTitle className="text-base font-semibold">{t("cardTitle")}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-5">
          {/* Version Details Grid */}
          <div className="space-y-3 p-4 rounded-2xl border border-border/60 bg-muted/20">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("versionConfigTitle")} <span className="text-destructive">*</span>
              </Label>
              <Badge variant="outline" className="font-mono text-xs font-bold px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 rounded-lg">
                {formattedVersion} ({language})
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Selector de Reporte Base (Solo en modo creación) */}
              {!isEditMode && (
                <div className="space-y-1.5 sm:col-span-3">
                  <Label htmlFor="base-report-select" className="text-xs text-muted-foreground font-medium">
                    {t("baseReportLabel")} <span className="text-destructive">*</span>
                  </Label>
                  <NativeSelect
                    id="base-report-select"
                    value={selectedReportId}
                    onChange={(e) => setSelectedReportId(e.target.value)}
                    className="w-full bg-background rounded-xl text-xs font-mono"
                  >
                    <NativeSelectOption value="new">
                      {t("newBaseReportOption")}
                    </NativeSelectOption>
                    {availableBaseReports.map((b) => (
                      <NativeSelectOption key={b.id} value={b.id}>
                        Reporte Base: {b.slug} (ID: {b.id.substring(0, 8)}...)
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <p className="text-[10px] text-muted-foreground">
                    {selectedReportId === "new"
                      ? t("newBaseReportNotice")
                      : t("existingBaseReportNotice")}
                  </p>
                </div>
              )}

              {/* Título de la versión */}
              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="version-title" className="text-xs text-muted-foreground font-medium">
                  {t("versionTitleLabel")}
                </Label>
                <Input
                  id="version-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Stranded Capacity Report v1"
                  className="rounded-xl bg-background text-sm font-medium"
                  required
                />
              </div>

              {/* Input de Número de Versión */}
              <div className="space-y-1.5">
                <Label htmlFor="version-input" className="text-xs text-muted-foreground font-medium">
                  {t("versionLabel")}
                </Label>
                <div className="flex items-center rounded-xl border border-border/60 bg-background overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20">
                  <span className="px-3 py-2 text-xs font-mono font-bold bg-muted/60 text-muted-foreground border-r border-border/40 select-none">
                    v
                  </span>
                  <Input
                    id="version-input"
                    value={versionNumber}
                    disabled={isEditMode}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^0-9]/g, "");
                      setVersionNumber(sanitized);
                    }}
                    placeholder="1"
                    className="border-0 rounded-none bg-transparent text-sm font-mono focus-visible:ring-0 focus-visible:border-transparent"
                    required
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">{t("versionNumberHelper")}</p>
              </div>


              {/* Selector de Idioma */}
              <div className="space-y-1.5">
                <Label htmlFor="lang-select" className="text-xs text-muted-foreground font-medium">
                  {t("langLabel")}
                </Label>
                <NativeSelect
                  id="lang-select"
                  value={language}
                  disabled={isEditMode}
                  onChange={(e) => setLanguage(e.target.value as "ES" | "EN")}
                  className="w-full bg-background rounded-xl"
                >
                  <NativeSelectOption value="ES">Español (ES)</NativeSelectOption>
                  <NativeSelectOption value="EN">English (EN)</NativeSelectOption>
                </NativeSelect>
              </div>

              {/* Selector de Estado */}
              <div className="space-y-1.5">
                <Label htmlFor="status-select" className="text-xs text-muted-foreground font-medium">
                  {t("statusLabel")}
                </Label>
                <NativeSelect
                  id="status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
                  className="w-full bg-background rounded-xl"
                >
                  <NativeSelectOption value="DRAFT">{t("statusDraft")}</NativeSelectOption>
                  <NativeSelectOption value="PUBLISHED">{t("statusPublished")}</NativeSelectOption>
                </NativeSelect>
              </div>
            </div>

            {errors.title && <p className="text-xs text-destructive">{errors.title.join(", ")}</p>}
          </div>

          {/* Summary (Markdown Editor & Preview) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="rpt-summary" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("summaryLabel")} <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-1 p-1 bg-muted rounded-xl border border-border/40 text-xs">
                <button
                  type="button"
                  onClick={() => setSummaryTab("editor")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                    summaryTab === "editor"
                      ? "bg-background text-foreground font-medium shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Wand2 className="size-3.5" />
                  <span>{t("tabEditor")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSummaryTab("preview")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                    summaryTab === "preview"
                      ? "bg-background text-foreground font-medium shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="size-3.5" />
                  <span>{t("tabPreview")}</span>
                </button>
              </div>
            </div>

            {summaryTab === "editor" ? (
              <MDXEditorComponent
                markdown={summary}
                onChange={(val) => setSummary(val)}
              />
            ) : (
              <MdxPreview content={summary} />
            )}
            {errors.summary && <p className="text-xs text-destructive">{errors.summary.join(", ")}</p>}
          </div>

          {/* Citation Text */}
          <div className="space-y-2">
            <Label htmlFor="rpt-citation" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("citationLabel")} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rpt-citation"
              value={citationText}
              onChange={(e) => setCitationText(e.target.value)}
              placeholder={t("citationPlaceholder")}
              className="rounded-xl bg-background text-sm font-medium italic font-serif min-h-[80px] resize-y"
              required
            />
            {errors.citation_text && <p className="text-xs text-destructive">{errors.citation_text.join(", ")}</p>}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export default ReportForm;


