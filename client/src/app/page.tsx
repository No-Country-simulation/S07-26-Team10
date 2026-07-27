import { Suspense } from "react";
import { HomeCard, HomeCardSkeleton } from "@/features/home/components/home-card";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-background p-4 sm:p-8 font-sans">
      <main className="w-full max-w-2xl">
        <Suspense fallback={<HomeCardSkeleton />}>
          <HomeCard />
        </Suspense>
      </main>
    </div>
  );
}
