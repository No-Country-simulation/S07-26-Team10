import { NavigationHeader } from "@/components/navigation-header";
import { NavigationFooter } from "@/components/navigation-footer";
import { VersionProvider } from "@/context/version-context";
import { NavigationHeaderWrapper } from "./navigation-header-wrapper";

export default function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VersionProvider>
      <div className="phi min-h-screen flex flex-col bg-background text-foreground font-sans antialiased">
        <NavigationHeaderWrapper>
          <NavigationHeader />
        </NavigationHeaderWrapper>
        <main className="flex-1">{children}</main>
        <NavigationFooter />
      </div>
    </VersionProvider>
  );
}
