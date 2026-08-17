"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { useVersion } from "@/features/admin/context";
import {
  getReportsWithVersionsAction,
  deleteReportAction,
  deleteReportVersionAction,
  createReportAction,
} from "../../actions/reports-actions";
import type { BaseReport, ReportVersion } from "../../schemas/report-schema";
import { Search, X, Plus, Loader2 } from "lucide-react";

export function ReportsManagementSkeleton() {
  return (
    <div>
      {/* ── Encabezado y Breadcrumb ────────────────────────────────── */}
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
          }}
        />
        <span>Módulo de informes</span>
      </div>

      {/* ── Título Principal, Subtítulo y Botón ─────────────────────── */}
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
            Administrar informes
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
            Versiones del informe. Una versión publicada no se edita: se crea la
            siguiente.
          </p>
        </div>

        <div className="b pri" style={{ opacity: 0.6, cursor: "default" }}>
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
          <span>Nueva versión</span>
        </div>
      </div>

      {/* ── Stats Skeleton ─────────────────────────────────────────── */}
      <div
        className="stats admin-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1px",
          background: "#ebebeb",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #ebebeb",
          marginBottom: "32px",
        }}
      >
        {["Total versiones", "Publicadas", "Informes base", "Último cambio"].map(
          (label, idx) => (
            <div
              key={idx}
              style={{
                background: "#ffffff",
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                  fontSize: "12.5px",
                  letterSpacing: ".04em",
                  color: "#6f6f6f",
                }}
              >
                {label}
              </span>
              <Skeleton className="h-10 w-20 rounded-sm my-0.5" />
            </div>
          ),
        )}
      </div>

      {/* ── Card de Versiones Skeleton ─────────────────────────────── */}
      <div
        className="card admin-card"
        style={{ overflow: "hidden", marginBottom: "24px" }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #ebebeb",
          }}
        >
          <Skeleton className="h-5 w-32 rounded-sm" />
        </div>
        <div style={{ width: "100%", overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: "90px", textAlign: "left" }}>Versión</th>
                <th style={{ textAlign: "left" }}>Título</th>
                <th style={{ width: "85px", textAlign: "left" }}>Idioma</th>
                <th style={{ width: "120px", textAlign: "left" }}>Estado</th>
                <th style={{ width: "110px", textAlign: "left" }}>Fecha</th>
                <th
                  style={{
                    width: "92px",
                    textAlign: "right",
                    paddingRight: "20px",
                  }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i}>
                  <td className="mono">
                    <Skeleton className="h-4 w-10 rounded-sm" />
                  </td>
                  <td>
                    <Skeleton className="h-4 w-48 rounded-sm mb-1" />
                    <Skeleton className="h-3 w-32 rounded-sm" />
                  </td>
                  <td>
                    <Skeleton className="h-4 w-8 rounded-sm" />
                  </td>
                  <td>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="mono">
                    <Skeleton className="h-4 w-14 rounded-sm" />
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
      </div>
    </div>
  );
}

