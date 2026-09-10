import { Skeleton } from "@/components/ui/skeleton";
import { FeaturedTripsSkeleton } from "@/components/skeletons/trip-card-skeleton";

export default function TripsLoading() {
  return (
    <div className="section">
      <div className="mb-10 text-center">
        <Skeleton className="mx-auto mb-3 h-4 w-32" />
        <Skeleton className="mx-auto h-10 w-72" />
      </div>
      <Skeleton className="mb-10 h-16 w-full rounded-2xl" />
      <FeaturedTripsSkeleton />
    </div>
  );
}
