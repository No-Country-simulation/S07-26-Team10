"use client";

import { useEffect } from "react";
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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { AdminReportToggle } from "./ui/toggles/admin-report-toggle";
import { AdminVersionToggle } from "./ui/toggles/admin-version-toggle";

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
  const { openMobile, setOpenMobile, toggleSidebar, isMobile } = useSidebar();
  const isReportsPage = pathname?.startsWith("/admin/reports");

  // Auto-close mobile drawer when user navigates to a new route
  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <>
      {/* Secondary Mobile Navigation Bar */}
      {isMobile && (
        <div className="md:hidden flex flex-col gap-2.5 p-3 border-b border-sidebar-border/80 bg-sidebar/95 backdrop-blur-xs sticky top-[49px] z-30 w-full shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              {t("cmsTitle") || "ADMINISTRACIÓN"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSidebar}
              className="rounded-xl border-border/60 text-xs font-semibold gap-1.5 px-3 py-1.5"
            >
              {openMobile ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
              <span>{openMobile ? "Cerrar" : "Menú"}</span>
            </Button>
          </div>

          {/* Secondary Mobile Nav Controls (Report & Version Toggles) */}
          {!isReportsPage && (
            <div className="flex items-center gap-2 pt-2 border-t border-sidebar-border/40 overflow-x-auto">
              <AdminReportToggle />
              <AdminVersionToggle />
            </div>
          )}
        </div>
      )}

      <Sidebar className="border-r border-sidebar-border/60 bg-sidebar w-64 shrink-0 pt-2 md:pt-3">
        <SidebarHeader className="px-3 pt-1 pb-2 border-b border-sidebar-border/40 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight text-foreground">
              PhysaFlow
            </span>
            <span className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground">
              {t("cmsTitle") || "CMS ADMIN"}
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 pt-1">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (pathname.startsWith(item.href) && item.href !== "/admin");

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={<Link href={item.href} />}
                        className={cn(
                          "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-xs"
                            : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span>{t(item.labelKey as Parameters<typeof t>[0])}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
