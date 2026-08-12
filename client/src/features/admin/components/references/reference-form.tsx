"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, BookOpen, AlertCircle, CheckCircle2, Link2 } from "lucide-react";
import type { ReferenceItem } from "../../schemas/reference-schema";
import { createReferenceAction, updateReferenceAction } from "../../actions/references-actions";
import { useVersion } from "@/context/version-context";

interface ReferenceFormProps {
  initialData?: ReferenceItem;
  isEditMode?: boolean;
  preselectedReportId?: string;
}

export function ReferenceForm({ initialData, isEditMode = false, preselectedReportId }: ReferenceFormProps) {
  const t = useTranslations("AdminPage.references.referenceForm");
  const router = useRouter();
  const { activeReportId, reportVersions } = useVersion();

  const [reportId, setReportId] = useState(
    () => initialData?.report_id || preselectedReportId || activeReportId || reportVersions?.[0]?.id || ""
  );
  const [authors, setAuthors] = useState(initialData?.authors || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [year, setYear] = useState<number>(initialData?.year || new Date().getFullYear());
  const [source, setSource] = useState(initialData?.source || "");
  const [citationUrl, setCitationUrl] = useState(initialData?.citation_url || "");
  const [displayOrder, setDisplayOrder] = useState<number>(initialData?.display_order ?? 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const reportOptions = React.useMemo(() => {
    if (reportVersions && reportVersions.length > 0) {
      return reportVersions.map((v) => ({ id: v.id, title: `${v.title} (${v.version})` }));
    }
    return [];
  }, [reportVersions]);


  const [autoOrder, setAutoOrder] = useState<boolean>(!isEditMode && initialData?.display_order === undefined);

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
          reportId
        );

        if (res.success) {
          setFeedback({
            type: "success",
            message: res.message || "Referencia actualizada exitosamente.",
          });
          setTimeout(() => {
            router.push("/admin/references");
          }, 1000);
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
          }, 1000);
        } else {
          setFeedback({
            type: "error",
            message: res.message || "Error al crear la referencia.",
          });
        }
      }
    } catch (err) {
      console.error("Error submitting reference form:", err);
      setFeedback({
        type: "error",
        message: "No se pudo procesar la solicitud.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-2">
      {/* Breadcrumb Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Link href="/admin/references" className="hover:text-foreground">
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
            <Link href="/admin/references">
              <Button type="button" variant="outline" className="rounded-xl border-border/60">
                {t("cancel")}
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl px-5 gap-2 shadow-xs bg-emerald-950 text-emerald-100 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              <Save className="size-4" />
              <span>{isSubmitting ? t("saving") : t("saveReference")}</span>
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

      <Card className="border border-border/60 bg-card shadow-xs rounded-2xl p-6">
        <CardHeader className="p-0 mb-6 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="size-5 text-emerald-700 dark:text-emerald-400" />
            <CardTitle className="text-base font-semibold">{t("cardTitle")}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ref-report" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("reportLabel")} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={reportId}
                disabled={isEditMode}
                onValueChange={(val) => { if (val) setReportId(val); }}
              >
                <SelectTrigger id="ref-report" className="rounded-xl bg-background text-sm">
                  <SelectValue placeholder={t("reportPlaceholder")}>
                    {reportOptions.find((r) => r.id === reportId)?.title || t("reportPlaceholder")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {reportOptions.map((rep) => (
                    <SelectItem key={rep.id} value={rep.id}>
                      {rep.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="ref-order" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("orderLabel")}
                </Label>
                <div className="flex items-center gap-1.5">
                  <Switch
                    id="auto-order-switch"
                    checked={autoOrder}
                    onCheckedChange={(checked) => setAutoOrder(checked)}
                  />
                  <Label htmlFor="auto-order-switch" className="text-xs cursor-pointer text-muted-foreground font-medium">
                    {t("autoOrderLabel")}
                  </Label>
                </div>
              </div>
              {autoOrder ? (
                <div className="h-10 px-3 flex items-center rounded-xl bg-muted/40 border border-dashed border-border text-xs text-muted-foreground italic">
                  {t("autoOrderNotice")}
                </div>
              ) : (
                <Input
                  id="ref-order"
                  type="number"
                  min={1}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                  className="rounded-xl bg-background text-sm font-mono font-semibold"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ref-authors" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Autores (formato APA) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ref-authors"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                maxLength={255}
                placeholder={t("authorsPlaceholder")}
                className="rounded-xl bg-background text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ref-year" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Año de Publicación <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ref-year"
                type="number"
                min={1800}
                max={2100}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                className="rounded-xl bg-background text-sm font-mono font-semibold"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ref-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Título del Artículo / Publicación <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ref-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              placeholder={t("titlePlaceholder")}
              className="rounded-xl bg-background text-sm font-medium italic font-serif"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ref-source" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fuente / Revista / Conferencia (source) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ref-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              maxLength={255}
              placeholder={t("sourcePlaceholder")}
              className="rounded-xl bg-background text-sm font-mono uppercase"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ref-url" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Link2 className="size-3.5" />
              <span>{t("citationUrlLabel")}</span>
            </Label>
            <Input
              id="ref-url"
              value={citationUrl}
              onChange={(e) => setCitationUrl(e.target.value)}
              placeholder="https://doi.org/10.1016/..."
              className="rounded-xl bg-background text-sm font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              {t("citationUrlHelper")}
            </p>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export default ReferenceForm;
