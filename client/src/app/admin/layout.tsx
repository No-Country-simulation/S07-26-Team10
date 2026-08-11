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
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
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
      <SidebarProvider className="admin-theme min-h-screen flex flex-col bg-background text-foreground">
        <AdminHeader userRole={user.role} userName={user.name || user.email} />

        <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 md:pt-3 pb-6 gap-4">
          <AdminSidebar />
          <SidebarInset>
            <Suspense fallback={<AdminLayoutSkeleton />}>{children}</Suspense>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </VersionProvider>
  );
}
