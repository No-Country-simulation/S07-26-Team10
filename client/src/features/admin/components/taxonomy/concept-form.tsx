"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, PlusCircle } from "lucide-react";
import type { ConceptItem } from "../../schemas/taxonomy-schema";
import { getCategoryOptionsAction, createConceptAction } from "../../actions/taxonomy-actions";
import { useVersion } from "@/context/version-context";

interface ConceptFormProps {
  initialData?: ConceptItem;
  isEditMode?: boolean;
}

export function ConceptForm({ initialData, isEditMode = false }: ConceptFormProps) {
  const t = useTranslations("AdminPage.taxonomy.conceptForm");
  const router = useRouter();
  const { activeReportId } = useVersion();

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic options loaded from server actions
  const [categoryOptions, setCategoryOptions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const cats = await getCategoryOptionsAction(activeReportId || undefined);
        setCategoryOptions(cats);

        // Set default selected category if not pre-populated
        if (!initialData?.category_id && cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      } catch (err) {
        console.error("Failed to load options for concept form", err);
      }
    }
    loadOptions();
  }, [initialData, activeReportId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isEditMode) {
        // Edit mode will be handled once PATCH concept is added
        router.push("/admin/taxonomy");
      } else {
        const res = await createConceptAction({
          category_id: categoryId,
          name,
          description,
          display_order: displayOrder,
        });

        if (res.success) {
          router.push("/admin/taxonomy");
          router.refresh();
        } else {
          setErrorMessage(res.message || t("errorCreate"));
        }
      }
    } catch (err) {
      console.error("Error submitting concept form:", err);
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
              className="rounded-xl px-5 gap-2 shadow-xs bg-amber-800 text-amber-100 hover:bg-amber-700"
            >
              <Save className="size-4" />
              <span>{isSubmitting ? t("saving") : t("saveConcept")}</span>
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
            <PlusCircle className="size-5 text-amber-700 dark:text-amber-400" />
            <CardTitle className="text-base font-semibold">{t("cardTitle")}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="con-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("nameLabel")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="con-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={150}
                placeholder={t("namePlaceholder")}
                className="rounded-xl bg-background text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="con-order" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("orderLabel")}
              </Label>
              <Input
                id="con-order"
                type="number"
                min={1}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                className="rounded-xl bg-background text-sm font-mono font-semibold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="con-cat" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("categoryLabel")} <span className="text-destructive">*</span>
            </Label>
            <Select value={categoryId} onValueChange={(val) => { if (val) setCategoryId(val); }}>
              <SelectTrigger id="con-cat" className="rounded-xl bg-background text-sm">
                <SelectValue placeholder={t("categoryPlaceholder")}>
                  {categoryOptions.find((c) => c.id === categoryId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="con-desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("descLabel")}
            </Label>
            <Textarea
              id="con-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t("descPlaceholder")}
              className="rounded-xl bg-background text-xs leading-relaxed p-3 border-border/60"
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export default ConceptForm;
