"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  Search,
  AlertCircle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useVersion } from "@/context/version-context";
import {
  getReportsWithVersionsAction,
  deleteReportAction,
  deleteReportVersionAction,
  createReportAction,
  updateReportVersionAction,
} from "../../actions/reports-actions";
import type { BaseReport, ReportVersion } from "../../schemas/report-schema";

export function ReportsManagement() {
  const t = useTranslations("AdminPage.reports");
  const { refreshReports } = useVersion();
  const [baseReports, setBaseReports] = useState<BaseReport[]>([]);
  const [versions, setVersions] = useState<ReportVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "report" | "version";
    reportId: string;
    versionId?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingBase, setIsCreatingBase] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [reportFilterLang, setReportFilterLang] = useState<"all" | "ES" | "EN">(
    "all",
  );
  const [selectedBaseReportFilter, setSelectedBaseReportFilter] =
    useState<string>("all");

  const loadData = useCallback(async () => {
    setActionError(null);
    try {
      const reportsWithVersions = await getReportsWithVersionsAction();
      const bases: BaseReport[] = reportsWithVersions.map(
        ({ report_versions: _, ...base }) => base,
      );
      const allVersions: ReportVersion[] = reportsWithVersions.flatMap(
        (r) => r.report_versions,
      );

      setBaseReports(bases);
      setVersions(allVersions);
      await refreshReports();
    } catch (err) {
      console.error("Failed to load reports data", err);
    } finally {
      setLoading(false);
    }
  }, [refreshReports]);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const reportsWithVersions = await getReportsWithVersionsAction();
        if (!isMounted) return;

        const bases: BaseReport[] = reportsWithVersions.map(
          ({ report_versions: _, ...base }) => base,
        );
        const allVersions: ReportVersion[] = reportsWithVersions.flatMap(
          (r) => r.report_versions,
        );

        setBaseReports(bases);
        setVersions(allVersions);
        await refreshReports();
      } catch (err) {
        console.error("Failed to load reports data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [refreshReports]);

  const handleCreateBaseReport = async () => {
    setActionError(null);
    setIsCreatingBase(true);
    try {
      const res = await createReportAction();
      if (res.success) {
        await loadData();
      } else {
        setActionError(res.message || "Error al crear el reporte base.");
      }
    } catch (err) {
      console.error("Failed to create base report", err);
      setActionError("Error de conexión al crear el reporte base.");
    } finally {
      setIsCreatingBase(false);
    }
  };

  const handleToggleStatus = async (ver: ReportVersion) => {
    const newStatus = ver.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await updateReportVersionAction(ver.report_id, ver.id, {
        status: newStatus,
      });
      if (res.success) {
        setVersions((prev) =>
          prev.map((v) => (v.id === ver.id ? { ...v, status: newStatus } : v)),
        );
        await refreshReports();
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "report") {
        await deleteReportAction(deleteTarget.reportId);
      } else if (deleteTarget.type === "version" && deleteTarget.versionId) {
        await deleteReportVersionAction(
          deleteTarget.reportId,
          deleteTarget.versionId,
        );
      }
      await loadData();
    } catch (err) {
      console.error("Failed to delete target", err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const baseFilteredVersions = versions.filter((ver) => {
    if (selectedBaseReportFilter === "all") return true;
    return ver.report_id === selectedBaseReportFilter;
  });

  const languageFilteredVersions = baseFilteredVersions.filter((ver) => {
    if (reportFilterLang === "all") return true;
    return (ver.language || "ES").toUpperCase() === reportFilterLang;
  });

  const filteredVersions = languageFilteredVersions.filter((ver) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      ver.title?.toLowerCase().includes(q) ||
      ver.version?.toLowerCase().includes(q) ||
      ver.citation_text?.toLowerCase().includes(q) ||
      ver.summary?.toLowerCase().includes(q)
    );
  });

  const publishedCount = versions.filter(
    (v) => v.status === "PUBLISHED",
  ).length;

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto py-2">
      {/* Header section matching taxonomy style */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-700 dark:text-amber-500 uppercase tracking-widest">
          <span className="w-6 h-[2px] bg-amber-600/70 inline-block" />
          <span>{t("headerTag")}</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t("subtitle")}
          </p>
          <div className="flex items-center gap-2">
            {baseReports.length === 0 && (
              <Button
                onClick={handleCreateBaseReport}
                disabled={isCreatingBase}
                variant="outline"
                className="rounded-xl px-4 text-xs font-bold border-amber-600/30 text-amber-800 dark:text-amber-300"
              >
                {isCreatingBase ? "Creando..." : "Crear Reporte Base"}
              </Button>
            )}
            <Link href="/admin/reports/new">
              <Button className="rounded-xl px-4 gap-2 shadow-xs bg-emerald-950 text-emerald-100 hover:bg-emerald-900 text-xs font-bold">
                <Plus className="size-4" />
                <span>Nueva Versión</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl text-sm font-medium flex items-center gap-3 border bg-destructive/10 border-destructive/30 text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* KPI Stats Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border/60 bg-card shadow-2xs rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            {t("statTotalVersions")}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-foreground">
              {loading ? "-" : versions.length}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {t("statOfReports", { count: baseReports.length })}
            </span>
          </div>
        </Card>

        <Card className="border border-border/60 bg-card shadow-2xs rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            {t("statPublished")}
          </span>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl font-extrabold text-foreground">
              {loading ? "-" : publishedCount}
            </span>
            <div className="w-16 h-2 rounded-full bg-emerald-500/20 overflow-hidden">
              <div
                className="h-full bg-emerald-700 rounded-full"
                style={{
                  width: `${versions.length > 0 ? (publishedCount / versions.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </Card>

        <Card className="border border-border/60 bg-card shadow-2xs rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            {t("statBaseReports")}
          </span>
          <div className="flex items-center gap-2 mt-2">
            <CalendarDays className="size-4 text-muted-foreground/60" />
            <span className="text-sm font-bold font-mono text-foreground">
              {loading ? "-" : t("statActiveCount", { count: baseReports.length })}
            </span>
          </div>
        </Card>
      </div>

      {/* Versions Table */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Row 1: Title + count + action */}
          <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-3">
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                {t("tableTitle")}
              </h2>
              <span className="text-xs font-mono font-semibold text-muted-foreground/80 uppercase tracking-widest">
                {String(filteredVersions.length).padStart(2, "0")} / VERSIONES
              </span>
            </div>
          </div>

          {/* Row 2: Unified filter toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            {/* Base report selector */}
            {baseReports.length > 0 && (
              <NativeSelect
                value={selectedBaseReportFilter}
                onChange={(e) => setSelectedBaseReportFilter(e.target.value)}
              >
                <NativeSelectOption value="all">
                  Todos los Reportes ({baseReports.length})
                </NativeSelectOption>
                {baseReports.map((b) => (
                  <NativeSelectOption key={b.id} value={b.id}>
                    {b.slug}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}

            {/* Divider */}
            <span className="hidden sm:block h-5 w-px bg-border/60 shrink-0" />

            {/* Language toggle */}
            <div className="flex items-center p-0.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-semibold shrink-0">
              {(["all", "ES", "EN"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setReportFilterLang(lang)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    reportFilterLang === lang
                      ? "bg-card text-foreground shadow-2xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang === "all" ? "Todos" : lang}
                </button>
              ))}
            </div>

            {/* Search — grows to fill remaining space */}
            <div className="relative flex-1 min-w-0">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 h-9 w-full rounded-xl bg-card border-border/60 text-xs shadow-2xs focus-visible:ring-emerald-500/20"
              />
            </div>
          </div>

          <Card className="border border-border/60 bg-card shadow-2xs rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border/50">
                  <TableHead className="font-bold text-xs text-foreground/80 py-3">
                    {t("colVersionTitle")}
                  </TableHead>
                  <TableHead className="font-bold text-xs text-foreground/80 py-3 text-center w-28">
                    {t("colStatus")}
                  </TableHead>
                  <TableHead className="font-bold text-xs text-foreground/80 py-3 text-right w-28">
                    {t("colActions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVersions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-xs text-muted-foreground italic"
                    >
                      {searchQuery ? t("noSearchMatch") : t("noReports")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVersions.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-b border-border/40 hover:bg-muted/20"
                    >
                      <TableCell className="py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-foreground">
                              {item.title}
                            </span>
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border-emerald-500/30"
                            >
                              {item.version}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-muted/40 font-mono text-[10px] text-muted-foreground font-semibold px-2 py-0.5 rounded-md border-border/60"
                            >
                              {item.language}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground italic font-serif leading-relaxed">
                            {item.citation_text}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className="cursor-pointer outline-none"
                        >
                          <Badge
                            className={
                              item.status === "PUBLISHED"
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-full"
                                : "bg-amber-600/20 text-amber-800 dark:text-amber-300 hover:bg-amber-600/30 font-bold text-[10px] rounded-full border border-amber-600/30"
                            }
                          >
                            {item.status === "PUBLISHED"
                              ? t("statusPublished")
                              : t("statusDraft")}
                          </Badge>
                        </button>
                      </TableCell>

                      <TableCell className="text-right py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/reports/${item.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDeleteTarget({
                                type: "version",
                                reportId: item.report_id,
                                versionId: item.id,
                              })
                            }
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
      )}

      {/* Base Reports Section */}
      {baseReports.length > 0 && (
        <Card className="border border-border/60 bg-card shadow-2xs rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Reportes Base ({baseReports.length})
            </h3>
            <Button
              onClick={handleCreateBaseReport}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold border-amber-600/30 text-amber-800 dark:text-amber-300"
            >
              + Nuevo Reporte Base
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {baseReports.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20"
              >
                <div>
                  <div className="text-xs font-mono font-bold text-foreground">
                    {b.slug}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    ID: {b.id}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/admin/reports/new?reportId=${b.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 gap-1"
                    >
                      <Plus className="size-3" />
                      <span>Versión</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setDeleteTarget({
                        type: "report",
                        reportId: b.id,
                      })
                    }
                    className="size-8 text-muted-foreground hover:text-destructive"
                    title="Eliminar reporte base y todas sus versiones en cascada"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quote Footer Card at Bottom */}
      <Card className="border-l-4 border-amber-600/80 bg-muted/20 border-y border-r border-border/60 shadow-2xs rounded-2xl p-6">
        <p className="text-xs text-muted-foreground leading-relaxed italic font-serif">
          {t("quoteNote")}
        </p>
        <p className="text-[11px] font-mono text-amber-700 dark:text-amber-500 font-bold uppercase pt-2 tracking-wider">
          — {t("quoteAuthor")}
        </p>
      </Card>

      {/* Delete Confirmation Modal (Shadcn AlertDialog) */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              {deleteTarget?.type === "report"
                ? t("deleteBaseModalTitle")
                : t("deleteVersionModalTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              {deleteTarget?.type === "report"
                ? t("deleteBaseModalDesc")
                : t("deleteVersionModalDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 flex items-center justify-end gap-2">
            <AlertDialogCancel className="rounded-xl border-border/60 text-xs font-semibold">
              {t("deleteCancel")}
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="rounded-xl px-4 text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("deleting") : t("deleteConfirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function ReportsManagementSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto py-2">
      <div className="space-y-2">
        <Skeleton className="h-4 w-36 rounded-md" />
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
