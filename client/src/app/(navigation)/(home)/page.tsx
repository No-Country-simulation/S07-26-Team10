import { Suspense } from "react";
import type { Metadata } from "next";
import { getHomeIntrosMap } from "@/features/home/home-queries";
import {
  HomeHero,
  HomeHeroSkeleton,
} from "@/features/home/components/home-hero";
import {
  ExecutiveSummarySection,
  ExecutiveSummarySkeleton,
} from "@/features/home/components/executive-summary";

export const metadata: Metadata = {
  title: "PhysaFlow Report | Stranded Capacity Report",
  description:
    "Official research insight report on AI infrastructure bottleneck and stranded capacity in modern data centers.",
};

async function HomeContainer() {
  const reportsMap = await getHomeIntrosMap();
  return (
    <>
      <HomeHero reportsMap={reportsMap} />
      <ExecutiveSummarySection reportsMap={reportsMap} />
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <>
          <HomeHeroSkeleton />
          <ExecutiveSummarySkeleton />
        </>
      }
    >
      <HomeContainer />
    </Suspense>
  );
}
