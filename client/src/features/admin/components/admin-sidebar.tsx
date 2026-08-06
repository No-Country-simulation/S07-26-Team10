"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutGrid,
  GitFork,
  Folder,
  BookOpen,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    href: "/admin/sections",
    labelKey: "nav.sections",
    icon: LayoutGrid,
  },
  {
    href: "/admin/taxonomy",
    labelKey: "nav.taxonomy",
    icon: GitFork,
  },
  {
    href: "/admin/resources",
    labelKey: "nav.resources",
    icon: Folder,
  },
  {
    href: "/admin/references",
    labelKey: "nav.references",
    icon: BookOpen,
  },
  {
    href: "/admin/reports",
    labelKey: "nav.reports",
    icon: FileText,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("AdminPage");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Bar / Toggle Button */}
      <div className="md:hidden flex items-center justify-between p-3 border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-[53px] z-30">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            ADMIN
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-xl border-border/60 text-xs font-semibold gap-1.5 px-3 py-1.5"
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          <span>{mobileOpen ? "Cerrar" : "Menú"}</span>
        </Button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-35 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "w-full md:w-60 shrink-0 border-r border-border/40 bg-card/50 backdrop-blur-xs p-3 sm:p-4 transition-all duration-200",
          // Desktop sticky behavior fixed to viewport height below header
          "md:sticky md:top-[53px] md:h-[calc(100vh-53px)] md:overflow-y-auto",
          // Mobile drawer vs collapsed state
          mobileOpen
            ? "fixed top-[106px] inset-x-0 bottom-0 z-40 bg-card border-b flex flex-col overflow-y-auto"
            : "hidden md:flex flex-col",
        )}
      >
        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href) && item.href !== "/admin");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/15 text-primary font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span>{t(item.labelKey as any)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
