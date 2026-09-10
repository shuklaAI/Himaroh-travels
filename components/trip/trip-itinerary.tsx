import { ItineraryTimeline } from "@/components/home/itinerary-timeline";
import type { PackageDetail } from "@/lib/queries/packages";

export function TripItinerary({ pkg }: { pkg: PackageDetail }) {
  if (pkg.itineraryDays.length === 0) return null;

  return (
    <section className="section !py-14">
      <div className="mb-10 text-center">
        <p className="eyebrow mb-3">Day by Day</p>
        <h2 className="text-3xl font-semibold text-navy">Itinerary</h2>
      </div>
      <ItineraryTimeline
        days={pkg.itineraryDays.map((d) => ({
          dayNumber: d.dayNumber,
          title: d.title,
          description: d.description,
        }))}
      />
    </section>
  );
}
