import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";

/** Shared route-level loading skeleton used by every app segment. */
export default function RouteLoading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-3 w-80 max-w-full" />
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
