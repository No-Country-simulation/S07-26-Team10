"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, FileText, Wand2, Eye } from "lucide-react";
import type { ReportItem } from "../../schemas/report-schema";
import { createReportAction, updateReportAction } from "../../actions/reports-actions";
import { MDXEditorComponent } from "@/features/admin/components/ui/mdx/mdx-editor-component";
import { MdxPreview } from "@/features/admin/components/ui/mdx/mdx-preview";

import { useLanguage } from "@/context/language-context";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";

interface ReportFormProps {
  initialData?: ReportItem;
  isEditMode?: boolean;
}

const parseInitialTitle = (rawTitle?: string) => {
  if (!rawTitle) return { versionNumber: "1", lang: "es" };
  const match = rawTitle.match(/^(?:v)?([0-9.]+)-(es|en)$/i);
  if (match) {
    return { versionNumber: match[1], lang: match[2].toLowerCase() as "es" | "en" };
  }
  return { versionNumber: rawTitle.replace(/[^0-9.]/g, "") || "1", lang: "es" };
};

export function ReportForm({ initialData, isEditMode = false }: ReportFormProps) {
  const t = useTranslations("AdminPage.reports.reportForm");
  const router = useRouter();
  const { language: currentContextLang } = useLanguage();

  const initialParsed = parseInitialTitle(initialData?.title);
  const [versionNumber, setVersionNumber] = useState<string>(initialParsed.versionNumber);
  const [language, setLanguage] = useState<"es" | "en">(
    isEditMode ? (initialParsed.lang as "es" | "en") : (currentContextLang as "es" | "en") || (initialParsed.lang as "es" | "en")
  );
  
  const cleanVer = versionNumber.replace(/[^0-9.]/g, "");
  const formattedVersion = `v${cleanVer || "1"}`;
  const title = `${formattedVersion}-${language}`;

  const [summary, setSummary] = useState(initialData?.summary || "");
  const [citationText, setCitationText] = useState(initialData?.citation_text || "");
  const [summaryTab, setSummaryTab] = useState<"editor" | "preview">("editor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccessMsg("");

    try {
      const input = { title, summary, citation_text: citationText };

      const result = isEditMode && initialData?.id
        ? await updateReportAction(initialData.id, input)
        : await createReportAction(input);

      if (result.success) {
        setSuccessMsg(result.message || "");
        setTimeout(() => {
          router.push("/admin/reports");
        }, 400);
      } else {
        if (result.errors) setErrors(result.errors);
      }
    } catch {
      setErrors({ general: ["Ocurrió un error inesperado."] });
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
          {/* Title Selector (Version Input & Language Dropdown) */}
          <div className="space-y-3 p-4 rounded-2xl border border-border/60 bg-muted/20">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("titleLabel")} <span className="text-destructive">*</span>
              </Label>
              <Badge variant="outline" className="font-mono text-xs font-bold px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 rounded-lg">
                {title}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Input de Versión */}
              <div className="space-y-1.5">
                <Label htmlFor="version-input" className="text-xs text-muted-foreground font-medium">
                  Versión del Reporte
                </Label>
                <div className="flex items-center rounded-xl border border-border/60 bg-background overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20">
                  <span className="px-3 py-2 text-xs font-mono font-bold bg-muted/60 text-muted-foreground border-r border-border/40 select-none">
                    v
                  </span>
                  <Input
                    id="version-input"
                    value={versionNumber}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^0-9.]/g, "");
                      setVersionNumber(sanitized);
                    }}
                    placeholder="1.2.2"
                    className="border-0 rounded-none bg-transparent text-sm font-mono focus-visible:ring-0 focus-visible:border-transparent"
                    required
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Solo números y puntos (ej. 1.2.2)</p>
              </div>

              {/* Selector de Idioma */}
              <div className="space-y-1.5">
                <Label htmlFor="lang-select" className="text-xs text-muted-foreground font-medium">
                  Idioma del Reporte
                </Label>
                <NativeSelect
                  id="lang-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "es" | "en")}
                  className="w-full bg-background rounded-xl"
                >
                  <NativeSelectOption value="es">Español (es)</NativeSelectOption>
                  <NativeSelectOption value="en">English (en)</NativeSelectOption>
                </NativeSelect>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground italic pt-0.5">
              Identificador generado para la página principal: <strong>{title}</strong>
            </p>
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
                  <span>Editor</span>
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
                  <span>Vista Previa</span>
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

          {/* Read-only slug displayed only when editing */}
          {isEditMode && initialData?.slug && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <Label htmlFor="rpt-slug" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("slugLabel")}
              </Label>
              <Input
                id="rpt-slug"
                value={initialData.slug}
                disabled
                readOnly
                className="rounded-xl bg-muted/40 text-sm font-mono text-muted-foreground cursor-not-allowed opacity-80"
              />
              <p className="text-[11px] text-muted-foreground">
                {t("slugHelper")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}

export default ReportForm;
