"use client";

import { Lock, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LanguageToggle } from "@/components/language-toggle";
import { LoginForm } from "./login-form";

export function LoginCard() {
  const t = useTranslations("LoginPage");

  return (
    <div className="w-full max-w-md flex flex-col items-center">
      <Card className="w-full border border-border/60 bg-card shadow-sm rounded-xl p-6 sm:p-8 relative">
        <div className="absolute top-4 right-4 z-10">
          <LanguageToggle />
        </div>

        <CardHeader className="p-0 mb-6 space-y-2">
          <CardTitle className="text-xl sm:text-2xl font-medium tracking-tight text-foreground text-left">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground leading-relaxed text-left">
            {t("descriptionPrefix")}
            <span className="italic">{t("descriptionHighlight")}</span>
            {t("descriptionSuffix")}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <LoginForm />
        </CardContent>
      </Card>

      <footer className="mt-8 flex flex-col items-center gap-2 text-xs text-muted-foreground/70 tracking-widest uppercase">
        <div className="flex items-center gap-3 font-medium text-center">
          <span>{t("footerVersion")}</span>
          <span className="opacity-40 font-light">|</span>
          <span>{t("footerSystemTitle")}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] opacity-75 mt-1">
          <div className="flex items-center gap-1.5">
            <Lock className="size-3" />
            <span>{t("footerSsl")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="size-3" />
            <span>{t("footerRestricted")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function LoginCardSkeleton() {
  return (
    <div className="w-full max-w-md flex flex-col items-center">
      <Card className="w-full border border-border/60 bg-card shadow-sm rounded-xl p-6 sm:p-8 relative">
        <div className="absolute top-4 right-4">
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
        <CardHeader className="p-0 mb-6 space-y-3">
          <Skeleton className="h-7 w-1/2 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-11 w-full rounded-md mt-4" />
        </CardContent>
      </Card>
      <div className="mt-8 flex flex-col items-center gap-2">
        <Skeleton className="h-3 w-64 rounded-md" />
        <Skeleton className="h-3 w-40 rounded-md" />
      </div>
    </div>
  );
}
