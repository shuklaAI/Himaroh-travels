import { prisma } from "@/lib/db";
import { ItineraryTimeline } from "@/components/home/itinerary-timeline";

export async function ItineraryPreview() {
  const pkg = await prisma.package.findUnique({
    where: { slug: "tungnath-chandrashila" },
    include: { itineraryDays: { orderBy: { dayNumber: "asc" } } },
  });

  if (!pkg || pkg.itineraryDays.length === 0) return null;

  return (
    <section className="section">
      <div className="mb-14 text-center">
        <h2 className="text-3xl font-bold text-navy sm:text-4xl">A Preview of the Journey</h2>
        <div className="heading-bar-center" />
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
