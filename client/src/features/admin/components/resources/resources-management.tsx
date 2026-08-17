"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { getSectionsWithResourcesAction } from "../../actions/sections-actions";
import { deleteResourceAction } from "../../actions/resources-actions";
import type { ResourceItem } from "../../schemas/resource-schema";
import type { SectionItem } from "../../schemas/section-schema";
import { useVersion } from "@/features/admin/context";
import { Layers, Copy, Check } from "lucide-react";

export function ResourcesManagementSkeleton() {
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
        <span>Recursos</span>
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
            Activos visuales y archivos
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
            Imágenes y archivos descargables del informe. El texto alternativo es
            obligatorio: sin él la figura no se publica.
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
            <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
          </svg>
          <span>Subir recurso</span>
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
        {["Recursos totales", "Descargables", "Sin texto alt", "Almacenamiento"].map(
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

      {/* ── Tablas Skeleton ─────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {[1, 2].map((grp) => (
          <div key={grp}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <Skeleton className="h-5 w-44 rounded-sm" />
              <Skeleton className="h-3.5 w-20 rounded-sm" />
            </div>
            <div className="card admin-card" style={{ overflow: "hidden" }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Recurso</th>
                    <th style={{ width: "110px", textAlign: "left" }}>Tipo</th>
                    <th style={{ width: "130px", textAlign: "left" }}>
                      Descargable
                    </th>
                    <th style={{ width: "200px", textAlign: "left" }}>
                      Texto alternativo
                    </th>
                    <th
                      style={{
                        width: "110px",
                        textAlign: "right",
                        paddingRight: "20px",
                      }}
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2].map((i) => (
                    <tr key={i}>
                      <td>
                        <Skeleton className="h-4 w-44 rounded-sm mb-1.5" />
                        <Skeleton className="h-3 w-32 rounded-sm" />
                      </td>
                      <td>
                        <Skeleton className="h-4 w-12 rounded-sm" />
                      </td>
                      <td>
                        <Skeleton className="h-5 w-10 rounded-full" />
                      </td>
                      <td>
                        <Skeleton className="h-4 w-28 rounded-sm" />
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
        ))}
      </div>
    </div>
  );
}

export function ResourcesManagement() {
  const t = useTranslations("AdminPage.resources");
  const { activeReportId, activeVersionId, activeReportVersion } = useVersion();
  const targetVersionId =
    activeReportVersion?.id || activeVersionId || activeReportId;

  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        const sectionsWithResources =
          await getSectionsWithResourcesAction(targetVersionId);
        const sortedSections = [...sectionsWithResources].sort(
          (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
        );
        setSections(sortedSections);
        setResources(sortedSections.flatMap((s) => s.resources || []));
      } catch (err) {
        console.error("Failed to load resources data", err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
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
        targetRes?.cloudinary_public_id,
      );
      if (res.success) {
        setResources((prev) => prev.filter((r) => r.id !== resourceToDelete));
        setResourceToDelete(null);
      } else {
        setDeleteError(res.message || "Error al eliminar el recurso.");
      }
    } catch (err) {
      console.error("Error deleting resource:", err);
      setDeleteError("Error al eliminar el recurso.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyUrl = async (id: string, url?: string) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } catch (err) {
      console.error("Failed to copy URL", err);
    }
  };

  // Métricas
  const totalResources = resources.length;
  const downloadableCount = resources.filter((r) => r.downloadable).length;
  const missingAltCount = resources.filter(
    (r) => !r.alt_text || r.alt_text.trim() === "",
  ).length;
  const downloadablePercent =
    totalResources > 0
      ? Math.round((downloadableCount / totalResources) * 100)
      : 0;

  // Cálculo aproximado de almacenamiento (ej. 4.2 MB)
  const storageMB = (totalResources * 1.8 + 0.4).toFixed(1);
  const storagePercent = Math.min(
    Math.round((parseFloat(storageMB) / 1000) * 100),
    100,
  );

  // Agrupación por sección
  const groupedResources = sections.map((sec, idx) => ({
    section: sec,
    sectionIndex: idx + 1,
    items: resources.filter((r) => r.section_id === sec.id),
  }));

  // Recursos sin sección asignada
  const unassignedResources = resources.filter(
    (r) => !r.section_id || !sections.some((s) => s.id === r.section_id),
  );

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

      {/* ── Título Principal, Subtítulo y Botón Subir (.mh del prototipo) ── */}
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
          href="/admin/resources/new"
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
            <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
          </svg>
          <span>{t("newResourceBtn")}</span>
        </Link>
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
        {/* Stat 1: Recursos totales */}
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
            {t("statTotal")}
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
              {totalResources}
            </b>
          )}
        </div>

        {/* Stat 2: Descargables con track de progreso */}
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
            {t("statDownloadable")}
          </span>
          {loading ? (
            <Skeleton className="h-10 w-24 rounded-sm my-0.5" />
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                }}
              >
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
                  {downloadableCount}
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
                  ({downloadablePercent}%)
                </em>
              </div>
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
                    width: `${downloadablePercent}%`,
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

        {/* Stat 3: Faltan Alt Text */}
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
            {t("statMissingAlt")}
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
                color: missingAltCount > 0 ? "#b3261e" : "#00603a",
                lineHeight: 1,
              }}
            >
              {missingAltCount}
            </b>
          )}
        </div>

        {/* Stat 4: Almacenamiento */}
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
            {t("statStorage")}
          </span>
          {loading ? (
            <Skeleton className="h-10 w-28 rounded-sm my-0.5" />
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                }}
              >
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
                  {storageMB}
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
                  {t("storageUnit")}
                </em>
              </div>
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
                    width: `${Math.max(storagePercent, 2)}%`,
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
      </div>

      {/* ── Grupos de Recursos por Sección (.grp + .card) ──────────── */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {[1, 2].map((grp) => (
            <div key={grp}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <Skeleton className="h-5 w-44 rounded-sm" />
                <Skeleton className="h-3.5 w-20 rounded-sm" />
              </div>
              <div className="card admin-card" style={{ overflow: "hidden" }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left" }}>
                        {t("colResource")}
                      </th>
                      <th style={{ width: "110px", textAlign: "left" }}>
                        {t("colType")}
                      </th>
                      <th style={{ width: "130px", textAlign: "left" }}>
                        {t("colDownloadable")}
                      </th>
                      <th style={{ width: "200px", textAlign: "left" }}>
                        {t("colAltText")}
                      </th>
                      <th
                        style={{
                          width: "110px",
                          textAlign: "right",
                          paddingRight: "20px",
                        }}
                      >
                        {t("colActions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2].map((i) => (
                      <tr key={i}>
                        <td>
                          <Skeleton className="h-4 w-44 rounded-sm mb-1.5" />
                          <Skeleton className="h-3 w-32 rounded-sm" />
                        </td>
                        <td>
                          <Skeleton className="h-4 w-12 rounded-sm" />
                        </td>
                        <td>
                          <Skeleton className="h-5 w-10 rounded-full" />
                        </td>
                        <td>
                          <Skeleton className="h-4 w-28 rounded-sm" />
                        </td>
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
          ))}
        </div>
      ) : sections.length === 0 && resources.length === 0 ? (
        <div
          className="card admin-card"
          style={{
            padding: "56px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(0,96,58,.08)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 14px",
              color: "#00603a",
            }}
          >
            <Layers style={{ width: 24, height: 24 }} />
          </div>
          <p
            style={{
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "16px",
              fontWeight: 500,
              color: "#08090a",
              margin: "0 0 6px 0",
            }}
          >
            {t("noActiveReport")}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {groupedResources.map(({ section, sectionIndex, items }) => {
            const formattedSecOrder = String(
              section.display_order ?? sectionIndex,
            ).padStart(2, "0");

            return (
              <div key={section.id}>
                {/* Cabecera de Grupo (.grp del prototipo) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "10px",
                    marginBottom: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <h3
                    style={{
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "18px",
                      fontWeight: 500,
                      letterSpacing: "-0.02em",
                      color: "#08090a",
                      margin: 0,
                    }}
                  >
                    {section.title}
                  </h3>
                  <span
                    style={{
                      fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                      fontSize: "12px",
                      color: "#6f6f6f",
                      letterSpacing: ".04em",
                    }}
                  >
                    {t("sectionSuffix", { order: formattedSecOrder })}
                  </span>
                </div>

                {/* Tarjeta con Tabla de Recursos */}
                <div className="card admin-card" style={{ overflow: "hidden" }}>
                  <div style={{ width: "100%", overflowX: "auto" }}>
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left" }}>
                            {t("colResource")}
                          </th>
                          <th style={{ width: "110px", textAlign: "left" }}>
                            {t("colType")}
                          </th>
                          <th style={{ width: "130px", textAlign: "left" }}>
                            {t("colDownloadable")}
                          </th>
                          <th style={{ width: "200px", textAlign: "left" }}>
                            {t("colAltText")}
                          </th>
                          <th
                            style={{
                              width: "110px",
                              textAlign: "right",
                              paddingRight: "20px",
                            }}
                          >
                            {t("colActions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={5}>
                              <div
                                style={{
                                  padding: "24px",
                                  textAlign: "center",
                                  fontFamily:
                                    "var(--f, 'Inter Tight', system-ui, sans-serif)",
                                  fontSize: "13px",
                                  color: "#6f6f6f",
                                }}
                              >
                                {t("noResourcesInSection")}
                              </div>
                            </td>
                          </tr>
                        ) : (
                          items.map((res) => {
                            const isMissingAlt =
                              !res.alt_text || res.alt_text.trim() === "";
                            const fileNameOrUrl =
                              res.file_url
                                ? res.file_url.split("/").pop()
                                : "—";

                            return (
                              <tr key={res.id}>
                                {/* Recurso (Nombre y Subtítulo) */}
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
                                    {res.title}
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
                                    {fileNameOrUrl}
                                  </div>
                                </td>

                                {/* Tipo (SVG, IMAGE, etc.) en mono */}
                                <td
                                  className="mono"
                                  style={{ color: "#08090a" }}
                                >
                                  {res.type}
                                </td>

                                {/* Descargable */}
                                <td>
                                  <span
                                    className={
                                      res.downloadable ? "bg pub" : "bg draft"
                                    }
                                  >
                                    {res.downloadable ? t("yes") : t("no")}
                                  </span>
                                </td>

                                {/* Alt text */}
                                <td
                                  className="mono"
                                  style={{
                                    color: isMissingAlt ? "#b3261e" : "#00603a",
                                    fontSize: "12px",
                                  }}
                                >
                                  {isMissingAlt ? t("missingAlt") : res.alt_text}
                                </td>

                                {/* Botones de Acción (estáticos y listos para click) */}
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
                                    {res.file_url && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCopyUrl(
                                            res.id || "",
                                            res.file_url,
                                          )
                                        }
                                        className="b icon ghost"
                                        title={t("copyUrlTooltip")}
                                      >
                                        {copiedId === res.id ? (
                                          <Check
                                            style={{
                                              width: 14,
                                              height: 14,
                                              stroke: "#00603a",
                                            }}
                                          />
                                        ) : (
                                          <Copy
                                            style={{ width: 14, height: 14 }}
                                          />
                                        )}
                                      </button>
                                    )}
                                    <Link
                                      href={`/admin/resources/${res.id}?sectionId=${res.section_id || section.id}`}
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
                                        setResourceToDelete(res.id || null)
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
              </div>
            );
          })}

          {/* Recursos sin sección asignada si los hay */}
          {unassignedResources.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <h3
                  style={{
                    fontFamily:
                      "var(--f, 'Inter Tight', system-ui, sans-serif)",
                    fontSize: "18px",
                    fontWeight: 500,
                    color: "#08090a",
                    margin: 0,
                  }}
                >
                  {t("unassignedSection")}
                </h3>
              </div>

              <div className="card admin-card" style={{ overflow: "hidden" }}>
                <div style={{ width: "100%", overflowX: "auto" }}>
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left" }}>
                          {t("colResource")}
                        </th>
                        <th style={{ width: "110px", textAlign: "left" }}>
                          {t("colType")}
                        </th>
                        <th style={{ width: "130px", textAlign: "left" }}>
                          {t("colDownloadable")}
                        </th>
                        <th style={{ width: "200px", textAlign: "left" }}>
                          {t("colAltText")}
                        </th>
                        <th
                          style={{
                            width: "110px",
                            textAlign: "right",
                            paddingRight: "20px",
                          }}
                        >
                          {t("colActions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {unassignedResources.map((res) => {
                        const isMissingAlt =
                          !res.alt_text || res.alt_text.trim() === "";
                        const fileNameOrUrl = res.file_url
                          ? res.file_url.split("/").pop()
                          : "—";

                        return (
                          <tr key={res.id}>
                            <td>
                              <div
                                style={{
                                  fontFamily:
                                    "var(--f, 'Inter Tight', system-ui, sans-serif)",
                                  fontSize: "15px",
                                  fontWeight: 500,
                                  color: "#08090a",
                                }}
                              >
                                {res.title}
                              </div>
                              <div
                                style={{
                                  fontFamily:
                                    "var(--f, 'Inter Tight', system-ui, sans-serif)",
                                  fontSize: "12.5px",
                                  color: "#6f6f6f",
                                  marginTop: "2px",
                                }}
                              >
                                {fileNameOrUrl}
                              </div>
                            </td>
                            <td className="mono" style={{ color: "#08090a" }}>
                              {res.type}
                            </td>
                            <td>
                              <span
                                className={
                                  res.downloadable ? "bg pub" : "bg draft"
                                }
                              >
                                {res.downloadable ? t("yes") : t("no")}
                              </span>
                            </td>
                            <td
                              className="mono"
                              style={{
                                color: isMissingAlt ? "#b3261e" : "#00603a",
                                fontSize: "12px",
                              }}
                            >
                              {isMissingAlt ? t("missingAlt") : res.alt_text}
                            </td>
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
                                {res.file_url && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyUrl(
                                        res.id || "",
                                        res.file_url,
                                      )
                                    }
                                    className="b icon ghost"
                                    title={t("copyUrlTooltip")}
                                  >
                                    <Copy style={{ width: 14, height: 14 }} />
                                  </button>
                                )}
                                <Link
                                   href={`/admin/resources/${res.id}${res.section_id ? `?sectionId=${res.section_id}` : ""}`}
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
                                    setResourceToDelete(res.id || null)
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
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modal de Confirmación para Eliminar Recurso ──────────────── */}
      {resourceToDelete && (
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
              {t("deleteModalTitle")}
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
              {t("deleteModalDesc")}
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
                onClick={() => setResourceToDelete(null)}
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

export default ResourcesManagement;
