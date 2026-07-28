import type { Metadata } from "next";
import { getCurrentUser } from "@/features/auth/auth-queries";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Panel de Administración | PhysaFlow",
  description: "Gestión de contenido de reportes",
};

export default async function AdminPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-2">
            <CheckCircle2 className="size-3.5" /> Sesión Autenticada
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Bienvenido, {user?.name || "Administrador"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Panel de control para la gestión de contenido.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="rounded-2xl gap-2 shadow-sm">
            <PlusCircle className="size-4" /> Nuevo Reporte
          </Button>
        </div>
      </div>
    </div>
  );
}
