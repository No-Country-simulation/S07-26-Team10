import { NavigationHeader } from "@/components/navigation-header";
import { NavigationFooter } from "@/components/navigation-footer";

export default function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-foreground selection:text-background font-sans antialiased">
      <NavigationHeader />
      <main className="flex-1">{children}</main>
      <NavigationFooter />
    </div>
  );
}
