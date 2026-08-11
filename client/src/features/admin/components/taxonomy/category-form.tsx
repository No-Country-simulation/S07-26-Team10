"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Layers } from "lucide-react";
import type { CategoryItem } from "../../schemas/taxonomy-schema";
import { createCategoryAction, updateCategoryAction } from "../../actions/taxonomy-actions";
import { useVersion } from "@/context/version-context";

interface CategoryFormProps {
  initialData?: CategoryItem;
  isEditMode?: boolean;
}

export function CategoryForm({ initialData, isEditMode = false }: CategoryFormProps) {
  const t = useTranslations("AdminPage.taxonomy.categoryForm");
  const router = useRouter();
  const { activeReportId, activeVersionId, activeReportVersion } = useVersion();

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order || 0);
  const [autoOrder, setAutoOrder] = useState<boolean>(!initialData?.display_order);
  const [active, setActive] = useState<boolean>(initialData?.status === "PUBLISHED" || initialData?.active || initialData?.published || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const statusVal = active ? "PUBLISHED" : "DRAFT";
      const targetVersionId = initialData?.report_version_id || initialData?.report_id || activeReportVersion?.id || activeVersionId || activeReportId;
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
          targetVersionId || undefined
        );

        if (res.success) {
          router.push("/admin/taxonomy");
          router.refresh();
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
          router.push("/admin/taxonomy");
          router.refresh();
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-2">
      {/* Breadcrumb Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Link href="/admin/taxonomy" className="hover:text-foreground">
            {t("breadcrumbBase")}
          </Link>
          <span>›</span>
          <span className="text-foreground">{isEditMode ? t("breadcrumbEdit") : t("breadcrumbNew")}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isEditMode ? t("editTitle", { name: initialData?.name || "" }) : t("createTitle")}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/taxonomy">
              <Button type="button" variant="outline" className="rounded-xl border-border/60">
                {t("cancel")}
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl px-5 gap-2 shadow-xs bg-emerald-950 text-emerald-100 hover:bg-emerald-900"
            >
              <Save className="size-4" />
              <span>{isSubmitting ? t("saving") : t("saveCategory")}</span>
            </Button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <Card className="border border-border/60 bg-card shadow-xs rounded-2xl p-6">
        <CardHeader className="p-0 mb-6 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <Layers className="size-5 text-emerald-700 dark:text-emerald-400" />
            <CardTitle className="text-base font-semibold">{t("cardTitle")}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("nameLabel")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={150}
                placeholder={t("namePlaceholder")}
                className="rounded-xl bg-background text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cat-order" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("orderLabel")}
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-foreground">
                    {t("autoOrderLabel")}
                  </span>
                  <Switch
                    checked={autoOrder}
                    onCheckedChange={(checked) => {
                      setAutoOrder(checked);
                      if (checked) {
                        setDisplayOrder(0);
                      } else {
                        setDisplayOrder(initialData?.display_order || 1);
                      }
                    }}
                  />
                </div>
              </div>

              {autoOrder ? (
                <div className="p-3 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                  {t("autoOrderNotice")}
                </div>
              ) : (
                <Input
                  id="cat-order"
                  type="number"
                  min={1}
                  value={displayOrder || 1}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                  className="rounded-xl bg-background text-sm font-mono font-semibold"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("descLabel")}
            </Label>
            <Textarea
              id="cat-desc"
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
                {t("statusLabel")}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {t("statusDesc")}
              </p>
            </div>
            <Switch
              checked={active}
              onCheckedChange={setActive}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export default CategoryForm;
