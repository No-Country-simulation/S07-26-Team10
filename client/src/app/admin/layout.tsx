import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/auth-queries";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { VersionProvider } from "@/context/version-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

function AdminLayoutSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?expired=true");
  }

  return (
    <VersionProvider>
      {/*
        Estructura igual al prototipo:
        .app { display: grid; grid-template-columns: 250px 1fr; min-height: 100vh }
        .side = sidebar (izquierda, altura completa)
        .main = columna derecha: header arriba + contenido abajo
      */}
      <SidebarProvider className="admin-theme min-h-screen flex bg-background text-foreground">
        {/* Sidebar — columna izquierda, altura completa */}
        <AdminSidebar />

        {/* Columna derecha: header sticky + contenido */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            userRole={user.role}
            userName={user.name || user.email}
          />

          {/* Contenido del módulo — .body del prototipo */}
          <SidebarInset className="admin-body flex-1 min-w-0 overflow-auto">
            <main className="px-[22px] py-[30px] pb-[70px] max-w-[1200px] w-full">
              <Suspense fallback={<AdminLayoutSkeleton />}>{children}</Suspense>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </VersionProvider>
  );
}
