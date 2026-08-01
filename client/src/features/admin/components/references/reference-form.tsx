"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, BookOpen } from "lucide-react";
import type { ReferenceItem } from "../../schemas/reference-schema";
import { getSectionOptionsAction } from "../../actions/sections-actions";

interface ReferenceFormProps {
  initialData?: ReferenceItem;
  isEditMode?: boolean;
  preselectedSectionId?: string;
}

export function ReferenceForm({ initialData, isEditMode = false, preselectedSectionId }: ReferenceFormProps) {
  const t = useTranslations("AdminPage.references.referenceForm");
  const router = useRouter();

  const [sectionId, setSectionId] = useState(initialData?.section_id || preselectedSectionId || "");
  const [authors, setAuthors] = useState(initialData?.authors || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [year, setYear] = useState<number>(initialData?.year || new Date().getFullYear());
  const [source, setSource] = useState(initialData?.source || "");
  const [displayOrder, setDisplayOrder] = useState<number>(initialData?.display_order || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sectionOptions, setSectionOptions] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    async function loadSections() {
      try {
        const secs = await getSectionOptionsAction();
        setSectionOptions(secs);
        if (!initialData?.section_id && !preselectedSectionId && secs.length > 0) {
          setSectionId(secs[0].id);
        }
      } catch (err) {
        console.error("Failed to load sections for reference form", err);
      }
    }
    loadSections();
  }, [initialData, preselectedSectionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      // Redirect back to section edit form if created from section, otherwise to references list
      if (preselectedSectionId || sectionId) {
        router.push(`/admin/sections/${preselectedSectionId || sectionId}`);
      } else {
        router.push("/admin/references");
      }
    }, 400);
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
              className="rounded-xl px-5 gap-2 shadow-xs bg-emerald-950 text-emerald-100 hover:bg-emerald-900"
            >
              <Save className="size-4" />
              <span>{isSubmitting ? t("saving") : t("saveReference")}</span>
            </Button>
          </div>
        </div>
      </div>

      <Card className="border border-border/60 bg-card shadow-xs rounded-2xl p-6">
        <CardHeader className="p-0 mb-6 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="size-5 text-emerald-700 dark:text-emerald-400" />
            <CardTitle className="text-base font-semibold">Parámetros de la Referencia Bibliográfica (APA 7)</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ref-sec" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sección <span className="text-destructive">*</span>
              </Label>
              <Select value={sectionId} onValueChange={(val) => { if (val) setSectionId(val); }}>
                <SelectTrigger id="ref-sec" className="rounded-xl bg-background text-sm">
                  <SelectValue placeholder="Seleccione una sección...">
                    {sectionOptions.find((s) => s.id === sectionId)?.title}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {sectionOptions.map((sec) => (
                    <SelectItem key={sec.id} value={sec.id}>
                      {sec.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ref-order" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Orden Jerárquico (display_order)
              </Label>
              <Input
                id="ref-order"
                type="number"
                min={1}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                className="rounded-xl bg-background text-sm font-mono font-semibold"
              />
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
                min={1900}
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
              onChange={(e) => setSource(e.target.value.toUpperCase())}
              maxLength={255}
              placeholder={t("sourcePlaceholder")}
              className="rounded-xl bg-background text-sm font-mono uppercase"
              required
            />
          </div>

          {/* Read-only citation_url displayed only when editing */}
          {isEditMode && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <Label htmlFor="ref-url" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                URL de Citación Generada (citation_url)
              </Label>
              <Input
                id="ref-url"
                value={initialData?.citation_url || "https://doi.org/..."}
                disabled
                readOnly
                className="rounded-xl bg-muted/40 text-sm font-mono text-muted-foreground cursor-not-allowed opacity-80"
              />
              <p className="text-[11px] text-muted-foreground">
                Generado automáticamente por la base de datos tras el registro de la cita.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}

export default ReferenceForm;
