"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Folder, Upload, FileCheck } from "lucide-react";
import type { ResourceItem } from "../../schemas/resource-schema";
import { getSectionOptionsAction } from "../../actions/sections-actions";

interface ResourceFormProps {
  initialData?: ResourceItem;
  isEditMode?: boolean;
  preselectedSectionId?: string;
}

export function ResourceForm({ initialData, isEditMode = false, preselectedSectionId }: ResourceFormProps) {
  const t = useTranslations("AdminPage.resources.resourceForm");
  const router = useRouter();

  const [sectionId, setSectionId] = useState(initialData?.section_id || preselectedSectionId || "");
  const [type, setType] = useState(initialData?.type || "Diagrama");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [altText, setAltText] = useState(initialData?.alt_text || "");
  const [downloadable, setDownloadable] = useState(initialData?.downloadable ?? true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
        console.error("Failed to load sections for resource form", err);
      }
    }
    loadSections();
  }, [initialData, preselectedSectionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      // Redirect back to section edit form if created from section, otherwise to resources list
      if (preselectedSectionId || sectionId) {
        router.push(`/admin/sections/${preselectedSectionId || sectionId}`);
      } else {
        router.push("/admin/resources");
      }
    }, 400);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-2">
      {/* Breadcrumb Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Link href="/admin/resources" className="hover:text-foreground">
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
            <Link href="/admin/resources">
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
              <span>{isSubmitting ? t("saving") : t("saveResource")}</span>
            </Button>
          </div>
        </div>
      </div>

      <Card className="border border-border/60 bg-card shadow-xs rounded-2xl p-6">
        <CardHeader className="p-0 mb-6 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <Folder className="size-5 text-emerald-700 dark:text-emerald-400" />
            <CardTitle className="text-base font-semibold">Parámetros del Recurso (resources)</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="res-sec" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sección <span className="text-destructive">*</span>
              </Label>
              <Select value={sectionId} onValueChange={(val) => { if (val) setSectionId(val); }}>
                <SelectTrigger id="res-sec" className="rounded-xl bg-background text-sm">
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
              <Label htmlFor="res-type" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tipo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="res-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                maxLength={50}
                placeholder={t("typePlaceholder")}
                className="rounded-xl bg-background text-sm font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="res-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Título del Recurso <span className="text-destructive">*</span>
            </Label>
            <Input
              id="res-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              placeholder={t("titlePlaceholder")}
              className="rounded-xl bg-background text-sm font-medium"
              required
            />
          </div>

          {/* File Upload Input Dropzone Field */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Archivo / Asset Adjunto <span className="text-destructive">*</span>
            </Label>
            <div className="relative border-2 border-dashed border-border/70 hover:border-emerald-700/50 transition-all rounded-2xl p-5 bg-muted/20 text-center flex flex-col items-center justify-center gap-2 group cursor-pointer">
              <input
                type="file"
                id="res-file-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              {selectedFile ? (
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                  <FileCheck className="size-4 shrink-0 text-emerald-600" />
                  <span className="truncate max-w-xs">{selectedFile.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <>
                  <div className="size-10 rounded-full bg-background border border-border/60 flex items-center justify-center text-muted-foreground group-hover:scale-105 group-hover:text-emerald-700 transition-all">
                    <Upload className="size-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">
                      Haz clic para seleccionar o arrastra tu archivo aquí
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Soporta PNG, JPG, WEBP, SVG, PDF o CSV (Máx 25MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="res-alt" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Texto Alternativo (alt_text) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="res-alt"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              maxLength={255}
              placeholder={t("altTextPlaceholder")}
              className="rounded-xl bg-background text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="res-desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Descripción
            </Label>
            <Textarea
              id="res-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t("descPlaceholder")}
              className="rounded-xl bg-background text-xs leading-relaxed p-3 border-border/60"
            />
          </div>

          <div className="pt-3 border-t border-border/40 flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Permitir Descarga de Archivo (downloadable)
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Permite a los usuarios descargar directamente este recurso desde el reporte.
              </p>
            </div>
            <Switch
              checked={downloadable}
              onCheckedChange={setDownloadable}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export default ResourceForm;
