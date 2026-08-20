import { NavigationHeader } from "@/components/navigation-header";
import { NavigationFooter } from "@/components/navigation-footer";
import { BackToTop } from "@/components/back-to-top";
import { VersionProvider } from "@/context/version-context";
import { NavigationHeaderWrapper } from "./navigation-header-wrapper";
import { getPublicReportsWithVersions } from "@/features/public/report/queries/reports";
import { DownloadReportButtonServer } from "@/features/report-download/components/download-report-button-server";

export default async function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialReports = await getPublicReportsWithVersions();

  return (
    <VersionProvider publicOnly initialReports={initialReports}>
      <div className="phi min-h-screen flex flex-col bg-background text-foreground font-sans antialiased">
        <NavigationHeaderWrapper>
          <NavigationHeader />
        </NavigationHeaderWrapper>
        <main className="flex-1">{children}</main>
        <NavigationFooter downloadButton={<DownloadReportButtonServer />} />
        <BackToTop />
      </div>
    </VersionProvider>
  );
}