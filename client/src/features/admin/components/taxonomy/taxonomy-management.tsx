"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCategoriesAction,
  getCategoriesWithConceptsAction,
  deleteCategoryAction,
  deleteConceptAction,
} from "../../actions/taxonomy-actions";
import type { CategoryItem } from "../../schemas/taxonomy-schema";
import { useVersion } from "@/features/admin/context";
import { Layers } from "lucide-react";

export function TaxonomyManagementSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-14 w-full rounded-md" />
        <Skeleton className="h-14 w-full rounded-md" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function TaxonomyManagement() {
  const t = useTranslations("AdminPage.taxonomy");
  const { activeReportId, activeVersionId, activeReportVersion } = useVersion();
  const targetVersionId =
    activeReportVersion?.id || activeVersionId || activeReportId;

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(
    null,
  );
  const [conceptToDelete, setConceptToDelete] = useState<{
    id: string;
    categoryId: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteCategory = async () => {
    if (!categoryToDelete?.id) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteCategoryAction(
        categoryToDelete.id,
        targetVersionId || undefined,
      );
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
      const res = await deleteConceptAction(
        conceptToDelete.id,
        conceptToDelete.categoryId,
      );
      if (res.success) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === conceptToDelete.categoryId
              ? {
                  ...c,
                  concepts: (c.concepts || []).filter(
                    (cn) => cn.id !== conceptToDelete.id,
                  ),
                }
              : c,
          ),
        );
        setConceptToDelete(null);
      } else {
        setDeleteError(res.message || "Error al eliminar el concepto.");
      }
    } catch (err) {
      console.error("Failed to delete concept:", err);
      setDeleteError("Error al eliminar el concepto.");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        if (targetVersionId) {
          const data = await getCategoriesWithConceptsAction(targetVersionId);
          if (isMounted) {
            const sorted = [...data].sort(
              (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
            );
            setCategories(sorted);
          }
        } else {
          const data = await getCategoriesAction(undefined);
          if (isMounted) {
            const sorted = [...data].sort(
              (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
            );
            setCategories(sorted);
          }
        }
      } catch (err) {
        console.error("Failed to load taxonomy categories", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void loadData();
    return () => {
      isMounted = false;
    };
  }, [targetVersionId]);

  // Formateador de orden a 2 dígitos (00, 01, 02)
  const formatOrder = (order?: number | null, index?: number) => {
    const val =
      order !== undefined && order !== null && !isNaN(order)
        ? order
        : (index ?? 0);
    return String(val).padStart(2, "0");
  };

  // Generador de código para conceptos (ej. FAC-01, IT-02)
  const formatConceptCode = (cat: CategoryItem, index: number) => {
    const prefix = cat.name
      ? cat.name
          .substring(0, 3)
          .toUpperCase()
          .replace(/[^A-Z]/g, "") || "TAX"
      : "TAX";
    return `${prefix}-${String(index + 1).padStart(2, "0")}`;
  };

  return (
    <div>
      {/* ── Encabezado y Breadcrumb (.eyebrow del prototipo) ────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
          fontSize: "11px",
          letterSpacing: ".07em",
          textTransform: "uppercase",
          color: "#00603a",
        }}
      >
        <span
          style={{
            width: "22px",
            height: "1px",
            background: "#00603a",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span>{t("headerTag")}</span>
      </div>

      {/* ── Título Principal y Subtítulo (.mh del prototipo) ────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "20px",
          margin: "16px 0 28px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "34px",
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#08090a",
              margin: 0,
            }}
          >
            {t("title")}
          </h1>
          <p
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "15px",
              color: "#706f6f",
              marginTop: "8px",
              maxWidth: "74ch",
              lineHeight: 1.45,
              letterSpacing: "-0.01em",
            }}
          >
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* ── Banner de Error en Borrado ─────────────────────────────── */}
      {deleteError && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
            fontSize: "13.5px",
            border: "1px solid rgba(179,38,30,.25)",
            borderLeft: "3px solid #b3261e",
            background: "rgba(179,38,30,.04)",
            color: "#b3261e",
          }}
        >
          {deleteError}
        </div>
      )}

      {/* ── Sección 1: Categorías Principales (.sec-h) ──────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          margin: "24px 0 14px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "20px",
              fontWeight: 500,
              color: "#08090a",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {t("mainCategoriesTitle")}
          </h2>
          <p
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "13px",
              color: "#6f6f6f",
              margin: "3px 0 0",
              letterSpacing: "-0.01em",
            }}
          >
            {t("mainCategoriesSubtitle")}
          </p>
        </div>

        <Link
          href="/admin/taxonomy/categories/new"
          className="b pri"
          style={{ textDecoration: "none" }}
        >
          <svg
            viewBox="0 0 24 24"
            style={{
              width: 15,
              height: 15,
              stroke: "#ffffff",
              fill: "none",
              strokeWidth: 2,
            }}
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>{t("newCategoryBtn")}</span>
        </Link>
      </div>

      {/* ── Card de Categorías (.card.admin-card con tabla .tbl) ────── */}
      <div
        className="card admin-card"
        style={{ overflow: "hidden", marginBottom: "36px" }}
      >
        {loading ? (
          <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table className="tbl" style={{ minWidth: "640px" }}>
              <thead>
                <tr>
                  <th style={{ width: "70px", textAlign: "left" }}>
                    {t("colOrder")}
                  </th>
                  <th style={{ textAlign: "left" }}>{t("colCategory")}</th>
                  <th style={{ textAlign: "left" }}>{t("colDescription")}</th>
                  <th style={{ width: "120px", textAlign: "left" }}>
                    {t("colStatus")}
                  </th>
                  <th
                    style={{
                      width: "92px",
                      textAlign: "right",
                      paddingRight: "20px",
                    }}
                  >
                    {t("colActions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td>
                      <Skeleton className="h-4 w-6 rounded-sm" />
                    </td>
                    <td>
                      <Skeleton className="h-4 w-36 rounded-sm mb-1" />
                      <Skeleton className="h-3 w-20 rounded-sm" />
                    </td>
                    <td>
                      <Skeleton className="h-4 w-52 rounded-sm" />
                    </td>
                    <td>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td
                      className="act"
                      style={{ paddingRight: "20px", textAlign: "right" }}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <Skeleton className="h-7 w-7 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : categories.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "rgba(0,96,58,.08)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 12px",
                color: "#00603a",
              }}
            >
              <Layers style={{ width: 22, height: 22 }} />
            </div>
            <p
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "15px",
                fontWeight: 500,
                color: "#08090a",
                margin: "0 0 4px 0",
              }}
            >
              {t("noCategories")}
            </p>
            <p
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "13px",
                color: "#6f6f6f",
                margin: "0 0 16px 0",
              }}
            >
              {t("mainCategoriesSubtitle")}
            </p>
            <Link
              href="/admin/taxonomy/categories/new"
              className="b pri sm"
              style={{ display: "inline-flex", textDecoration: "none" }}
            >
              <svg
                viewBox="0 0 24 24"
                style={{
                  width: 14,
                  height: 14,
                  stroke: "#ffffff",
                  fill: "none",
                  strokeWidth: 2,
                }}
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>{t("newCategoryBtn")}</span>
            </Link>
          </div>
        ) : (
          <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table className="tbl" style={{ minWidth: "640px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>{t("colCategory")}</th>
                  <th style={{ width: "220px", textAlign: "left" }}>
                    {t("colDescription")}
                  </th>
                  <th style={{ width: "80px", textAlign: "left" }}>
                    {t("colOrder")}
                  </th>
                  <th style={{ width: "120px", textAlign: "left" }}>
                    {t("colStatus")}
                  </th>
                  <th
                    style={{
                      width: "92px",
                      textAlign: "right",
                      paddingRight: "20px",
                    }}
                  >
                    {t("colActions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => {
                  const isActive =
                    cat.status === "PUBLISHED" ||
                    cat.active === true ||
                    cat.published === true ||
                    cat.status !== "DRAFT";
                  const dotColor = isActive ? "#00603a" : "#7a6630";
                  const conceptsCount = cat.concepts?.length || 0;

                  return (
                    <tr key={cat.id}>
                      {/* Categoría con punto alineado */}
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "9px",
                          }}
                        >
                          <span
                            style={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "50%",
                              background: dotColor,
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontFamily:
                                "var(--f, 'Inter Tight', system-ui, sans-serif)",
                              fontSize: "15px",
                              fontWeight: 500,
                              color: "#08090a",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {cat.name}
                          </span>
                        </div>
                      </td>

                      {/* Descripción / Conteo de entradas */}
                      <td className="mono" style={{ color: "#6f6f6f" }}>
                        {cat.description ||
                          t("entriesCount", { count: conceptsCount })}
                      </td>

                      {/* Orden en 2 dígitos con IBM Plex Mono */}
                      <td className="mono" style={{ color: "#08090a" }}>
                        {formatOrder(cat.display_order, idx)}
                      </td>

                      {/* Badge de Estado */}
                      <td>
                        <span className={isActive ? "bg pub" : "bg draft"}>
                          {isActive ? t("statusPublished") : t("statusDraft")}
                        </span>
                      </td>

                      {/* Botones de Acción (estáticos, listos para click) */}
                      <td
                        className="act"
                        style={{ paddingRight: "20px", textAlign: "right" }}
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Link
                            href={`/admin/taxonomy/categories/${cat.id}`}
                            className="b icon ghost"
                            title={t("editCategoryTooltip")}
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M4 20h4l10-10-4-4L4 16z" />
                            </svg>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setCategoryToDelete(cat)}
                            className="b icon danger"
                            title={t("deleteCategoryTooltip")}
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Sección 2: Conceptos por Categoría (.sec-h) ─────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          margin: "36px 0 16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "20px",
              fontWeight: 500,
              color: "#08090a",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {t("conceptsTitle")}
          </h2>
          <p
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "13px",
              color: "#6f6f6f",
              margin: "3px 0 0",
              letterSpacing: "-0.01em",
            }}
          >
            {t("conceptsSubtitle")}
          </p>
        </div>
      </div>

      {/* ── Cards de Conceptos por cada Categoría ───────────────────── */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="card admin-card"
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  padding: "15px 20px",
                  borderBottom: "1px solid #ebebeb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <Skeleton className="h-4 w-36 rounded-sm" />
                  <Skeleton className="h-3 w-48 rounded-sm" />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-7 w-28 rounded-md" />
                </div>
              </div>
              <div style={{ padding: "16px 20px" }}>
                {[1, 2].map((j) => (
                  <div
                    key={j}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        width: "70%",
                      }}
                    >
                      <Skeleton className="h-4 w-12 rounded-sm" />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          width: "80%",
                        }}
                      >
                        <Skeleton className="h-4 w-32 rounded-sm" />
                        <Skeleton className="h-3 w-3/4 rounded-sm" />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Skeleton className="h-7 w-7 rounded-md" />
                      <Skeleton className="h-7 w-7 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? null : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {categories.map((cat) => {
            const concepts = cat.concepts || [];

            return (
              <div
                key={cat.id}
                className="card admin-card"
                style={{ overflow: "hidden" }}
              >
                {/* Cabecera de la Card de Categoría (.card-h del prototipo) */}
                <div
                  style={{
                    padding: "15px 20px",
                    borderBottom: "1px solid #ebebeb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "17px",
                        fontWeight: 500,
                        letterSpacing: "-0.02em",
                        color: "#08090a",
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {cat.name}
                    </h3>
                    <div
                      style={{
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "12.5px",
                        color: "#6f6f6f",
                        marginTop: "2px",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {t("conceptsCount", { count: concepts.length })}
                    </div>
                  </div>

                  <Link
                    href={`/admin/taxonomy/concepts/new?categoryId=${cat.id}`}
                    className="b sec sm"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      textDecoration: "none",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      style={{
                        width: 13,
                        height: 13,
                        stroke: "currentColor",
                        fill: "none",
                        strokeWidth: 2,
                      }}
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span>{t("newConceptBtn")}</span>
                  </Link>
                </div>

                {/* Tabla de Conceptos o Estado Vacío */}
                {concepts.length === 0 ? (
                  <div
                    style={{
                      padding: "32px 20px",
                      textAlign: "center",
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "13px",
                      color: "#6f6f6f",
                      background: "#fafafa",
                    }}
                  >
                    {t("emptyConceptsText")}
                  </div>
                ) : (
                  <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                    <table className="tbl" style={{ minWidth: "640px" }}>
                      <tbody>
                        {concepts.map((concept, cIdx) => {
                          const conceptCode = formatConceptCode(cat, cIdx);

                          return (
                            <tr key={concept.id}>
                              {/* Código técnico en mono (width 88px) */}
                              <td
                                style={{
                                  width: "88px",
                                  fontFamily:
                                    "var(--m, 'IBM Plex Mono', monospace)",
                                  fontSize: "12.5px",
                                  color: "#08090a",
                                }}
                              >
                                {conceptCode}
                              </td>

                              {/* Nombre y Definición */}
                              <td>
                                <div
                                  style={{
                                    fontFamily:
                                      "var(--f, 'Inter Tight', system-ui, sans-serif)",
                                    fontSize: "14.5px",
                                    fontWeight: 500,
                                    color: "#08090a",
                                    letterSpacing: "-0.01em",
                                  }}
                                >
                                  {concept.name}
                                </div>
                                <div
                                  style={{
                                    fontFamily:
                                      "var(--f, 'Inter Tight', system-ui, sans-serif)",
                                    fontSize: "12.5px",
                                    color: "#6f6f6f",
                                    marginTop: "2px",
                                    lineHeight: 1.4,
                                    letterSpacing: "-0.01em",
                                  }}
                                >
                                  {concept.description || "—"}
                                </div>
                              </td>

                              {/* Botones de Acción (estáticos y visibles) */}
                              <td
                                className="act"
                                style={{
                                  width: "92px",
                                  paddingRight: "20px",
                                  textAlign: "right",
                                }}
                              >
                                <div
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <Link
                                    href={`/admin/taxonomy/concepts/${concept.id}`}
                                    className="b icon ghost"
                                    title={t("editConceptTooltip")}
                                  >
                                    <svg viewBox="0 0 24 24">
                                      <path d="M4 20h4l10-10-4-4L4 16z" />
                                    </svg>
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setConceptToDelete({
                                        id: concept.id || "",
                                        categoryId: cat.id || "",
                                        name: concept.name,
                                      })
                                    }
                                    className="b icon danger"
                                    title={t("deleteConceptTooltip")}
                                  >
                                    <svg viewBox="0 0 24 24">
                                      <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal de Confirmación para Eliminar Categoría ──────────── */}
      {categoryToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,9,10,0.45)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 50,
            padding: "20px",
          }}
        >
          <div
            className="admin-card"
            style={{
              width: "100%",
              maxWidth: "440px",
              padding: "24px",
              borderRadius: "12px",
              background: "#ffffff",
              boxShadow: "0 10px 30px -10px rgba(8,9,10,0.2)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "18px",
                fontWeight: 500,
                color: "#08090a",
                margin: "0 0 8px 0",
              }}
            >
              {t("deleteCategoryTitle")}
            </h3>
            <p
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "13.5px",
                color: "#706f6f",
                margin: "0 0 20px 0",
                lineHeight: 1.45,
              }}
            >
              {t("deleteCategoryConfirm", { name: categoryToDelete.name })}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={isDeleting}
                className="b sec sm"
                style={{ height: "34px", padding: "0 14px" }}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteCategory()}
                disabled={isDeleting}
                className="b pri sm"
                style={{
                  height: "34px",
                  padding: "0 14px",
                  background: "#b3261e",
                  borderColor: "#b3261e",
                }}
              >
                {isDeleting ? t("deleting") : t("deleteCategoryBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Confirmación para Eliminar Concepto ───────────── */}
      {conceptToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,9,10,0.45)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 50,
            padding: "20px",
          }}
        >
          <div
            className="admin-card"
            style={{
              width: "100%",
              maxWidth: "440px",
              padding: "24px",
              borderRadius: "12px",
              background: "#ffffff",
              boxShadow: "0 10px 30px -10px rgba(8,9,10,0.2)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "18px",
                fontWeight: 500,
                color: "#08090a",
                margin: "0 0 8px 0",
              }}
            >
              {t("deleteConceptTitle")}
            </h3>
            <p
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "13.5px",
                color: "#706f6f",
                margin: "0 0 20px 0",
                lineHeight: 1.45,
              }}
            >
              {t("deleteConceptConfirm", { name: conceptToDelete.name })}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => setConceptToDelete(null)}
                disabled={isDeleting}
                className="b sec sm"
                style={{ height: "34px", padding: "0 14px" }}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteConcept()}
                disabled={isDeleting}
                className="b pri sm"
                style={{
                  height: "34px",
                  padding: "0 14px",
                  background: "#b3261e",
                  borderColor: "#b3261e",
                }}
              >
                {isDeleting ? t("deleting") : t("deleteConceptBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaxonomyManagement;
