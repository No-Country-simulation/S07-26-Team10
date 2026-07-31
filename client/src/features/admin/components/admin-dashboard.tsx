"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, History, ShieldCheck } from "lucide-react";

export function AdminDashboard() {
  const t = useTranslations("AdminPage");

  return (
    <div className="flex flex-col justify-between min-h-full space-y-8 w-full max-w-5xl mx-auto py-2">
      <div className="space-y-8">
        {/* Module Header Tags */}
        <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-muted-foreground uppercase">
          <span>{t("moduleInit")}</span>
          <span>{t("moduleId")}</span>
        </div>

        {/* Main Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            {t("titlePrefix")}
            <span className="font-serif italic font-normal text-primary">
              {t("titleSuffix")}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {t("description")}
            <strong className="font-semibold text-foreground">
              {t("descriptionBold")}
            </strong>
            {t("descriptionSuffix")}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Card 1: Database */}
          <Card className="border border-border/50 bg-card/60 shadow-xs rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <BarChart3 className="size-5" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground/80 uppercase">
                  {t("databaseCard.liveStatus")}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {t("databaseCard.title")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {t("databaseCard.description")}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[84%]" />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>{t("databaseCard.synced")}</span>
                <span>{t("databaseCard.version")}</span>
              </div>
            </div>
          </Card>

          {/* Card 2: Recent Changes */}
          <Card className="border border-border/50 bg-card/60 shadow-xs rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <History className="size-5" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground/80 uppercase">
                  {t("changesCard.recentActivity")}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {t("changesCard.title")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {t("changesCard.description")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-medium text-foreground">
                {t("changesCard.pendingReview")}
              </span>
            </div>
          </Card>
        </div>

        {/* Editorial Note Quote Box */}
        <Card className="border-l-4 border-l-primary border-y border-r border-border/40 bg-card/40 rounded-xl p-6 sm:p-8">
          <CardContent className="p-0 space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
              {t("editorialNote.tag")}
            </span>
            <blockquote className="text-sm sm:text-base italic text-foreground/90 font-serif leading-relaxed">
              {t("editorialNote.quote")}
            </blockquote>
          </CardContent>
        </Card>

        {/* User Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/30">
          <div className="flex flex-wrap items-center gap-8 text-xs font-mono">
            <div>
              <span className="text-[10px] text-muted-foreground block uppercase">
                {t("userInfo.currentUserLabel")}
              </span>
              <span className="font-bold text-foreground">
                {t("userInfo.currentUserValue")}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block uppercase">
                {t("userInfo.lastAccessLabel")}
              </span>
              <span className="text-foreground">
                {t("userInfo.lastAccessValue")}
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
            <ShieldCheck className="size-3.5" />
            <span>{t("userInfo.secureConnection")}</span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="flex items-center justify-between text-xs text-muted-foreground/70 pt-6 border-t border-border/30">
        <span>{t("footer.systemTitle")}</span>
        <span>{t("footer.version")}</span>
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="flex flex-col space-y-8 w-full max-w-5xl mx-auto py-2">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-14 w-3/4 rounded-xl" />
        <Skeleton className="h-6 w-full max-w-2xl rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}
