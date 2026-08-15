"use client";

import { useEffect, useState } from "react";
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
import { getSectionsWithResourcesAction } from "@/features/admin/actions/sections-actions";
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
  const { activeReportVersion, activeVersionId } = useVersion();

  const [draftCount, setDraftCount] = useState<number>(0);
  const [publishedCount, setPublishedCount] = useState<number>(0);
  const [isSectionsLoaded, setIsSectionsLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadMetrics() {
      if (!activeVersionId) {
        if (isMounted) setIsSectionsLoaded(false);
        return;
      }
      try {
        const sections = await getSectionsWithResourcesAction(activeVersionId);
        if (isMounted) {
          const drafts = sections.filter(
            (s) => s.status?.toUpperCase() !== "PUBLISHED",
          ).length;
          const published = sections.filter(
            (s) => s.status?.toUpperCase() === "PUBLISHED",
          ).length;
          setDraftCount(drafts);
          setPublishedCount(published);
          setIsSectionsLoaded(true);
        }
      } catch (err) {
        console.error("Error loading sidebar footer stats:", err);
      }
    }
    void loadMetrics();
    return () => {
      isMounted = false;
    };
  }, [activeVersionId]);

  const versionRaw = activeReportVersion?.version || "";
  const versionDisplay = versionRaw
    ? versionRaw.toLowerCase().startsWith("v")
      ? versionRaw.toLowerCase()
      : `v${versionRaw.toLowerCase()}`
    : "";

  const isPublished =
    activeReportVersion?.status?.toUpperCase() === "PUBLISHED";
  const statusDisplay = isPublished
    ? t("footer.statusPublished")
    : t("footer.statusDraft");

  const showFooter = Boolean(
    activeVersionId && activeReportVersion && isSectionsLoaded,
  );

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
          className="p-0"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            textAlign: "left",
            gap: 11,
            padding: "16px 18px",
            borderBottom: "1px solid #ebebeb",
            background: "#fafafa",
            width: "100%",
          }}
        >
          <Link
            href="/admin"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              textAlign: "left",
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
            <div style={{ textAlign: "left" }}>
              <b
                style={{
                  display: "block",
                  fontFamily: "'Inter Tight', system-ui, sans-serif",
                  fontSize: 17,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  color: "#08090a",
                  lineHeight: 1.1,
                  textAlign: "left",
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
                  textAlign: "left",
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

        {/* Footer (.sfoot del prototipo dinámico según versión y secciones) */}
        {showFooter ? (
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
            <div>
              {versionDisplay} · {statusDisplay}
            </div>
            <div>
              {draftCount}{" "}
              {draftCount === 1
                ? t("footer.entrySingular")
                : t("footer.entryPlural")}{" "}
              · {publishedCount}{" "}
              {publishedCount === 1
                ? t("footer.measureSingular")
                : t("footer.measurePlural")}
            </div>
          </div>
        ) : null}
      </Sidebar>
    </>
  );
}
