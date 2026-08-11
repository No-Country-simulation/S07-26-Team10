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
  Info,
  BookOpen,
  PlusCircle,
  Pencil,
  Trash2,
  AlertCircle,
  ExternalLink,
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
import { getReferencesAction, deleteReferenceAction } from "../../actions/references-actions";
import type { ReferenceItem } from "../../schemas/reference-schema";
import { useVersion } from "@/context/version-context";

export function ReferencesManagement() {
  const t = useTranslations("AdminPage.references");
  const { activeReportId } = useVersion();

  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [referenceToDelete, setReferenceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!activeReportId) {
        setReferences([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const refData = await getReferencesAction(activeReportId);
        setReferences(refData);
      } catch (err) {
        console.error("Failed to load references data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeReportId]);

  const confirmDelete = async () => {
    if (!referenceToDelete) return;
    setIsDeleting(true);
    try {
      const targetRef = references.find((r) => r.id === referenceToDelete);
      const targetVersionId = targetRef?.report_version_id || targetRef?.report_id || activeReportId || undefined;
      const res = await deleteReferenceAction(referenceToDelete, targetVersionId);
      if (res.success) {
        setReferences((prev) => prev.filter((r) => r.id !== referenceToDelete));
        setReferenceToDelete(null);
      }
    } catch (err) {
      console.error("Failed to delete reference", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto py-2">
      {/* Header section matching mockup */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-700 dark:text-amber-500 uppercase tracking-widest">
          <span className="w-6 h-[2px] bg-amber-600/70 inline-block" />
          <span>{t("headerTag")}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl pt-1 leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          <Link href={`/admin/references/new${activeReportId ? `?reportId=${activeReportId}` : ""}`}>
            <Button className="rounded-xl px-5 gap-2 shadow-xs bg-emerald-950 text-emerald-100 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600">
              <PlusCircle className="size-4" />
              <span>Nueva Referencia</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Warning banner if no report is active */}
      {!activeReportId && (
        <div className="p-4 rounded-xl text-sm font-medium flex items-center gap-3 border bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300">
          <AlertCircle className="size-5 shrink-0" />
          <span>No hay un reporte activo seleccionado en el contexto de versión. Por favor seleccione una versión con reporte en la barra superior.</span>
        </div>
      )}

      {/* Main 2-column Layout: Left Control Panel & Right References Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Control Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Style Guide Card */}
          <Card className="border border-border/60 bg-muted/20 shadow-2xs rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Info className="size-4 text-amber-700 dark:text-amber-500" />
              <span>{t("styleGuideTitle")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-mono">
              {t("styleGuideDesc")}
            </p>
          </Card>

          {/* Decorative Image Card */}
          <div className="rounded-2xl border border-border/40 bg-emerald-950/90 text-emerald-100 p-6 flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden min-h-[160px]">
            <BookOpen className="size-12 text-emerald-400/30 mb-2" />
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">
              BIBLIOGRAFÍA APA 7
            </span>
          </div>
        </div>

        {/* Right Area: References Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          ) : (
            <Card className="border border-border/60 bg-card shadow-2xs rounded-2xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-b border-border/50">
                    <TableHead className="font-bold text-xs text-foreground/80 py-3 text-center w-16">{t("colOrder")}</TableHead>
                    <TableHead className="font-bold text-xs text-foreground/80 py-3">{t("colAuthorsTitle")}</TableHead>
                    <TableHead className="font-bold text-xs text-foreground/80 py-3 text-center w-20">{t("colYear")}</TableHead>
                    <TableHead className="font-bold text-xs text-foreground/80 py-3 text-center w-36">{t("colSource")}</TableHead>
                    <TableHead className="font-bold text-xs text-foreground/80 py-3 text-right w-20">{t("colActions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {references.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground italic">
                        No hay referencias registradas para este reporte.
                      </TableCell>
                    </TableRow>
                  ) : (
                    references.map((item) => (
                      <TableRow key={item.id} className="border-b border-border/40 hover:bg-muted/20">
                        <TableCell className="text-center py-3">
                          <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400">
                            {String(item.display_order ?? 0).padStart(2, "0")}
                          </span>
                        </TableCell>

                        <TableCell className="py-3">
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-foreground">{item.authors}</div>
                            <div className="text-xs italic font-serif text-emerald-900 dark:text-emerald-300">
                              {item.title}
                            </div>
                            {item.citation_url && (
                              <a
                                href={item.citation_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-emerald-600 truncate max-w-xs"
                              >
                                <ExternalLink className="size-3 shrink-0" />
                                <span className="truncate">{item.citation_url}</span>
                              </a>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-center font-mono text-xs text-muted-foreground py-3">
                          {item.year}
                        </TableCell>

                        <TableCell className="text-center py-3">
                          <Badge variant="outline" className="bg-muted/40 font-mono text-[10px] text-muted-foreground font-semibold uppercase px-2 py-0.5 rounded-md border-border/60">
                            {item.source}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admin/references/${item.id}`}>
                              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground">
                                <Pencil className="size-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setReferenceToDelete(item.id)}
                              className="size-7 text-muted-foreground hover:text-destructive"
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
          )}
        </div>
      </div>

      {/* Quote Footer Card at Bottom */}
      <Card className="border-l-4 border-amber-600/80 bg-muted/20 border-y border-r border-border/60 shadow-2xs rounded-2xl p-6">
        <p className="text-xs text-muted-foreground leading-relaxed italic font-serif">
          {t("quoteNote")}
        </p>
        <p className="text-[11px] font-mono text-amber-700 dark:text-amber-500 font-bold uppercase pt-2 tracking-wider">
          — {t("quoteAuthor")}
        </p>
      </Card>

      {/* Modal de confirmación para eliminar referencia */}
      <AlertDialog open={!!referenceToDelete} onOpenChange={(open) => { if (!open) setReferenceToDelete(null); }}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              ¿Eliminar esta referencia?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Esta acción eliminará permanentemente la referencia bibliográfica del reporte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 flex items-center justify-end gap-2">
            <AlertDialogCancel className="rounded-xl border-border/60 text-xs font-semibold">
              Cancelar
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={confirmDelete}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function ReferencesManagementSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto py-2">
      <div className="space-y-2">
        <Skeleton className="h-4 w-36 rounded-md" />
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>
      <div className="grid grid-cols-12 gap-6">
        <Skeleton className="col-span-4 h-64 rounded-2xl" />
        <Skeleton className="col-span-8 h-96 rounded-2xl" />
      </div>
    </div>
  );
}
