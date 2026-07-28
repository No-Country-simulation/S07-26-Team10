"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LanguageToggle } from "@/components/language-toggle";
import { LoginForm } from "./login-form";

export function LoginCard() {
  const t = useTranslations("LoginPage");

  return (
    <Card className="w-full max-w-md border border-border/80 bg-card/90 backdrop-blur-md shadow-xl rounded-3xl p-2 sm:p-4 transition-all relative">
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>
      <CardHeader className="space-y-2 text-center pb-4 pt-2">
        <div className="mx-auto size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-1 shadow-inner">
          <ShieldCheck className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {t("title")}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground px-4">
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <LoginForm />
      </CardContent>
    </Card>
  );
}

export function LoginCardSkeleton() {
  return (
    <Card className="w-full max-w-md border border-border/80 bg-card/90 shadow-xl rounded-3xl p-2 sm:p-4 relative">
      <div className="absolute top-4 right-4">
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
      <CardHeader className="space-y-3 text-center pb-4 pt-2">
        <div className="mx-auto size-12 rounded-2xl bg-muted animate-pulse flex items-center justify-center" />
        <Skeleton className="h-7 w-3/4 mx-auto rounded-lg" />
        <Skeleton className="h-4 w-5/6 mx-auto rounded-md" />
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="h-11 w-full rounded-2xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="h-11 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-11 w-full rounded-2xl mt-4" />
      </CardContent>
      <CardFooter className="pt-4 pb-2 justify-center">
        <Skeleton className="h-3 w-48 rounded-md" />
      </CardFooter>
    </Card>
  );
}
