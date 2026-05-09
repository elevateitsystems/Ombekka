import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function GameLoading() {
  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Top Navigation Bar Skeleton */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center text-slate-300 gap-2 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Research</span>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-32 rounded-lg" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header Section Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>

        {/* Player Comparison Card Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>

        {/* Match Result Banner Skeleton */}
        <Skeleton className="h-32 w-full rounded-2xl" />

        {/* Detailed Breakdown Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </main>
    </div>
  );
}