export function ReportsManagement() {
  const t = useTranslations("AdminPage.reports");
  const { refreshReports } = useVersion();
  const [baseReports, setBaseReports] = useState<BaseReport[]>([]);
  const [versions, setVersions] = useState<ReportVersion[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros de versiones
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBaseReportFilter, setSelectedBaseReportFilter] =
    useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>("all");
  const [selectedLangFilter, setSelectedLangFilter] =
    useState<string>("all");

  // Estados de eliminación y creación de reporte base
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "report" | "version";
    reportId: string;
    versionId?: string;
    name?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingBase, setIsCreatingBase] = useState(false);
  const [isSubmittingBase, setIsSubmittingBase] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const reportsWithVersions = await getReportsWithVersionsAction();
      const bases: BaseReport[] = reportsWithVersions.map((r) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { report_versions, ...base } = r;
        return base;
      });
      const allVersions: ReportVersion[] = reportsWithVersions.flatMap(
        (r) => r.report_versions || [],
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
    async function fetchData() {
      try {
        const reportsWithVersions = await getReportsWithVersionsAction();
        if (!isMounted) return;
        const bases: BaseReport[] = reportsWithVersions.map((r) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { report_versions, ...base } = r;
          return base;
        });
        const allVersions: ReportVersion[] = reportsWithVersions.flatMap(
          (r) => r.report_versions || [],
        );

        setBaseReports(bases);
        setVersions(allVersions);
        await refreshReports();
      } catch (err) {
        console.error("Failed to load reports data", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [refreshReports]);

  // Manejo de creación de nuevo Reporte Base contenedor
  const handleCreateBaseReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBase(true);
    setActionError(null);
    try {
      const res = await createReportAction();

      if (res.success) {
        setIsCreatingBase(false);
        await loadData();
      } else {
        setActionError(res.message || "Error al crear el informe base.");
      }
    } catch (err) {
      console.error("Error creating base report:", err);
      setActionError("Error de conexión al crear el informe base.");
    } finally {
      setIsSubmittingBase(false);
    }
  };

  // Manejo de eliminación
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setActionError(null);

    try {
      if (deleteTarget.type === "version" && deleteTarget.versionId) {
        const res = await deleteReportVersionAction(
          deleteTarget.reportId,
          deleteTarget.versionId,
        );
        if (res.success) {
          setDeleteTarget(null);
          await loadData();
        } else {
          setActionError(res.message || "Error al eliminar la versión.");
        }
      } else if (deleteTarget.type === "report") {
        const res = await deleteReportAction(deleteTarget.reportId);
        if (res.success) {
          setDeleteTarget(null);
          await loadData();
        } else {
          setActionError(res.message || "Error al eliminar el informe base.");
        }
      }
    } catch (err) {
      console.error("Error during deletion:", err);
      setActionError("Error al procesar la eliminación.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrado reactivo de versiones
  const filteredVersions = useMemo(() => {
    return versions.filter((ver) => {
      // 1. Filtro por Informe Base
      if (
        selectedBaseReportFilter !== "all" &&
        ver.report_id !== selectedBaseReportFilter
      ) {
        return false;
      }

      // 2. Filtro por Estado
      if (selectedStatusFilter !== "all") {
        const statusUpper = ver.status?.toUpperCase() || "DRAFT";
        if (statusUpper !== selectedStatusFilter.toUpperCase()) {
          return false;
        }
      }

      // 3. Filtro por Idioma
      if (selectedLangFilter !== "all") {
        const langUpper = ver.language?.toUpperCase() || "ES";
        if (langUpper !== selectedLangFilter.toUpperCase()) {
          return false;
        }
      }

      // 4. Filtro por Búsqueda (Título, resumen, versión)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = ver.title?.toLowerCase().includes(q);
        const summaryMatch = ver.summary?.toLowerCase().includes(q);
        const versionMatch = ver.version?.toLowerCase().includes(q);
        if (!titleMatch && !summaryMatch && !versionMatch) {
          return false;
        }
      }

      return true;
    });
  }, [
    versions,
    selectedBaseReportFilter,
    selectedStatusFilter,
    selectedLangFilter,
    searchQuery,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedBaseReportFilter !== "all" ||
    selectedStatusFilter !== "all" ||
    selectedLangFilter !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedBaseReportFilter("all");
    setSelectedStatusFilter("all");
    setSelectedLangFilter("all");
  };

  // Cálculos de métricas estadísticas
  const totalVersionsCount = versions.length;
  const publishedCount = versions.filter(
    (v) => v.status?.toUpperCase() === "PUBLISHED",
  ).length;
  const publishedPercent =
    totalVersionsCount > 0
      ? Math.round((publishedCount / totalVersionsCount) * 100)
      : 0;

  // Formato de última fecha
  const latestDateFormatted = useMemo(() => {
    if (versions.length === 0) return "—";
    const sorted = [...versions].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });
    const top = sorted[0];
    const rawDate = top.updated_at || top.created_at;
    if (!rawDate) return "Reciente";
    const d = new Date(rawDate);
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  }, [versions]);

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

      {/* ── Título Principal, Subtítulo y Botón Nueva Versión (.mh) ── */}
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

        <Link
          href="/admin/reports/new"
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
          <span>{t("newVersionBtn")}</span>
        </Link>
      </div>

      {/* ── Banner de Error en Acciones ────────────────────────────── */}
      {actionError && (
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
          {actionError}
        </div>
      )}

      {/* ── Bloque de 4 Estadísticas (.stats del prototipo) ──────────── */}
      <div
        className="stats admin-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1px",
          background: "#ebebeb",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #ebebeb",
          marginBottom: "32px",
        }}
      >
        {/* Stat 1: Total versiones */}
        <div
          style={{
            background: "#ffffff",
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
              fontSize: "12.5px",
              letterSpacing: ".04em",
              color: "#6f6f6f",
            }}
          >
            {t("statTotalVersions")}
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            {loading ? (
              <Skeleton className="h-10 w-16 rounded-sm my-0.5" />
            ) : (
              <>
                <b
                  style={{
                    fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                    fontSize: "40px",
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                    color: "#08090a",
                    lineHeight: 1,
                  }}
                >
                  {totalVersionsCount}
                </b>
                <em
                  style={{
                    fontFamily:
                      "var(--f, 'Inter Tight', system-ui, sans-serif)",
                    fontStyle: "normal",
                    fontSize: "12.5px",
                    color: "#6f6f6f",
                  }}
                >
                  {t("statOfReports", { count: baseReports.length })}
                </em>
              </>
            )}
          </div>
        </div>

        {/* Stat 2: Publicadas con track de porcentaje */}
        <div
          style={{
            background: "#ffffff",
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
              fontSize: "12.5px",
              letterSpacing: ".04em",
              color: "#6f6f6f",
            }}
          >
            {t("statPublished")}
          </span>
          {loading ? (
            <Skeleton className="h-10 w-24 rounded-sm my-0.5" />
          ) : (
            <>
              <b
                style={{
                  fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                  fontSize: "40px",
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  color: "#00603a",
                  lineHeight: 1,
                }}
              >
                {publishedCount}
              </b>
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  background: "#f0f0f0",
                  borderRadius: "2px",
                  overflow: "hidden",
                  marginTop: "4px",
                }}
              >
                <div
                  style={{
                    width: `${publishedPercent}%`,
                    height: "100%",
                    background: "#00603a",
                    borderRadius: "2px",
                    transition: "width .4s ease",
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Stat 3: Informes base */}
        <div
          style={{
            background: "#ffffff",
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
              fontSize: "12.5px",
              letterSpacing: ".04em",
              color: "#6f6f6f",
            }}
          >
            {t("statBaseReports")}
          </span>
          {loading ? (
            <Skeleton className="h-10 w-16 rounded-sm my-0.5" />
          ) : (
            <b
              style={{
                fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                fontSize: "40px",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "#08090a",
                lineHeight: 1,
              }}
            >
              {baseReports.length}
            </b>
          )}
        </div>

        {/* Stat 4: Último cambio */}
        <div
          style={{
            background: "#ffffff",
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
              fontSize: "12.5px",
              letterSpacing: ".04em",
              color: "#6f6f6f",
            }}
          >
            {t("statLastChange")}
          </span>
          {loading ? (
            <Skeleton className="h-10 w-24 rounded-sm my-0.5" />
          ) : (
            <b
              style={{
                fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                fontSize: "28px",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "#08090a",
                lineHeight: 1,
                paddingTop: "6px",
              }}
            >
              {latestDateFormatted}
            </b>
          )}
        </div>
      </div>

      {/* ── Barra de Filtros para Versiones ──────────────────────────── */}
      <div
        className="card admin-card"
        style={{
          padding: "14px 18px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Buscador */}
        <div
          style={{
            position: "relative",
            flex: "1 1 240px",
            minWidth: "200px",
          }}
        >
          <Search
            style={{
              position: "absolute",
              left: "11px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "15px",
              height: "15px",
              color: "#6f6f6f",
            }}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            style={{
              width: "100%",
              height: "36px",
              paddingLeft: "34px",
              paddingRight: "12px",
              border: "1px solid #ebebeb",
              borderRadius: "8px",
              background: "#ffffff",
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "13.5px",
              color: "#08090a",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Filtro: Informe Base */}
        <div style={{ flex: "0 1 200px", minWidth: "160px" }}>
          <select
            value={selectedBaseReportFilter}
            onChange={(e) => setSelectedBaseReportFilter(e.target.value)}
            style={{
              width: "100%",
              height: "36px",
              padding: "0 10px",
              border: "1px solid #ebebeb",
              borderRadius: "8px",
              background: "#ffffff",
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "13px",
              color: "#08090a",
              outline: "none",
              boxSizing: "border-box",
            }}
          >
            <option value="all">{t("filterAllBaseReports")}</option>
            {baseReports.map((b) => (
              <option key={b.id} value={b.id}>
                {b.slug}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro: Estado */}
        <div style={{ flex: "0 1 140px", minWidth: "120px" }}>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            style={{
              width: "100%",
              height: "36px",
              padding: "0 10px",
              border: "1px solid #ebebeb",
              borderRadius: "8px",
              background: "#ffffff",
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "13px",
              color: "#08090a",
              outline: "none",
              boxSizing: "border-box",
            }}
          >
            <option value="all">{t("filterAllStatuses")}</option>
            <option value="PUBLISHED">{t("statusPublished")}</option>
            <option value="DRAFT">{t("statusDraft")}</option>
            <option value="ARCHIVED">{t("statusArchived")}</option>
          </select>
        </div>

        {/* Filtro: Idioma */}
        <div style={{ flex: "0 1 130px", minWidth: "110px" }}>
          <select
            value={selectedLangFilter}
            onChange={(e) => setSelectedLangFilter(e.target.value)}
            style={{
              width: "100%",
              height: "36px",
              padding: "0 10px",
              border: "1px solid #ebebeb",
              borderRadius: "8px",
              background: "#ffffff",
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "13px",
              color: "#08090a",
              outline: "none",
              boxSizing: "border-box",
            }}
          >
            <option value="all">{t("filterAllLanguages")}</option>
            <option value="ES">ES (Español)</option>
            <option value="EN">EN (English)</option>
          </select>
        </div>

        {/* Botón Reset de filtros */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="b ghost sm"
            style={{
              height: "36px",
              padding: "0 10px",
              fontSize: "12.5px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <X style={{ width: 14, height: 14 }} />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* ── Card 1: Tabla de Versiones (.card.admin-card) ──────────── */}
      <div
        className="card admin-card"
        style={{ overflow: "hidden", marginBottom: "28px" }}
      >
        {/* Cabecera de la card */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #ebebeb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "17px",
                fontWeight: 500,
                color: "#08090a",
                margin: 0,
              }}
            >
              {t("versionsCardTitle")}
            </h3>
            <div
              style={{
                fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                fontSize: "12px",
                color: "#6f6f6f",
                marginTop: "2px",
              }}
            >
              {selectedBaseReportFilter !== "all"
                ? baseReports.find((b) => b.id === selectedBaseReportFilter)
                    ?.slug || "informe-seleccionado"
                : "Todas las versiones del sistema"}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: "90px", textAlign: "left" }}>
                  {t("colVersion")}
                </th>
                <th style={{ textAlign: "left" }}>{t("colTitle")}</th>
                <th style={{ width: "85px", textAlign: "left" }}>
                  {t("colLanguage")}
                </th>
                <th style={{ width: "120px", textAlign: "left" }}>
                  {t("colStatus")}
                </th>
                <th style={{ width: "110px", textAlign: "left" }}>
                  {t("colDate")}
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
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td>
                      <Skeleton className="h-4 w-10 rounded-sm" />
                    </td>
                    <td>
                      <Skeleton className="h-4 w-44 rounded-sm mb-1.5" />
                      <Skeleton className="h-3 w-32 rounded-sm" />
                    </td>
                    <td>
                      <Skeleton className="h-4 w-8 rounded-sm" />
                    </td>
                    <td>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td>
                      <Skeleton className="h-4 w-14 rounded-sm" />
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
                ))
              ) : filteredVersions.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div
                      style={{
                        padding: "36px 24px",
                        textAlign: "center",
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "13.5px",
                        color: "#6f6f6f",
                      }}
                    >
                      {t("noVersions")}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVersions.map((ver) => {
                  const statusUpper = ver.status?.toUpperCase() || "DRAFT";
                  const isPublished = statusUpper === "PUBLISHED";
                  const isArchived = statusUpper === "ARCHIVED";
                  const statusBadgeClass = isPublished
                    ? "bg pub"
                    : isArchived
                    ? "bg arch"
                    : "bg draft";

                  const statusText = isPublished
                    ? t("statusPublished")
                    : isArchived
                    ? t("statusArchived")
                    : t("statusDraft");

                  const rawDate = ver.updated_at || ver.created_at;
                  const dateStr = rawDate
                    ? new Date(rawDate).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })
                    : "—";

                  const versionLabel = ver.version?.startsWith("v")
                    ? ver.version
                    : `v${ver.version || "1.0"}`;

                  return (
                    <tr key={ver.id}>
                      {/* Versión (v1, v2, v3) en mono */}
                      <td
                        className="mono"
                        style={{
                          color: isPublished ? "#00603a" : "#08090a",
                          fontWeight: 500,
                        }}
                      >
                        {versionLabel}
                      </td>

                      {/* Título y Subtítulo / Resumen */}
                      <td>
                        <div
                          style={{
                            fontFamily:
                              "var(--f, 'Inter Tight', system-ui, sans-serif)",
                            fontSize: "15px",
                            fontWeight: 500,
                            color: "#08090a",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {ver.title}
                        </div>
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
                          {ver.summary ||
                            (isPublished
                              ? "Versión publicada"
                              : "Borrador de trabajo")}
                        </div>
                      </td>

                      {/* Idioma */}
                      <td
                        className="mono"
                        style={{ color: "#08090a", fontSize: "12.5px" }}
                      >
                        {ver.language?.toUpperCase() || "ES"}
                      </td>

                      {/* Estado */}
                      <td>
                        <span className={statusBadgeClass}>{statusText}</span>
                      </td>

                      {/* Fecha */}
                      <td
                        className="mono"
                        style={{ color: "#6f6f6f", fontSize: "12px" }}
                      >
                        {dateStr}
                      </td>

                      {/* Botones de acción */}
                      <td
                        className="act"
                        style={{
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
                            href={`/admin/reports/${ver.id}`}
                            className="b icon ghost"
                            title={t("editTooltip")}
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M4 20h4l10-10-4-4L4 16z" />
                            </svg>
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                type: "version",
                                reportId: ver.report_id || "",
                                versionId: ver.id,
                                name: `${ver.title} (${versionLabel})`,
                              })
                            }
                            className="b icon danger"
                            title={t("deleteTooltip")}
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Card 2: Informes Base (.card.admin-card) ───────────────── */}
      <div className="card admin-card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 20px",
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
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "17px",
                fontWeight: 500,
                color: "#08090a",
                margin: 0,
              }}
            >
              {t("baseReportsCardTitle")}
            </h3>
            <div
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "12.5px",
                color: "#6f6f6f",
                marginTop: "2px",
              }}
            >
              {t("baseReportsCount", { count: baseReports.length })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreatingBase(true)}
            className="b sec sm"
            style={{ height: "34px", padding: "0 14px" }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            <span>{t("newBaseReportBtn")}</span>
          </button>
        </div>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <table className="tbl">
            <tbody>
              {loading ? (
                <tr>
                  <td>
                    <Skeleton className="h-4 w-48 rounded-sm mb-1" />
                    <Skeleton className="h-3 w-32 rounded-sm" />
                  </td>
                  <td
                    className="act"
                    style={{ width: "92px", paddingRight: "20px" }}
                  >
                    <Skeleton className="h-7 w-7 rounded-md" />
                  </td>
                </tr>
              ) : baseReports.length === 0 ? (
                <tr>
                  <td colSpan={2}>
                    <div
                      style={{
                        padding: "32px 20px",
                        textAlign: "center",
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "13px",
                        color: "#6f6f6f",
                      }}
                    >
                      {t("noBaseReports")}
                    </div>
                  </td>
                </tr>
              ) : (
                baseReports.map((base) => {
                  const countVersions = versions.filter(
                    (v) => v.report_id === base.id,
                  ).length;

                  return (
                    <tr key={base.id}>
                      <td>
                        <div
                          style={{
                            fontFamily:
                              "var(--f, 'Inter Tight', system-ui, sans-serif)",
                            fontSize: "15px",
                            fontWeight: 500,
                            color: "#08090a",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {base.slug}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                            fontSize: "12px",
                            color: "#6f6f6f",
                            marginTop: "2px",
                          }}
                        >
                          ID: {base.id} ·{" "}
                          {t("versionCountSuffix", { count: countVersions })}
                        </div>
                      </td>

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
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                type: "report",
                                reportId: base.id,
                                name: base.slug,
                              })
                            }
                            className="b icon danger"
                            title={t("deleteBaseTooltip")}
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal para Crear Nuevo Informe Base ───────────────────────── */}
      {isCreatingBase && (
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
              maxWidth: "460px",
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
                margin: "0 0 6px 0",
              }}
            >
              {t("createBaseModalTitle")}
            </h3>
            <p
              style={{
                fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
                fontSize: "13px",
                color: "#706f6f",
                margin: "0 0 20px 0",
                lineHeight: 1.45,
              }}
            >
              {t("createBaseModalDesc")}
            </p>

            <form onSubmit={handleCreateBaseReport}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsCreatingBase(false)}
                  disabled={isSubmittingBase}
                  className="b sec sm"
                  style={{ height: "34px", padding: "0 14px" }}
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBase}
                  className="b pri sm"
                  style={{
                    height: "34px",
                    padding: "0 14px",
                    background: "#00603a",
                    borderColor: "#00603a",
                    color: "#ffffff",
                  }}
                >
                  {isSubmittingBase ? (
                    <Loader2
                      style={{
                        width: 14,
                        height: 14,
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  ) : (
                    t("createBaseBtn")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal de Confirmación de Eliminación ───────────────────────── */}
      {deleteTarget && (
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
              {deleteTarget.type === "report"
                ? t("deleteBaseTitle")
                : t("deleteVersionTitle")}
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
              {deleteTarget.type === "report"
                ? t("deleteBaseDesc")
                : t("deleteVersionDesc")}
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
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="b sec sm"
                style={{ height: "34px", padding: "0 14px" }}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={isDeleting}
                className="b pri sm"
                style={{
                  height: "34px",
                  padding: "0 14px",
                  background: "#b3261e",
                  borderColor: "#b3261e",
                }}
              >
                {isDeleting ? t("deleting") : t("deleteConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsManagement;
