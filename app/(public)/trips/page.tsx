import { Suspense } from "react";
import type { Metadata } from "next";
import { TripFilters } from "@/components/trips/trip-filters";
import { TripResults } from "@/components/trips/trip-results";
import { FeaturedTripsSkeleton } from "@/components/skeletons/trip-card-skeleton";
import { getDistinctDifficulties } from "@/lib/queries/packages";

export const metadata: Metadata = {
  title: "All Trips",
  description: "Browse curated Himalayan treks and journeys from Himaroh Travels, with Delhi pickup and drop.",
};

export const revalidate = 60;

export default async function TripsPage({
  searchParams,
}: {
  searchParams: { q?: string; difficulty?: string; maxDuration?: string; maxPrice?: string };
}) {
  const difficulties = await getDistinctDifficulties();

  const filters = {
    q: searchParams.q,
    difficulty: searchParams.difficulty,
    maxDuration: searchParams.maxDuration ? Number(searchParams.maxDuration) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
  };

  return (
    <div>
      <section
        className="relative flex h-[40vh] min-h-[280px] items-center justify-center bg-cover bg-center text-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2000&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-navy/55" />
        <div className="relative z-10 px-6">
          <h1 className="text-4xl font-bold text-ivory sm:text-5xl">All Trips</h1>
          <p className="mt-3 text-ivory/80">Himaroh Travels is a way for your happiness</p>
        </div>
      </section>

      <div className="section">
        <TripFilters difficulties={difficulties} />

        <Suspense fallback={<FeaturedTripsSkeleton />} key={JSON.stringify(filters)}>
          <TripResults filters={filters} />
        </Suspense>
      </div>
    </div>
  );
}
