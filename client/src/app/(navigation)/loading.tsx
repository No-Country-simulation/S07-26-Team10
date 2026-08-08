import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="phi w-full max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-6 font-sans">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}