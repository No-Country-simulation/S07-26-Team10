"use client";

import { useTranslations } from "next-intl";
import { logoutAction } from "@/features/auth/auth-actions";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";
import Link from "next/link";

interface AdminHeaderProps {
  userRole?: string;
  userName?: string;
}

export function AdminHeader({ userRole = "Administrador" }: AdminHeaderProps) {
  const t = useTranslations("AdminPage");

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-card px-4 sm:px-8 py-2.5 flex items-center justify-between shadow-xs">
      <Link href="/admin" className="flex items-center gap-3 group">
        <span className="font-bold text-lg tracking-tight text-foreground">
          PhysaFlow
        </span>
        <span className="hidden sm:inline text-xs font-mono tracking-wider uppercase text-muted-foreground/80 pt-0.5">
          {t("cmsTitle")}
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <LanguageToggle />

        <div className="flex items-center gap-2 bg-muted/40 px-3 py-1 rounded-full border border-border/40 text-xs font-medium text-foreground">
          <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <User className="size-3" />
          </div>
          <span>{userRole}</span>
        </div>

        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-lg px-2 sm:px-3"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">{t("actions.logout")}</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
