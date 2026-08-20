import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginCard, LoginCardSkeleton } from "@/features/auth/components/login-card";
import { AdminLanguageProvider } from "@/features/admin/context";

export const metadata: Metadata = {
  title: "Acceso Administrativo | PhysaFlow",
  description: "Acceso administrativo a la plataforma PhysaFlow",
};

export default function LoginPage() {
  return (
    <AdminLanguageProvider>
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#fafafa",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <Suspense fallback={<LoginCardSkeleton />}>
            <LoginCard />
          </Suspense>
        </div>
      </div>
    </AdminLanguageProvider>
  );
}
