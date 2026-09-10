import { Skeleton } from "@/components/ui/skeleton";
import { FeaturedTripsSkeleton } from "@/components/skeletons/trip-card-skeleton";

export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10">
      <Skeleton className="mb-4 h-4 w-40" />
      <Skeleton className="mb-6 h-12 w-2/3" />
      <Skeleton className="mb-10 h-4 w-1/2" />
      <FeaturedTripsSkeleton />
    </div>
  );
}
