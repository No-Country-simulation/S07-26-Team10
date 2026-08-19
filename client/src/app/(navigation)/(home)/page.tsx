import type { Metadata } from "next";
import { HomeHero } from "@/features/home/components/home-hero";
import { HomeSupporters } from "@/features/home/components/home-supporters";
import { HomeSectionProblem } from "@/features/home/components/home-section-problem";
import { HomeSectionChapters } from "@/features/home/components/home-section-chapters";
import { HomeBanner } from "@/features/home/components/home-banner";
import { HomeFunnel } from "@/features/home/components/home-funnel";
import { HomeContinueReading } from "@/features/home/components/home-continue-reading";
import { DownloadReportButtonServer } from "@/features/report-download/components/download-report-button-server";

export const metadata: Metadata = {
  title: "PhysaFlow | Stranded Capacity Index",
  description:
    "Stranded Capacity Index — installed, energized and paid for, yet unable to do work.",
};

export default function Home() {
  return (
    <>
      <HomeContinueReading />
      <HomeHero downloadButton={<DownloadReportButtonServer />} />
      <HomeSupporters />
      <HomeSectionProblem />
      <HomeSectionChapters />
      <HomeBanner />
      <HomeFunnel />
    </>
  );
}
