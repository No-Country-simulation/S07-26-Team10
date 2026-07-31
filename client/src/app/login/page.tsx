import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginCard, LoginCardSkeleton } from "@/features/auth/components/login-card";

export const metadata: Metadata = {
  title: "Iniciar Sesión | PhysaFlow",
  description: "Acceso administrativo a la plataforma PhysaFlow",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-background p-4 sm:p-8 font-sans">
      <main className="w-full max-w-md flex flex-col items-center">
        <Suspense fallback={<LoginCardSkeleton />}>
          <LoginCard />
        </Suspense>
      </main>
    </div>
  );
}
