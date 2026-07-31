import { Suspense } from "react";
import { getCurrentUser } from "@/features/auth/auth-queries";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AdminHeader userRole={user?.role || "Administrador"} userName={user?.name || user?.email} />

      <div className="flex-1 flex flex-col md:flex-row w-full">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full">
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
    </div>
  );
}
