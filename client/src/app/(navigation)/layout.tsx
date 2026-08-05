import { NavigationHeader } from "@/components/navigation-header";
import { NavigationFooter } from "@/components/navigation-footer";

export default function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="phi min-h-screen flex flex-col bg-background text-foreground font-sans antialiased">
      <NavigationHeader />
      <main className="flex-1">{children}</main>
      <NavigationFooter />
    </div>
  );
}
