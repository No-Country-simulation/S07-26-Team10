"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import type { CategoryItem } from "../../schemas/taxonomy-schema";
import {
  createCategoryAction,
  updateCategoryAction,
} from "../../actions/taxonomy-actions";
import { useVersion } from "@/context/version-context";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface CategoryFormProps {
  initialData?: CategoryItem;
  isEditMode?: boolean;
}

export function CategoryForm({
  initialData,
  isEditMode = false,
}: CategoryFormProps) {
  const t = useTranslations("AdminPage.taxonomy.categoryForm");
  const tRoot = useTranslations("AdminPage.taxonomy");
  const router = useRouter();
  const { activeReportId, activeVersionId, activeReportVersion } = useVersion();

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [displayOrder, setDisplayOrder] = useState(
    initialData?.display_order || 1,
  );
  const [autoOrder, setAutoOrder] = useState<boolean>(
    !initialData?.display_order,
  );
  const [active, setActive] = useState<boolean>(
    initialData?.status === "PUBLISHED" ||
      initialData?.active ||
      initialData?.published ||
      true,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const statusVal = active ? "PUBLISHED" : "DRAFT";
      const targetVersionId =
        initialData?.report_version_id ||
        initialData?.report_id ||
        activeReportVersion?.id ||
        activeVersionId ||
        activeReportId;
      const orderToSend = autoOrder ? undefined : displayOrder;

      if (isEditMode && initialData?.id) {
        const res = await updateCategoryAction(
          initialData.id,
          {
            name,
            description,
            display_order: orderToSend,
            status: statusVal,
            published: active,
          },
          targetVersionId || undefined,
        );

        if (res.success) {
          setSuccessMessage("Categoría actualizada correctamente.");
          setTimeout(() => {
            router.push("/admin/taxonomy");
            router.refresh();
          }, 800);
        } else {
          setErrorMessage(res.message || t("errorUpdate"));
        }
      } else {
        const res = await createCategoryAction({
          report_id: targetVersionId || undefined,
          name,
          description,
          display_order: orderToSend,
          status: statusVal,
          published: active,
        });

        if (res.success) {
          setSuccessMessage("Categoría creada correctamente.");
          setTimeout(() => {
            router.push("/admin/taxonomy");
            router.refresh();
          }, 800);
        } else {
          setErrorMessage(res.message || t("errorCreate"));
        }
      }
    } catch (err) {
      console.error("Error submitting category form:", err);
      setErrorMessage(t("errorGeneric"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate>
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
          <span>{tRoot("headerTag")}</span>
          <span style={{ color: "#a8a8a8" }}>/</span>
          <Link
            href="/admin/taxonomy"
            style={{
              color: "#6f6f6f",
              textDecoration: "none",
              transition: "color .16s",
            }}
          >
            {t("breadcrumbBase")}
          </Link>
          <span style={{ color: "#a8a8a8" }}>/</span>
          <span style={{ color: "#08090a", fontWeight: 500 }}>
            {isEditMode ? t("breadcrumbEdit") : t("breadcrumbNew")}
          </span>
        </div>

        {/* ── Título, Subtítulo y Botones de Acción (.mh del prototipo) ── */}
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
              {isEditMode ? t("editTitle", { name }) : t("createTitle")}
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

          {/* Botones de Acción Superiores */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link href="/admin/taxonomy" className="b sec">
              {t("cancel")}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="b pri"
              style={{
                background: "#00603a",
                borderColor: "#00603a",
                color: "#ffffff",
              }}
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
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              <span>
                {isSubmitting ? t("saving") : t("saveCategory")}
              </span>
            </button>
          </div>
        </div>

        {/* ── Banners de Alerta / Feedback ─────────────────────────── */}
        {errorMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "13.5px",
              border: "1px solid rgba(179,38,30,.28)",
              borderLeft: "3px solid #b3261e",
              background: "rgba(179,38,30,.04)",
              color: "#b3261e",
            }}
          >
            <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontFamily: "var(--f, 'Inter Tight', system-ui, sans-serif)",
              fontSize: "13.5px",
              border: "1px solid rgba(0,96,58,.25)",
              borderLeft: "3px solid #00603a",
              background: "rgba(0,96,58,.04)",
              color: "#00603a",
            }}
          >
            <CheckCircle2 style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ── Grid Principal de Formulario ─────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Columna Izquierda: Parámetros (8 cols) */}
          <div
            style={{
              gridColumn: "span 8",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
            className="col-span-12 lg:col-span-8"
          >
            <div className="card admin-card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  padding: "15px 20px",
                  borderBottom: "1px solid #ebebeb",
                }}
              >
                <h3
                  style={{
                    fontFamily:
                      "var(--f, 'Inter Tight', system-ui, sans-serif)",
                    fontSize: "17px",
                    fontWeight: 500,
                    color: "#08090a",
                    margin: 0,
                  }}
                >
                  {t("cardTitle")}
                </h3>
              </div>

              <div
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                {/* Nombre de la categoría */}
                <div>
                  <label
                    htmlFor="cat-name"
                    style={{
                      display: "block",
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "14px",
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      color: "#00603a",
                      marginBottom: "6px",
                    }}
                  >
                    {t("nameLabel")} <span style={{ color: "#b3261e" }}>*</span>
                  </label>
                  <input
                    id="cat-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    required
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 13px",
                      border: "1px solid #ebebeb",
                      borderRadius: "8px",
                      background: "#ffffff",
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "14px",
                      color: "#08090a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label
                    htmlFor="cat-desc"
                    style={{
                      display: "block",
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "14px",
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      color: "#08090a",
                      marginBottom: "6px",
                    }}
                  >
                    {t("descLabel")}
                  </label>
                  <textarea
                    id="cat-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("descPlaceholder")}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px 13px",
                      border: "1px solid #ebebeb",
                      borderRadius: "8px",
                      background: "#ffffff",
                      fontFamily:
                        "var(--f, 'Inter Tight', system-ui, sans-serif)",
                      fontSize: "14px",
                      color: "#08090a",
                      outline: "none",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Configuración (4 cols) */}
          <div
            style={{
              gridColumn: "span 4",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
            className="col-span-12 lg:col-span-4"
          >
            <div className="card admin-card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  padding: "15px 18px",
                  borderBottom: "1px solid #ebebeb",
                }}
              >
                <h3
                  style={{
                    fontFamily:
                      "var(--f, 'Inter Tight', system-ui, sans-serif)",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#08090a",
                    margin: 0,
                  }}
                >
                  Configuración
                </h3>
              </div>

              <div
                style={{
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                {/* Switch Estado */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <label
                      style={{
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#08090a",
                      }}
                    >
                      {t("statusLabel")}
                    </label>
                    <span className={active ? "bg pub" : "bg draft"}>
                      {active ? t("statusActive") : t("statusInactive")}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: "#fafafa",
                      border: "1px solid #ebebeb",
                    }}
                  >
                    <span
                      style={{
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "12.5px",
                        color: "#6f6f6f",
                      }}
                    >
                      {active ? t("statusActive") : t("statusInactive")}
                    </span>
                    <Switch checked={active} onCheckedChange={setActive} />
                  </div>
                </div>

                <div style={{ height: "1px", background: "#ebebeb" }} />

                {/* Switch Orden Automático / Manual */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <label
                      htmlFor="auto-order-switch"
                      style={{
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#08090a",
                      }}
                    >
                      {t("autoOrderLabel")}
                    </label>
                    <Switch
                      id="auto-order-switch"
                      checked={autoOrder}
                      onCheckedChange={setAutoOrder}
                    />
                  </div>

                  {autoOrder ? (
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        background: "rgba(122,102,48,.06)",
                        border: "1px solid rgba(122,102,48,.18)",
                        fontFamily:
                          "var(--f, 'Inter Tight', system-ui, sans-serif)",
                        fontSize: "12px",
                        color: "#7a6630",
                        lineHeight: 1.4,
                      }}
                    >
                      {t("autoOrderNotice")}
                    </div>
                  ) : (
                    <div style={{ marginTop: "10px" }}>
                      <label
                        htmlFor="order-input"
                        style={{
                          display: "block",
                          fontFamily:
                            "var(--f, 'Inter Tight', system-ui, sans-serif)",
                          fontSize: "12px",
                          color: "#6f6f6f",
                          marginBottom: "4px",
                        }}
                      >
                        {t("orderLabel")}
                      </label>
                      <input
                        id="order-input"
                        type="number"
                        min={0}
                        value={displayOrder}
                        onChange={(e) =>
                          setDisplayOrder(parseInt(e.target.value) || 0)
                        }
                        style={{
                          width: "70px",
                          height: "36px",
                          textAlign: "center",
                          borderRadius: "8px",
                          border: "1px solid #ebebeb",
                          background: "#ffffff",
                          fontFamily: "var(--m, 'IBM Plex Mono', monospace)",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#08090a",
                          outline: "none",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CategoryForm;
