"use client";

import React, { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";
import {
  Zap,
  Server,
  Network,
  PlusCircle,
  Pencil,
  Trash2,
  Layers,
} from "lucide-react";
import {
  getCategoriesAction,
  deleteCategoryAction,
  getConceptsByCategoryAction,
  deleteConceptAction,
} from "../../actions/taxonomy-actions";
import type { CategoryItem } from "../../schemas/taxonomy-schema";
import { useVersion } from "@/context/version-context";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function TaxonomyManagement() {
  const t = useTranslations("AdminPage.taxonomy");
  const { activeReportId, activeVersionId, activeReportVersion } = useVersion();
  const targetVersionId = activeReportVersion?.id || activeVersionId || activeReportId;

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [conceptToDelete, setConceptToDelete] = useState<{ id: string; categoryId: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteCategory = async () => {
    if (!categoryToDelete?.id) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteCategoryAction(categoryToDelete.id, targetVersionId || undefined);
      if (res.success) {
        setCategories((prev) =>
          prev.filter((c) => c.id !== categoryToDelete.id),
        );
        setCategoryToDelete(null);
      } else {
        setDeleteError(res.message || t("errorDelete"));
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
      setDeleteError(t("errorDelete"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteConcept = async () => {
    if (!conceptToDelete?.id) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteConceptAction(conceptToDelete.id, conceptToDelete.categoryId);
      if (res.success) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === conceptToDelete.categoryId
              ? { ...c, concepts: c.concepts.filter((cn) => cn.id !== conceptToDelete.id) }
              : c
          )
        );
        setConceptToDelete(null);
      } else {
        setDeleteError(res.message || "Error al eliminar el concepto.");
      }
    } catch (err) {
      console.error("Failed to delete concept:", err);
      setDeleteError("Error de conexión al eliminar el concepto.");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getCategoriesAction(targetVersionId || undefined);
        const categoriesWithConcepts = await Promise.all(
          data.map(async (cat) => {
            if (cat.id) {
              const concepts = await getConceptsByCategoryAction(cat.id);
              return { ...cat, concepts: concepts.length > 0 ? concepts : cat.concepts };
            }
            return cat;
          })
        );
        setCategories(categoriesWithConcepts);
      } catch (err) {
        console.error("Failed to load taxonomy categories", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeReportId, targetVersionId]);

  const getCategoryIcon = (catName: string) => {
    const lower = catName.toLowerCase();
    if (lower.includes("facility")) {
      return <Zap className="size-4 text-emerald-700 dark:text-emerald-400" />;
    }
    if (lower.includes("it")) {
      return (
        <Server className="size-4 text-emerald-700 dark:text-emerald-400" />
      );
    }
    if (lower.includes("workload")) {
      return (
        <Network className="size-4 text-emerald-700 dark:text-emerald-400" />
      );
    }
    return <Layers className="size-4 text-emerald-700 dark:text-emerald-400" />;
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto py-2">
      {/* Header section matching mockup */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-700 dark:text-amber-500 uppercase tracking-widest">
          <span className="w-6 h-[2px] bg-amber-600/70 inline-block" />
          <span>{t("headerTag")}</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl pt-1 leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Section 1: Categorías principales */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-3">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {t("mainCategoriesTitle")}
            </h2>
            <p className="text-xs text-muted-foreground italic font-serif">
              {t("mainCategoriesSubtitle")}
            </p>
          </div>
          <Link href="/admin/taxonomy/categories/new">
            <Button className="bg-emerald-950 text-emerald-100 hover:bg-emerald-900 rounded-lg text-xs font-semibold tracking-wider px-4 py-2 shadow-sm gap-1.5 uppercase">
              {t("newCategoryBtn")}
            </Button>
          </Link>
        </div>

        {/* Categories Table */}
        <Card className="border border-border/60 bg-card shadow-xs rounded-2xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border/50">
                <TableHead className="font-bold text-xs text-foreground/80 py-3">
                  {t("colCategory")}
                </TableHead>
                <TableHead className="font-bold text-xs text-foreground/80 py-3">
                  {t("colDescription")}
                </TableHead>
                <TableHead className="font-bold text-xs text-foreground/80 py-3 text-center w-24">
                  {t("colOrder")}
                </TableHead>
                <TableHead className="font-bold text-xs text-foreground/80 py-3 text-center w-28">
                  {t("colStatus")}
                </TableHead>
                <TableHead className="font-bold text-xs text-foreground/80 py-3 text-right w-24">
                  {t("colActions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-4">
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow
                    key={cat.id}
                    className="border-b border-border/40 hover:bg-muted/20"
                  >
                    <TableCell className="font-semibold text-sm text-foreground py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="size-2 rounded-full bg-emerald-900 dark:bg-emerald-400" />
                        <span>{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground py-3 max-w-xs">
                      <span
                        className="block truncate"
                        title={cat.description || ""}
                      >
                        {cat.description || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono font-semibold text-center py-3">
                      {cat.display_order.toString().padStart(2, "0")}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      {(() => {
                        const isPublished =
                          cat.status === "PUBLISHED" || cat.published || cat.active;
                        return (
                          <Badge
                            className={cn(
                              "font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full border-0",
                              isPublished
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-400",
                            )}
                          >
                            {isPublished ? "PUBLISHED" : "DRAFT"}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/taxonomy/categories/${cat.id}`}>
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
                          onClick={() => {
                            setDeleteError(null);
                            setCategoryToDelete(cat);
                          }}
                          className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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

      {/* Section 2: Conceptos por categoría */}
      <div className="space-y-5 pt-2">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {t("conceptsTitle")}
          </h2>
          <p className="text-xs text-muted-foreground italic font-serif">
            {t("conceptsSubtitle")}
          </p>
        </div>

        {/* Category Cards with concepts */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
          </div>
        ) : (
          categories.map((cat) => (
            <Card
              key={`cat-card-${cat.id}`}
              className="border border-border/60 bg-card shadow-xs rounded-2xl p-6 relative overflow-hidden"
            >
              {/* Subtle background icon decoration */}
              <div className="absolute right-4 top-4 opacity-5 pointer-events-none">
                {getCategoryIcon(cat.name)}
              </div>

              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-950/10 dark:bg-emerald-400/10 text-emerald-900 dark:text-emerald-400 flex items-center justify-center border border-emerald-900/20">
                    {getCategoryIcon(cat.name)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-500">
                      {t("conceptsCount", { count: cat.concepts.length })}
                    </p>
                  </div>
                </div>

                <Link href="/admin/taxonomy/concepts/new">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-amber-700/30 text-amber-800 dark:text-amber-400 hover:bg-amber-500/10 text-xs font-semibold tracking-wider gap-1.5 px-3 py-1.5 uppercase"
                  >
                    <PlusCircle className="size-3.5" />
                    <span>{t("newConceptBtn")}</span>
                  </Button>
                </Link>
              </div>

              {/* Concepts List or Empty State */}
              {cat.concepts.length === 0 ? (
                <div className="border border-dashed border-border/70 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2 bg-muted/20">
                  <div className="text-muted-foreground/40 font-mono text-lg font-bold">
                    [ ]
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("emptyConceptsText")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cat.concepts.map((concept) => {
                    const sectionTitleMap: Record<string, string> = {
                      "sec-001-intro": "INTRODUCCIÓN",
                      "sec-002-tax": "TAXONOMÍA",
                      "sec-003-meth": "METODOLOGÍA",
                    };
                    const secId = concept.section_id || "";
                    const sectionName = sectionTitleMap[secId] || secId;

                    return (
                      <div
                        key={concept.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-background/80 hover:border-border transition-all shadow-2xs"
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground">
                            {concept.name}
                          </h4>
                          {concept.description && (
                            <p
                              className="text-[10px] text-muted-foreground mt-0.5 max-w-xs truncate"
                              title={concept.description}
                            >
                              {concept.description}
                            </p>
                          )}
                          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
                            {sectionName
                              ? `${t("sectionPrefix")} ${sectionName} · `
                              : ""}
                            {t("orderPrefix")} {concept.display_order}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Link href={`/admin/taxonomy/concepts/${concept.id}?category_id=${cat.id || concept.category_id || ""}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Editar concepto"
                              className="size-7 text-muted-foreground/70 hover:text-foreground"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          </Link>
                          {concept.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Eliminar concepto"
                              onClick={() => {
                                setDeleteError(null);
                                setConceptToDelete({ id: concept.id!, categoryId: cat.id || "", name: concept.name });
                              }}
                              className="size-7 text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Delete Category Confirmation Modal */}
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryToDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">
              {t("deleteCategoryTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground pt-1">
              {t("deleteCategoryConfirm", {
                name: categoryToDelete?.name || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
              {deleteError}
            </div>
          )}

          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel
              onClick={() => {
                setCategoryToDelete(null);
                setDeleteError(null);
              }}
              disabled={isDeleting}
              className="rounded-xl"
            >
              {t("categoryForm.cancel")}
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={isDeleting}
            >
              {isDeleting ? t("deleting") : t("deleteCategoryBtn")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Concept Confirmation Modal */}
      <AlertDialog
        open={!!conceptToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setConceptToDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">
              ¿Eliminar concepto?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground pt-1">
              Esta acción eliminará el concepto &quot;{conceptToDelete?.name}&quot; permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
              {deleteError}
            </div>
          )}

          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel
              onClick={() => {
                setConceptToDelete(null);
                setDeleteError(null);
              }}
              disabled={isDeleting}
              className="rounded-xl"
            >
              {t("categoryForm.cancel")}
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteConcept}
              disabled={isDeleting}
            >
              {isDeleting ? t("deleting") : "Eliminar Concepto"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function TaxonomyManagementSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto py-2">
      <div className="space-y-2">
        <Skeleton className="h-4 w-36 rounded-md" />
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}
