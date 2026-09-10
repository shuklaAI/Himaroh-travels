import { getPublishedTrips, type TripListFilters } from "@/lib/queries/packages";
import { TripCard } from "@/components/home/trip-card";
import { Compass } from "lucide-react";

export async function TripResults({ filters }: { filters: TripListFilters }) {
  const trips = await getPublishedTrips(filters);

  if (trips.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy/20 bg-white/50 p-16 text-center">
        <Compass className="mx-auto mb-4 h-10 w-10 text-navy/30" strokeWidth={1.5} />
        <p className="text-navy/60">
          No trips match those filters right now. Try widening your search, or{" "}
          <a href="/contact" className="font-medium text-gold underline underline-offset-2">
            contact us
          </a>{" "}
          and we'll help you plan something.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
