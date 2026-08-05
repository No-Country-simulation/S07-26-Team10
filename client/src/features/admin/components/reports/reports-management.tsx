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
  FileText,
  Plus,
  Pencil,
  Trash2,
  Info,
  CalendarDays,
  BookMarked,
  Search,
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
import { useLanguage } from "@/context/language-context";
import { useVersion, parseReportSlug } from "@/context/version-context";
import { getReportsAction, deleteReportAction } from "../../actions/reports-actions";
import type { ReportItem } from "../../schemas/report-schema";

function getLatestVersion(reports: ReportItem[]): string {
  if (!reports || reports.length === 0) return "-";

  const parsed = reports
    .map((r) => {
      const p = parseReportSlug(r.slug || r.title || "");
      if (p) return { title: r.title || r.slug, versionStr: p.version.replace(/^v/i, "") };
      const match = (r.title || r.slug || "").match(/^(?:v)?([0-9.-]+)/i);
      return match ? { title: r.title || r.slug, versionStr: match[1] } : null;
    })
    .filter(Boolean) as { title: string; versionStr: string }[];

  if (parsed.length === 0) {
    const first = reports[0];
    return first.title || first.slug || "-";
  }

  parsed.sort((a, b) => {
    const partsA = a.versionStr.split(/[\.-]/).map(Number);
    const partsB = b.versionStr.split(/[\.-]/).map(Number);
    const maxLen = Math.max(partsA.length, partsB.length);
    for (let i = 0; i < maxLen; i++) {
      const numA = isNaN(partsA[i]) ? 0 : partsA[i];
      const numB = isNaN(partsB[i]) ? 0 : partsB[i];
      if (numA !== numB) return numB - numA;
    }
    return 0;
  });

  return `v${parsed[0].versionStr}`;
}

export function ReportsManagement() {
  const t = useTranslations("AdminPage.reports");
  const { language } = useLanguage();
  const { refreshReports } = useVersion();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getReportsAction();
        setReports(data);
        await refreshReports();
      } catch (err) {
        console.error("Failed to load reports data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshReports]);

  const confirmDelete = async () => {
    if (!deleteReportId) return;
    setIsDeleting(true);
    try {
      await deleteReportAction(deleteReportId);
      setReports((prev) => prev.filter((r) => r.id !== deleteReportId));
      await refreshReports();
    } catch (err) {
      console.error("Failed to delete report", err);
    } finally {
      setIsDeleting(false);
      setDeleteReportId(null);
    }
  };

  const languageFilteredReports = reports.filter((item) => {
    const slugStr = item.slug || item.title || "";
    const parsed = parseReportSlug(slugStr);
    if (parsed) {
      return parsed.lang === language;
    }
    const titleLower = (item.title || "").toLowerCase();
    const slugLower = (item.slug || "").toLowerCase();
    if (titleLower.includes("-es") || titleLower.includes("-en") || slugLower.includes("-es") || slugLower.includes("-en")) {
      return titleLower.endsWith(`-${language}`) || slugLower.endsWith(`-${language}`) || titleLower.includes(`-${language}`);
    }
    return true;
  });

  const filteredReports = languageFilteredReports.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.slug?.toLowerCase().includes(q) ||
      item.citation_text?.toLowerCase().includes(q) ||
      item.summary?.toLowerCase().includes(q)
    );
  });

  const totalLanguageReports = languageFilteredReports.length;

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
          <Link href="/admin/reports/new">
            <Button className="rounded-xl px-4 gap-2 shadow-xs bg-emerald-950 text-emerald-100 hover:bg-emerald-900 text-xs font-bold">
              <Plus className="size-4" />
              <span>{t("newReportBtn")}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border/60 bg-card shadow-2xs rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-medium">{t("statTotal")}</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-foreground">{loading ? "-" : totalLanguageReports}</span>
            <span className="text-[10px] font-mono text-muted-foreground">{t("statTotalSub")}</span>
          </div>
        </Card>

        <Card className="border border-border/60 bg-card shadow-2xs rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-medium">{t("statPublished")}</span>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl font-extrabold text-foreground">{loading ? "-" : totalLanguageReports}</span>
            <div className="w-16 h-2 rounded-full bg-emerald-500/20 overflow-hidden">
              <div className="h-full bg-emerald-700 w-full rounded-full" />
            </div>
          </div>
        </Card>

        <Card className="border border-border/60 bg-card shadow-2xs rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-medium">{t("statLastUpdate")}</span>
          <div className="flex items-center gap-2 mt-2">
            <CalendarDays className="size-4 text-muted-foreground/60" />
            <span className="text-sm font-bold font-mono text-foreground">
              {loading ? "-" : getLatestVersion(languageFilteredReports)}
            </span>
          </div>
        </Card>
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-2">
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                {t("tableTitle")}
              </h2>
              <span className="text-xs font-mono font-semibold text-muted-foreground/80 uppercase tracking-widest">
                {String(filteredReports.length).padStart(2, "0")} / {t("tableCountLabel")}
              </span>
            </div>

            {/* Client-side Search Input on the Right */}
            <div className="relative w-full sm:w-64">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar reporte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 h-9 rounded-xl bg-card border-border/60 text-xs shadow-2xs focus-visible:ring-emerald-500/20"
              />
            </div>
          </div>

          <Card className="border border-border/60 bg-card shadow-2xs rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border/50">
                  <TableHead className="font-bold text-xs text-foreground/80 py-3">{t("colTitle")}</TableHead>
                  <TableHead className="font-bold text-xs text-foreground/80 py-3 text-right w-28">{t("colActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-xs text-muted-foreground italic">
                      {searchQuery ? "No se encontraron reportes que coincidan con la búsqueda." : t("noReports")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((item) => (
                    <TableRow key={item.id} className="border-b border-border/40 hover:bg-muted/20">
                      <TableCell className="py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-sm font-bold text-foreground">{item.title}</span>
                            {item.slug && (
                              <Badge variant="outline" className="bg-muted/40 font-mono text-[10px] text-muted-foreground font-semibold px-2 py-0.5 rounded-md border-border/60">
                                {item.slug}
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground italic font-serif leading-relaxed">
                            {item.citation_text}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-right py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/reports/${item.id}`}>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
                              <Pencil className="size-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteReportId(item.id!)}
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
      <AlertDialog open={!!deleteReportId} onOpenChange={(open) => !open && setDeleteReportId(null)}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              ¿Eliminar este reporte?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Esta acción no se puede deshacer. Se eliminará permanentemente el reporte y su configuración asociada del sistema.
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
              className="rounded-xl px-4 text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
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
