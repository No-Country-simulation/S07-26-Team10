import { Suspense } from "react";
import { getCurrentUser } from "@/features/auth/auth-queries";
import { logoutAction } from "@/features/auth/auth-actions";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LogOut, User } from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header Admin */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-inner">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight leading-tight">
              PhysaFlow Admin
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Gestión de contenido y reportes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          {user && (
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-2xl border border-border/50 text-xs">
              <User className="size-3.5 text-primary" />
              <span className="font-medium text-foreground max-w-[140px] truncate">
                {user.email}
              </span>
              <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wide">
                {user.role}
              </span>
            </div>
          )}

          <form action={logoutAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5 border-border/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </form>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl w-full mx-auto">
        <Suspense
          fallback={
            <div className="p-8 text-center text-muted-foreground">
              Cargando panel...
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
