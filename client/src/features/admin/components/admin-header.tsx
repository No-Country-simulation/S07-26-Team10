"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { logoutAction } from "@/features/auth/auth-actions";
import { cn } from "@/lib/utils";
import { LogOut, User } from "lucide-react";
import { AdminLanguageToggle } from "./ui/toggles/admin-language-toggle";
import { AdminReportToggle } from "./ui/toggles/admin-report-toggle";
import { AdminVersionToggle } from "./ui/toggles/admin-version-toggle";
import Link from "next/link";
import NextImage from "next/image";

/* ─── Vistas del CMS (idéntico a .views del prototipo) ──────── */
const navItems = [
  { href: "/admin/sections", labelKey: "nav.sections" },
  { href: "/admin/taxonomy", labelKey: "nav.taxonomy" },
  { href: "/admin/resources", labelKey: "nav.resources" },
  { href: "/admin/references", labelKey: "nav.references" },
  { href: "/admin/reports", labelKey: "nav.reports" },
] as const;

interface AdminHeaderProps {
  userRole?: string;
  userName?: string;
}

export function AdminHeader({
  userRole = "admin",
  userName,
}: AdminHeaderProps) {
  const t = useTranslations("AdminPage");
  const pathname = usePathname();

  const displayName = "admin";

  return (
    <>
      {/* ── Brand Bar Mobile (NO sticky: se desplaza con el scroll de la página) ── */}
      <div
        className="md:hidden flex items-center gap-[11px] px-[18px] py-[14px]"
        style={{
          background: "#fafafa",
          borderBottom: "1px solid #ebebeb",
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
      </div>

      {/* ── Header Sticky (pestañas y controles que se quedan fijos arriba al hacer scroll) ── */}
      <header
        className="sticky top-0 z-20 w-full flex items-center justify-between flex-wrap"
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #ebebeb",
          minHeight: "56px",
          padding: "10px 18px",
          rowGap: "8px",
          columnGap: "12px",
        }}
      >
        {/* ── Nav horizontal con scroll horizontal fluido (.views del prototipo) ── */}
        <nav
          className="flex items-center overflow-x-auto flex-nowrap w-full md:w-auto flex-1 md:flex-none min-w-0"
          style={{
            gap: 4,
            scrollbarWidth: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              Boolean(pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap transition-all shrink-0",
                  "text-[14px] font-medium",
                )}
                style={{
                  height: 36,
                  padding: "0 16px",
                  borderRadius: 8,
                  border: isActive
                    ? "1px solid #ebebeb"
                    : "1px solid transparent",
                  background: isActive ? "#ffffff" : "transparent",
                  color: isActive ? "#08090a" : "#706f6f",
                  letterSpacing: "-0.01em",
                  boxShadow: isActive ? "0 1px 2px rgba(8,9,10,0.04)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(0,96,58,.07)";
                    (e.currentTarget as HTMLElement).style.color = "#08090a";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#706f6f";
                  }
                }}
              >
                {t(item.labelKey as Parameters<typeof t>[0])}
              </Link>
            );
          })}
        </nav>

        {/* ── Controles (a la derecha en desktop, en filas limpias en mobile) ── */}
        <div
          className="flex items-center flex-wrap gap-2 w-full md:w-auto md:ml-auto"
        >
          {/* Report slug */}
          <AdminReportToggle />

          {/* Version + edition */}
          <AdminVersionToggle />

          {/* UI language */}
          <AdminLanguageToggle />

          {/* User pill */}
          <div
            className="inline-flex items-center whitespace-nowrap"
            style={{
              gap: 7,
              height: 30,
              padding: "0 12px",
              borderRadius: 8,
              border: "1px solid #ebebeb",
              background: "#ffffff",
              fontSize: 12.5,
              color: "#08090a",
            }}
          >
            <User
              style={{
                width: 14,
                height: 14,
                stroke: "#6f6f6f",
                fill: "none",
                strokeWidth: 1.8,
              }}
            />
            <span style={{ color: "#08090a" }}>{displayName}</span>
          </div>

          {/* Sign out */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center"
              style={{
                gap: 7,
                height: 30,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid #ebebeb",
                background: "#ffffff",
                fontSize: 12.5,
                color: "#706f6f",
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#b3261e";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(179,38,30,.07)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#706f6f";
                (e.currentTarget as HTMLElement).style.background = "#ffffff";
              }}
            >
              <LogOut
                style={{
                  width: 14,
                  height: 14,
                  stroke: "currentColor",
                  fill: "none",
                  strokeWidth: 1.8,
                }}
              />
              <span className="hidden sm:inline">{t("actions.logout")}</span>
            </button>
          </form>
        </div>
      </header>
    </>
  );
}
