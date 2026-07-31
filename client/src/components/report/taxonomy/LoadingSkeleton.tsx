"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ConceptDetailSkeleton() {
  return (
    <div className="max-w-3xl animate-pulse">
      <div className="flex items-center gap-2 mb-8">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="mb-10">
        <Skeleton className="h-5 w-24 rounded-full mb-4" />
        <Skeleton className="h-10 w-96 mb-3" />
        <Skeleton className="h-5 w-[600px]" />
      </div>

      <div className="space-y-12">
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div>
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-2.5">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-5/6" />
          </div>
        </div>

        <div>
          <Skeleton className="h-6 w-36 mb-4" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>

        <div>
          <Skeleton className="h-6 w-36 mb-4" />
          <div className="space-y-2.5">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>

        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>

        <div>
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>

        <div>
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function TreeSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="px-3 py-4 border-b border-neutral-800">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex-1 py-3 px-2 space-y-1">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <Skeleton className="h-9 w-full rounded-lg" />
            <div className="ml-4 pl-2 py-1 space-y-0.5">
              <Skeleton className="h-8 w-[90%] rounded-md" />
              <Skeleton className="h-8 w-[85%] rounded-md" />
              <Skeleton className="h-8 w-[80%] rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TOCSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="px-4 py-4 border-b border-neutral-800">
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex-1 py-3 px-2 space-y-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-6 w-[80%] rounded-md" />
        ))}
      </div>
    </div>
  )
}
