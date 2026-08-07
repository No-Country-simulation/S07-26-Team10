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
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Folder, Upload, FileCheck, CheckCircle2, AlertCircle, Link2, Loader2 } from "lucide-react";
import type { ResourceItem } from "../../schemas/resource-schema";
import { getSectionOptionsAction } from "../../actions/sections-actions";
import { createResourceAction, updateResourceAction, uploadFileAction } from "../../actions/resources-actions";
import { useVersion } from "@/context/version-context";

interface ResourceFormProps {
  initialData?: ResourceItem;
  isEditMode?: boolean;
  preselectedSectionId?: string;
}

export function ResourceForm({ initialData, isEditMode = false, preselectedSectionId }: ResourceFormProps) {
  const t = useTranslations("AdminPage.resources.resourceForm");
  const router = useRouter();
  const { activeReportId } = useVersion();

  const [sectionId, setSectionId] = useState(initialData?.section_id || preselectedSectionId || "");
  const [type, setType] = useState(initialData?.type || "IMAGE");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [fileUrl, setFileUrl] = useState(initialData?.file_url || "");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState(initialData?.cloudinary_public_id || "");
  const [altText, setAltText] = useState(initialData?.alt_text || "");
  const [downloadable, setDownloadable] = useState(initialData?.downloadable ?? true);
  
  // File upload state & Mutually exclusive Source Mode state
  const [sourceMode, setSourceMode] = useState<"file" | "url">(
    initialData?.file_url && !initialData.cloudinary_public_id ? "url" : "file"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [sectionOptions, setSectionOptions] = useState<{ id: string; title: string }[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);

  useEffect(() => {
    async function loadSections() {
      setIsLoadingSections(true);
      try {
        const secs = await getSectionOptionsAction(activeReportId ?? undefined);
        setSectionOptions(secs);
        if (!initialData?.section_id && !preselectedSectionId && secs.length > 0) {
          setSectionId(secs[0].id);
        }
      } catch (err) {
        console.error("Failed to load sections for resource form", err);
      } finally {
        setIsLoadingSections(false);
      }
    }
    loadSections();
  }, [initialData, preselectedSectionId, activeReportId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    let finalFileUrl = fileUrl;
    let finalCloudinaryId = cloudinaryPublicId;

    try {
      // 1. If uploading a file to Cloudinary
      if (sourceMode === "file" && selectedFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        const isImage = selectedFile.type.startsWith("image/") || type.toUpperCase() === "IMAGE";
        const resourceType = isImage ? "image" : "raw";

        const uploadRes = await uploadFileAction(formData, resourceType);
        setIsUploading(false);

        if (!uploadRes.success || !uploadRes.data?.file_url) {
          setFeedback({
            type: "error",
            message: uploadRes.message || t("errorUpload"),
          });
          setIsSubmitting(false);
          return;
        }

        finalFileUrl = uploadRes.data.file_url;
        finalCloudinaryId = uploadRes.data.cloudinary_public_id || "";
      } else if (sourceMode === "url") {
        finalCloudinaryId = ""; // External URL does not have a Cloudinary Public ID
      }

      if (!finalFileUrl) {
        setFeedback({
          type: "error",
          message: t("errorNoFileOrUrl"),
        });
        setIsSubmitting(false);
        return;
      }

      // 2. Submit Create or Update Resource
      if (isEditMode && initialData?.id) {
        const res = await updateResourceAction(initialData.id, {
          type,
          title,
          description,
          file_url: finalFileUrl,
          cloudinary_public_id: finalCloudinaryId,
          alt_text: altText,
          downloadable,
        });

        if (res.success) {
          setFeedback({ type: "success", message: res.message || t("successUpdated") });
          const targetSecId = res.data?.section_id || sectionId || preselectedSectionId;
          setTimeout(() => {
            if (targetSecId) {
              router.push(`/admin/sections/${targetSecId}`);
            } else {
              router.push("/admin/resources");
            }
          }, 800);
        } else {
          setFeedback({ type: "error", message: res.message || t("errorUpdated") });
        }
      } else {
        const res = await createResourceAction({
          section_id: sectionId,
          type,
          title,
          description,
          file_url: finalFileUrl,
          cloudinary_public_id: finalCloudinaryId,
          alt_text: altText,
          downloadable,
        });

        if (res.success) {
          setFeedback({ type: "success", message: res.message || t("successCreated") });
          const targetSecId = res.data?.section_id || sectionId || preselectedSectionId;
          setTimeout(() => {
            if (targetSecId) {
              router.push(`/admin/sections/${targetSecId}`);
            } else {
              router.push("/admin/resources");
            }
          }, 800);
        } else {
          setFeedback({ type: "error", message: res.message || t("errorCreated") });
        }
      }
    } catch (err) {
      console.error("Resource submit error:", err);
      setFeedback({ type: "error", message: t("errorUpdated") });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
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
            <Link href={sectionId ? `/admin/sections/${sectionId}` : preselectedSectionId ? `/admin/sections/${preselectedSectionId}` : "/admin/resources"}>
              <Button type="button" variant="outline" className="rounded-xl border-border/60">
                {t("cancel")}
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="rounded-xl px-5 gap-2 shadow-xs bg-emerald-950 text-emerald-100 hover:bg-emerald-900"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{t("uploadingFile")}</span>
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{t("saving")}</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>{t("saveResource")}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Warning Banner when creating a new resource but no sections exist */}
      {!isEditMode && sectionOptions.length === 0 && (
        <div className="p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 border bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-5 shrink-0" />
            <span>
              {t("noSectionsWarning")}
            </span>
          </div>
          <Link href="/admin/sections/new">
            <Button type="button" variant="outline" size="sm" className="rounded-xl border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 text-xs shrink-0 font-semibold">
              {t("createSectionBtn")}
            </Button>
          </Link>
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

      <Card className="border border-border/60 bg-card shadow-xs rounded-2xl p-6">
        <CardHeader className="p-0 mb-6 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <Folder className="size-5 text-emerald-700 dark:text-emerald-400" />
            <CardTitle className="text-base font-semibold">{t("breadcrumbBase")}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="res-sec" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("sectionLabel")} <span className="text-destructive">*</span>
              </Label>
              {isLoadingSections ? (
                <Skeleton className="h-10 w-full rounded-xl" />
              ) : (
                <Select value={sectionId} onValueChange={(val) => { if (val) setSectionId(val); }} disabled={isEditMode}>
                  <SelectTrigger id="res-sec" className={`rounded-xl bg-background text-sm font-medium w-full min-w-0 overflow-hidden ${isEditMode ? "opacity-80 bg-muted/50 cursor-not-allowed" : ""}`}>
                    <SelectValue placeholder={t("sectionLabel")}>
                      <span className="truncate block max-w-[240px] sm:max-w-[340px]">
                        {sectionOptions.find((s) => s.id === sectionId)?.title || t("sectionLabel")}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-w-lg">
                    {sectionOptions.length === 0 ? (
                      <div className="p-3 text-xs text-muted-foreground italic text-center">
                        {t("noSectionsWarning")}
                      </div>
                    ) : (
                      sectionOptions.map((sec) => (
                        <SelectItem key={sec.id} value={sec.id} className="cursor-pointer max-w-full">
                          <span className="truncate block max-w-[280px] sm:max-w-[380px]" title={sec.title}>
                            {sec.title}
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="res-type" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("typeLabel")} <span className="text-destructive">*</span>
              </Label>
              <Select value={type} onValueChange={(val) => { if (val) setType(val as any); }}>
                <SelectTrigger id="res-type" className="rounded-xl bg-background text-sm font-medium">
                  <SelectValue placeholder={t("typePlaceholder")}>
                    {type === "IMAGE" && t("typeImage")}
                    {type === "GRAPH" && t("typeGraph")}
                    {type === "DIAGRAM" && t("typeDiagram")}
                    {type === "FILE" && t("typeFile")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="IMAGE">{t("typeImage")}</SelectItem>
                  <SelectItem value="GRAPH">{t("typeGraph")}</SelectItem>
                  <SelectItem value="DIAGRAM">{t("typeDiagram")}</SelectItem>
                  <SelectItem value="FILE">{t("typeFile")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="res-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("titleLabel")} <span className="text-destructive">*</span>
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

          {/* Mode Selector for Asset Source: Upload File VS External URL */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("assetSourceLabel")} <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl border border-border/40 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSourceMode("file");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                    sourceMode === "file"
                      ? "bg-background text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Upload className="size-3.5" />
                  <span>{t("uploadFileBtn")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSourceMode("url");
                    setSelectedFile(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                    sourceMode === "url"
                      ? "bg-background text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Link2 className="size-3.5" />
                  <span>{t("urlBtn")}</span>
                </button>
              </div>
            </div>

            {sourceMode === "file" ? (
              /* File Upload Input Dropzone Field */
              <div className="relative border-2 border-dashed border-border/70 hover:border-emerald-700/50 transition-all rounded-2xl p-5 bg-muted/20 text-center flex flex-col items-center justify-center gap-2 group cursor-pointer">
                <input
                  type="file"
                  id="res-file-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setFileUrl("");
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
                ) : fileUrl ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                      <FileCheck className="size-4 shrink-0 text-emerald-600" />
                      <span className="truncate max-w-xs">{t("currentFile", { url: fileUrl })}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground pt-1">
                      {t("replaceFileHint")}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="size-10 rounded-full bg-background border border-border/60 flex items-center justify-center text-muted-foreground group-hover:scale-105 group-hover:text-emerald-700 transition-all">
                      <Upload className="size-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">
                        {t("dropzoneClick")}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("dropzoneHint")}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* File URL Direct Input Field */
              <div className="space-y-1.5">
                <Input
                  id="res-url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder={t("fileUrlPlaceholder")}
                  className="rounded-xl bg-background text-sm font-mono"
                  required={sourceMode === "url"}
                />
                <p className="text-[11px] text-muted-foreground">
                  {t("fileUrlHelper")}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="res-alt" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("altTextLabel")}
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
              {t("descLabel")}
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
                {t("downloadableLabel")}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {t("downloadableLabel")}
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
