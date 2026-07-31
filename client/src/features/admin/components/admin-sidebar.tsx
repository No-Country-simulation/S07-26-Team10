"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutGrid,
  GitFork,
  Folder,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
];

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("AdminPage");

  return (
    <aside className="w-full md:w-56 shrink-0 border-r border-border/40 bg-card/30 backdrop-blur-xs flex flex-col min-h-[calc(100vh-3.5rem)] p-3 sm:p-4">
      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/15 text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{t(item.labelKey as any)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
