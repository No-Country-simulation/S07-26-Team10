"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LayoutGrid, PlusCircle, FileText, ArrowRight } from "lucide-react";
import { getSectionsAction } from "../../actions/sections-actions";
import type { SectionItem } from "../../schemas/section-schema";

export function SectionsManagement() {
  const t = useTranslations("AdminPage");
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSections() {
      try {
        const data = await getSectionsAction();
        setSections(data);
      } catch (err) {
        console.error("Failed to load sections", err);
      } finally {
        setLoading(false);
      }
    }
    loadSections();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("pages.sectionsTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("pages.sectionsDesc")}
          </p>
        </div>
        <Link href="/admin/sections/new">
          <Button className="gap-2 rounded-xl shadow-xs">
            <PlusCircle className="size-4" />
            <span>{t("pages.newSection")}</span>
          </Button>
        </Link>
      </div>

      <Card className="border border-border/60 bg-card shadow-xs rounded-2xl p-6">
        <CardHeader className="p-0 mb-6">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <LayoutGrid className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{t("pages.sectionsTableTitle")}</CardTitle>
              <CardDescription className="text-xs">{t("pages.sectionsTableDesc")}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : sections.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border/60 rounded-xl bg-muted/20 text-sm text-muted-foreground space-y-3">
              <FileText className="size-8 mx-auto opacity-50 text-muted-foreground" />
              <p>{t("pages.noSections")}</p>
              <Link href="/admin/sections/new">
                <Button variant="outline" size="sm" className="rounded-xl">
                  {t("pages.createFirstSection")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>{t("pages.tableTitle")}</TableHead>
                    <TableHead>{t("pages.tableSlug")}</TableHead>
                    <TableHead>{t("pages.tableCitation")}</TableHead>
                    <TableHead className="text-right">{t("pages.tableActions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium text-foreground">
                        <div className="flex flex-col">
                          <span>{section.title}</span>
                          <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[200px]">
                            {section.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {section.slug}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[220px]">
                        {section.citation_text || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/sections/${section.id}`}>
                          <Button variant="outline" size="sm" className="rounded-lg h-8 px-3 text-xs gap-1.5 border-border/60">
                            <span>{t("pages.edit")}</span>
                            <ArrowRight className="size-3" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SectionsManagementSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 rounded-md" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
