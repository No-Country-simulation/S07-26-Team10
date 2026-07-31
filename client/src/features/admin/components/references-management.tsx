"use client";

import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, FileCheck } from "lucide-react";

export function ReferencesManagement() {
  const t = useTranslations("AdminPage");

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("pages.referencesTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("pages.referencesDesc")}
        </p>
      </div>

      <Card className="border border-border/50 bg-card/60 shadow-xs rounded-2xl p-6">
        <CardHeader className="p-0 mb-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Referencias Técnicas</CardTitle>
              <CardDescription className="text-xs">Fuentes de información y citas metodológicas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6 text-center border border-dashed border-border/60 rounded-xl bg-muted/20 text-sm text-muted-foreground">
            <FileCheck className="size-8 mx-auto mb-2 opacity-50" />
            Módulo de Referencias configurado.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ReferencesManagementSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 rounded-md" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
