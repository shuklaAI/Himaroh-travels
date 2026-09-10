import Link from "next/link";
import { getFeaturedTrips } from "@/lib/queries/packages";
import { TripCard } from "@/components/home/trip-card";
import { Button } from "@/components/ui/button";

export async function FeaturedTrips() {
  const trips = await getFeaturedTrips(4);

  return (
    <section className="section">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-navy sm:text-4xl">Upcoming Trips</h2>
          <div className="heading-bar" />
        </div>
        <Button asChild size="sm">
          <Link href="/trips">View All</Link>
        </Button>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy/20 bg-white/50 p-16 text-center">
          <p className="text-navy/60">
            New departures are being added. Check back shortly, or contact us directly to plan
            your trip.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </section>
  );
}
