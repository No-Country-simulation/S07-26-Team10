"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DownloadCloud,
  CheckCircle2,
  Pencil,
  Trash2,
  Info,
  X,
  Copy,
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
import { getSectionsWithResourcesAction } from "../../actions/sections-actions";
import { deleteResourceAction } from "../../actions/resources-actions";
import type { ResourceItem } from "../../schemas/resource-schema";
import type { SectionItem } from "../../schemas/section-schema";

import { useVersion } from "@/context/version-context";

export function ResourcesManagement() {
  const t = useTranslations("AdminPage.resources");
  const { activeReportId, activeVersionId } = useVersion();
  const targetVersionId = activeVersionId || activeReportId;
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!targetVersionId) {
        setResources([]);
        setSections([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Una sola request: GET /report-versions/{id}/sections/admin/with-resources
        const sectionsWithResources = await getSectionsWithResourcesAction(targetVersionId);
        setSections(sectionsWithResources);
        setResources(sectionsWithResources.flatMap((s) => s.resources));
      } catch (err) {
        console.error("Failed to load resources data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [targetVersionId]);


  const confirmDelete = async () => {
    if (!resourceToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const targetRes = resources.find((r) => r.id === resourceToDelete);
      const res = await deleteResourceAction(
        resourceToDelete,
        targetRes?.section_id,
        targetRes?.cloudinary_public_id
      );
      if (res.success) {
        setResources((prev) => prev.filter((r) => r.id !== resourceToDelete));
        setResourceToDelete(null);
      } else {
        setDeleteError(res.message || "Error al eliminar el recurso.");
      }
    } catch (err) {
      console.error("Error deleting resource:", err);
      setDeleteError("Error de conexión al eliminar el recurso.");
    } finally {
      setIsDeleting(false);
    }
  };



  // Group resources by section_id
  const groupedResources = sections.map((sec, idx) => ({
    section: sec,
    sectionIndex: idx + 1,
    items: resources.filter((r) => r.section_id === sec.id),
  }));

  // Statistics calculations
  const totalResources = resources.length;
  const downloadableCount = resources.filter((r) => r.downloadable).length;
  const missingAltCount = resources.filter((r) => !r.alt_text || r.alt_text.trim() === "").length;

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto py-2">
      {/* Header section matching taxonomy style */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-700 dark:text-amber-500 uppercase tracking-widest">
          <span className="w-6 h-[2px] bg-amber-600/70 inline-block" />
          <span>{t("breadcrumb")}</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl pt-1 leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <Card className="border border-border/60 bg-card shadow-2xs rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-medium">{t("statTotal")}</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-foreground">{loading ? "-" : totalResources}</span>
            <span className="text-[10px] font-mono text-muted-foreground">{t("statTotalSub")}</span>
          </div>
        </Card>

        {/* Stat 2 */}
        <Card className="border border-border/60 bg-card shadow-2xs rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-medium">{t("statDownloadable")}</span>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl font-extrabold text-foreground">{loading ? "-" : downloadableCount}</span>
            <div className="w-16 h-2 rounded-full bg-amber-500/20 overflow-hidden">
              <div className="h-full bg-amber-700 w-3/4 rounded-full" />
            </div>
          </div>
        </Card>

        {/* Stat 3 */}
        <Card className="border border-border/60 bg-card shadow-2xs rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-medium">{t("statMissingAlt")}</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-3xl font-extrabold text-foreground">{loading ? "-" : missingAltCount}</span>
            <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </Card>

        {/* Stat 4 */}
        <Card className="border border-border/60 bg-card shadow-2xs rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-medium">{t("statStorage")}</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-extrabold text-foreground">42.8</span>
            <span className="text-[11px] font-mono text-muted-foreground">MB / 1GB</span>
          </div>
        </Card>
      </div>

      {/* Sections and Resources List */}
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : (
        groupedResources.map((group) => (
          <div key={group.section.id} className="space-y-3 pt-2">
            {/* Section Header Title */}
            <div className="flex items-baseline gap-3 border-b border-border/40 pb-2">
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                {group.section.title}
              </h2>
              <span className="text-xs font-mono font-semibold text-muted-foreground/80 uppercase tracking-widest">
                {String(group.sectionIndex).padStart(2, "0")} / SECCIÓN
              </span>
            </div>

            {/* Resources Table for Section */}
            <Card className="border border-border/60 bg-card shadow-2xs rounded-2xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-b border-border/50">
                    <TableHead className="font-bold text-xs text-foreground/80 py-3">{t("colTitle")}</TableHead>
                    <TableHead className="font-bold text-xs text-foreground/80 py-3 text-center w-28">{t("colType")}</TableHead>
                    <TableHead className="font-bold text-xs text-foreground/80 py-3 text-center w-32">{t("colDownloadable")}</TableHead>
                    <TableHead className="font-bold text-xs text-foreground/80 py-3">{t("colAltText")}</TableHead>
                    <TableHead className="font-bold text-xs text-foreground/80 py-3 text-right w-24">{t("colActions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground italic">
                        No hay recursos registrados para esta sección.
                      </TableCell>
                    </TableRow>
                  ) : (
                    group.items.map((item) => (
                      <TableRow key={item.id} className="border-b border-border/40 hover:bg-muted/20">
                        <TableCell className="font-bold text-sm text-foreground py-3.5">
                          {item.title}
                        </TableCell>
                        <TableCell className="text-center py-3.5">
                          <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] px-2.5 py-0.5 rounded-full border-0">
                            {item.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center py-3.5 text-xs font-medium">
                          {item.downloadable ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                              <DownloadCloud className="size-3.5" /> {t("yes")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-muted-foreground/70">
                              <X className="size-3.5" /> {t("no")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate py-3.5">
                          {item.alt_text || "-"}
                        </TableCell>
                        <TableCell className="text-right py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            {item.file_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Copiar enlace del archivo"
                                onClick={() => {
                                  navigator.clipboard.writeText(item.file_url || "");
                                }}
                                className="size-8 text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400"
                              >
                                <Copy className="size-3.5" />
                              </Button>
                            )}
                            <Link href={`/admin/resources/${item.id}`}>
                              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
                                <Pencil className="size-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setResourceToDelete(item.id!)}
                              className="size-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        ))
      )}

      {/* Style Guide Info Card at Bottom */}
      <Card className="border border-border/60 bg-muted/20 shadow-2xs rounded-2xl p-6 flex gap-4 items-start">
        <div className="size-9 rounded-full bg-background border border-border/60 flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
          <Info className="size-4" />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground leading-relaxed italic font-serif">
            {t("styleNoteQuote")}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground/80 font-semibold pt-1">
            — {t("styleNoteAuthor")}
          </p>
        </div>
      </Card>

      {/* Modal de confirmación para eliminar recurso */}
      <AlertDialog open={!!resourceToDelete} onOpenChange={(open) => { if (!open) { setResourceToDelete(null); setDeleteError(null); } }}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              {t("deleteModalTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              {t("deleteModalDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium my-2">
              {deleteError}
            </div>
          )}
          <AlertDialogFooter className="pt-4 flex items-center justify-end gap-2">
            <AlertDialogCancel className="rounded-xl border-border/60 text-xs font-semibold">
              {t("cancel")}
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="rounded-xl px-4 text-xs font-semibold"
            >
              {isDeleting ? t("deleting") : t("deleteConfirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function ResourcesManagementSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto py-2">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-4 gap-4">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
