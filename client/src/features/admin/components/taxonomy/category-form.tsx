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
import { ChevronLeft, Save, Layers } from "lucide-react";
import type { CategoryItem } from "../../schemas/taxonomy-schema";

interface CategoryFormProps {
  initialData?: CategoryItem;
  isEditMode?: boolean;
}

export function CategoryForm({ initialData, isEditMode = false }: CategoryFormProps) {
  const t = useTranslations("AdminPage.taxonomy.categoryForm");
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order || 1);
  const [active, setActive] = useState<boolean>(initialData?.active ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/admin/taxonomy");
    }, 400);
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

      <Card className="border border-border/60 bg-card shadow-xs rounded-2xl p-6">
        <CardHeader className="p-0 mb-6 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <Layers className="size-5 text-emerald-700 dark:text-emerald-400" />
            <CardTitle className="text-base font-semibold">Parámetros de la Categoría (categories)</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nombre (name) <span className="text-destructive">*</span>
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
              <Label htmlFor="cat-order" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Orden de Visualización (display_order)
              </Label>
              <Input
                id="cat-order"
                type="number"
                min={1}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                className="rounded-xl bg-background text-sm font-mono font-semibold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Descripción (description)
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
                Estado Activo (active)
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Determina si la categoría está disponible y visible en el sistema.
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
