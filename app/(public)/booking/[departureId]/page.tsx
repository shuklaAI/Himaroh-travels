import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getDepartureForBooking } from "@/lib/queries/booking";
import { BookingFlow } from "@/components/booking/booking-flow";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Book Your Trip" };

export default async function BookingPage({ params }: { params: { departureId: string } }) {
  const departure = await getDepartureForBooking(params.departureId);

  if (!departure) {
    return (
      <div className="section flex min-h-[60vh] flex-col items-center justify-center text-center">
        <AlertTriangle className="mb-6 h-12 w-12 text-navy/25" strokeWidth={1.5} />
        <h1 className="text-2xl font-semibold text-navy">Departure not found</h1>
        <p className="mt-2 max-w-sm text-navy/60">
          This departure may have been removed. Please choose another date from the trip page.
        </p>
        <Button asChild className="mt-6">
          <Link href="/trips">Browse Trips</Link>
        </Button>
      </div>
    );
  }

  if (!departure.isBookable) {
    return (
      <div className="section flex min-h-[60vh] flex-col items-center justify-center text-center">
        <AlertTriangle className="mb-6 h-12 w-12 text-navy/25" strokeWidth={1.5} />
        <h1 className="text-2xl font-semibold text-navy">This departure is sold out</h1>
        <p className="mt-2 max-w-sm text-navy/60">
          All seats for this departure have been booked. Take a look at other upcoming dates for
          this trip.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/trips/${departure.package.slug}`}>View Other Departures</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-navy/10 bg-white py-6">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <p className="eyebrow mb-1">Book Your Seat</p>
          <h1 className="text-2xl font-semibold text-navy">{departure.package.title}</h1>
        </div>
      </div>
      <BookingFlow departure={departure} />
    </div>
  );
}
