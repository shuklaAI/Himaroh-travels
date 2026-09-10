import { Skeleton } from "@/components/ui/skeleton";

export function TripCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedTripsSkeleton() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <TripCardSkeleton key={i} />
      ))}
    </div>
  );
}
