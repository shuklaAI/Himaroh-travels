import Link from "next/link";
import { CalendarX2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate } from "@/lib/utils";
import type { PackageDetail } from "@/lib/queries/packages";

const SHARING_LABEL: Record<string, string> = {
  QUAD: "Quad Sharing",
  TRIPLE: "Triple Sharing",
  DOUBLE: "Double Sharing",
  SINGLE: "Single Occupancy",
  CHILD: "Child",
};

export function UpcomingDepartures({ pkg }: { pkg: PackageDetail }) {
  // Section 24: query already excludes past departures (departureDate >= now);
  // this is enforced at the query layer, not just hidden client-side.
  const departures = pkg.departures;

  return (
    <section id="departures" className="section !py-14">
      <p className="eyebrow mb-3">Reserve Your Seat</p>
      <h2 className="mb-8 text-3xl font-semibold text-navy">Upcoming Departures</h2>

      {departures.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy/20 bg-white/50 p-16 text-center">
          <CalendarX2 className="mx-auto mb-4 h-10 w-10 text-navy/30" strokeWidth={1.5} />
          <p className="text-navy/60">
            No upcoming departures are scheduled for this trip right now. Message us on WhatsApp
            and we'll let you know as soon as new dates open.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-navy/[0.03] text-xs uppercase tracking-wide text-navy/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Departure Date</th>
                  {departures[0].pricing.map((p) => (
                    <th key={p.sharingType} className="px-6 py-4 font-medium">
                      {SHARING_LABEL[p.sharingType] ?? p.sharingType}
                    </th>
                  ))}
                  <th className="px-6 py-4 font-medium">Seats</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/5">
                {departures.map((dep) => (
                  <tr key={dep.id} className="align-middle">
                    <td className="px-6 py-4 font-medium text-navy">
                      {formatDate(dep.departureDate, { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    {dep.pricing.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-navy/70">
                        {formatINR(p.price)}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      {dep.isSoldOut ? (
                        <span className="rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy/50">
                          Sold Out
                        </span>
                      ) : (
                        <span className="text-navy/70">{dep.seatsAvailable} left</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Button asChild size="sm" disabled={dep.isSoldOut}>
                        <Link href={dep.isSoldOut ? "#" : `/booking/${dep.id}`}>
                          {dep.isSoldOut ? "Sold Out" : "Book Now"}
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
