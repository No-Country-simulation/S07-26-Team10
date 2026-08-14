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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useVersion } from "@/context/version-context";
import NextImage from "next/image";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
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
  const {
    activeReport,
    reportVersions,
    baseReports,
    selectedBaseReportId,
  } = useVersion();

  const currentReportId =
    selectedBaseReportId || activeReport?.id || baseReports[0]?.id;
  const isLoaded = Boolean(currentReportId && baseReports.length > 0);

  const currentVersions = currentReportId
    ? reportVersions.filter((rv) => rv.report_id === currentReportId)
    : [];

  const uniqueVersions = new Set(
    currentVersions.map((rv) =>
      rv.version.toLowerCase().startsWith("v")
        ? rv.version.toLowerCase()
        : `v${rv.version.toLowerCase()}`
    )
  );
  const versionsCount = uniqueVersions.size;

  const uniqueLanguages = new Set(
    currentVersions.map((rv) => (rv.language || "es").toLowerCase())
  );
  const languagesCount = uniqueLanguages.size;

  return (
    <>
      {/* ── Sidebar Desktop (.side del prototipo) ─────────────── */}
      <Sidebar
        className="shrink-0"
        style={{
          width: "var(--sidebar-width, 250px)",
          background: "#fafafa",
          borderRight: "1px solid #ebebeb",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "sticky",
          top: 0,
        }}
      >
        {/* Brand (.sbrand del prototipo) */}
        <SidebarHeader
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "16px 18px",
            borderBottom: "1px solid #ebebeb",
            background: "#fafafa",
          }}
        >
          <Link
            href="/admin"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              textDecoration: "none",
              color: "inherit",
              width: "100%",
            }}
          >
            <NextImage
              src="/physaflow-isotipo.png"
              alt="PhysaFlow"
              width={34}
              height={34}
              style={{
                height: 34,
                width: "auto",
                flexShrink: 0,
                objectFit: "contain",
              }}
              priority
            />
            <div>
              <b
                style={{
                  display: "block",
                  fontFamily: "'Inter Tight', system-ui, sans-serif",
                  fontSize: 17,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  color: "#08090a",
                  lineHeight: 1.1,
                }}
              >
                PhysaFlow
              </b>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  color: "#6f6f6f",
                  marginTop: 3,
                  display: "block",
                }}
              >
                {t("cmsTitle") || "CMS ADMIN"}
              </span>
            </div>
          </Link>
        </SidebarHeader>

        {/* Navegación (.snav del prototipo) */}
        <SidebarContent
          className="p-0"
          style={{
            padding: "14px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            background: "#fafafa",
            width: "100%",
          }}
        >
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
              margin: 0,
              padding: 0,
            }}
          >
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
                    "w-full flex items-center transition-colors",
                    isActive ? "font-medium" : "font-normal",
                  )}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: "9px 12px",
                    borderRadius: 8,
                    fontSize: 14,
                    letterSpacing: "-0.01em",
                    textDecoration: "none",
                    background: isActive ? "#00603a" : "transparent",
                    color: isActive ? "#ffffff" : "#08090a",
                    fontWeight: 500,
                    width: "100%",
                    boxSizing: "border-box",
                    justifyContent: "flex-start",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background =
                        "rgba(0,96,58,.07)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                    }
                  }}
                >
                  <Icon
                    style={{
                      width: 16,
                      height: 16,
                      stroke: "currentColor",
                      fill: "none",
                      strokeWidth: 1.8,
                      flexShrink: 0,
                      opacity: isActive ? 1 : 0.6,
                    }}
                  />
                  <span>{t(item.labelKey as Parameters<typeof t>[0])}</span>
                </Link>
              );
            })}
          </nav>
        </SidebarContent>

        {/* Footer (.sfoot del prototipo dinámico según reporte) */}
        {isLoaded ? (
          <div
            style={{
              marginTop: "auto",
              padding: "15px 18px",
              borderTop: "1px solid #ebebeb",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: ".04em",
              color: "#6f6f6f",
              lineHeight: 1.7,
              background: "#fafafa",
            }}
          >
            <div>{t("footer.sidebarBrand")}</div>
            <div>
              {versionsCount}{" "}
              {versionsCount === 1
                ? t("footer.versionSingular")
                : t("footer.versionPlural")}{" "}
              · {languagesCount}{" "}
              {languagesCount === 1
                ? t("footer.languageSingular")
                : t("footer.languagePlural")}
            </div>
          </div>
        ) : null}
      </Sidebar>
    </>
  );
}
