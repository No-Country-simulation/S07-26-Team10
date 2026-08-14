"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck } from "lucide-react";

export function AdminDashboard() {
  const t = useTranslations("AdminPage");

  return (
    <div className="flex flex-col justify-between min-h-full space-y-8 w-full max-w-5xl mx-auto py-2">
      <div className="space-y-8">
        {/* Eyebrow — equivale a .eyebrow del prototipo */}
        <div className="flex items-center gap-3 font-mono text-[11px] tracking-[.07em] uppercase text-primary">
          <span className="inline-block w-[22px] h-px bg-primary flex-none" />
          <span>{t("moduleInit")}</span>
          <span className="ml-auto text-muted-foreground">{t("moduleId")}</span>
        </div>

        {/* Main Title */}
        <div className="space-y-4">
          {/* h1 — peso 500, sin serif, tracking -0.03em igual al prototipo */}
          <h1 className="text-[34px] leading-[1.1] font-medium tracking-[-0.03em] text-foreground">
            {t("titlePrefix")}
            <span className="text-primary">{t("titleSuffix")}</span>
          </h1>

          <p className="text-[15px] text-muted-foreground mt-[9px] max-w-[74ch] leading-relaxed">
            {t("description")}
            <strong className="font-medium text-foreground">{t("descriptionBold")}</strong>
            {t("descriptionSuffix")}
          </p>
        </div>

        {/* Cards Grid — glassmorphism igual al prototipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] pt-2">
          {/* Card 1: Database */}
          <div className="admin-card rounded-[var(--radius)] overflow-hidden">
            <div className="flex items-center gap-3 px-[18px] py-[15px] border-b border-border/60">
              <h3 className="text-[17px]">{t("databaseCard.title")}</h3>
              <span className="ml-auto text-[11px] font-mono tracking-[.05em] text-muted-foreground">{t("databaseCard.liveStatus")}</span>
            </div>
            <div className="p-[18px] space-y-3">
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">{t("databaseCard.description")}</p>
              <div className="h-[3px] w-full bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[84%]" />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>{t("databaseCard.synced")}</span>
                <span>{t("databaseCard.version")}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Recent Changes */}
          <div className="admin-card rounded-[var(--radius)] overflow-hidden">
            <div className="flex items-center gap-3 px-[18px] py-[15px] border-b border-border/60">
              <h3 className="text-[17px]">{t("changesCard.title")}</h3>
              <span className="ml-auto text-[11px] font-mono tracking-[.05em] text-muted-foreground">{t("changesCard.recentActivity")}</span>
            </div>
            <div className="p-[18px] space-y-3">
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">{t("changesCard.description")}</p>
              <div className="flex items-center gap-2">
                {/* dot verde igual al prototipo */}
                <span className="size-[7px] rounded-full bg-primary flex-none" />
                <span className="text-[14px] font-medium text-foreground">{t("changesCard.pendingReview")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nota editorial — equivale a .quote del prototipo */}
        <div className="border-l-2 border-primary pl-5 py-0.5 mt-[26px]">
          <span className="font-mono text-[11px] tracking-[.06em] uppercase text-primary">{t("editorialNote.tag")}</span>
          <blockquote className="text-[17px] leading-[1.5] tracking-[-0.01em] text-foreground/90 mt-[10px] max-w-[78ch]">
            {t("editorialNote.quote")}
          </blockquote>
        </div>

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
