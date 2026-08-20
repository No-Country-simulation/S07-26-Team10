"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLanguageToggle } from "@/features/admin/components/ui/toggles/admin-language-toggle";
import { LoginForm } from "./login-form";

export function LoginCard() {
  const t = useTranslations("LoginPage");

  return (
    <>
      {/* .lbox del prototipo: fondo blanco, borde #ebebeb, radius 12px, padding 30px */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          border: "1px solid #ebebeb",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 1px 3px rgba(8,9,10,0.04)",
          boxSizing: "border-box",
        }}
      >
        {/* Encabezado con título y selector de idioma */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
            marginBottom: "10px",
          }}
        >
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontFamily: "'Inter Tight', system-ui, sans-serif",
                fontSize: "24px",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "#08090a",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {t("title")}
            </h1>
          </div>
          <AdminLanguageToggle />
        </div>

        {/* Descripción — equivale a .d del prototipo */}
        <p
          style={{
            fontFamily: "'Inter Tight', system-ui, sans-serif",
            fontSize: "15px",
            color: "#706f6f",
            margin: "0 0 26px 0",
            lineHeight: 1.5,
            letterSpacing: "-0.01em",
          }}
        >
          {t("descriptionPrefix")}
          {t("descriptionHighlight")}
          {t("descriptionSuffix")}
        </p>

        <LoginForm />
      </div>

      {/* Footer — equivale a .lfoot del prototipo */}
      <div
        style={{
          textAlign: "center",
          marginTop: "22px",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "11px",
          letterSpacing: ".05em",
          color: "#6f6f6f",
          lineHeight: 1.9,
        }}
      >
        {t("footerVersion")} · {t("footerSystemTitle")}
        <br />
        {t("footerSsl")} · {t("footerRestricted")}
      </div>
    </>
  );
}

export function LoginCardSkeleton() {
  return (
    <>
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          border: "1px solid #ebebeb",
          borderRadius: "12px",
          padding: "30px",
        }}
        className="space-y-4"
      >
        <div className="flex items-start gap-4 mb-2">
          <Skeleton className="h-7 w-1/2 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-lg ml-auto" />
        </div>
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="h-4 w-36 rounded-md" />
        <Skeleton className="h-11 w-full rounded-md mt-2" />
      </div>
      <div className="mt-6 space-y-1 text-center">
        <Skeleton className="h-3 w-64 rounded-md mx-auto" />
        <Skeleton className="h-3 w-40 rounded-md mx-auto" />
      </div>
    </>
  );
}
