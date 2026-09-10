import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Calendar, TrendingUp } from "lucide-react";
import { formatINR } from "@/lib/utils";
import type { FeaturedTrip } from "@/lib/queries/packages";

export function TripCard({ trip }: { trip: FeaturedTrip }) {
  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group block overflow-hidden rounded-2xl border border-navy/10 bg-white transition-shadow hover:shadow-xl"
    >
      <div className="relative h-52 w-full overflow-hidden bg-navy/5">
        {trip.coverImage ? (
          <Image
            src={trip.coverImage}
            alt={trip.title}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-navy/20">
            <TrendingUp className="h-10 w-10" />
          </div>
        )}
        {trip.isSoldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-ivory">
            Sold Out
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between text-xs text-navy/60">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-gold" />
            {trip.pickupCity ?? "Delhi"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-gold" />
            {trip.durationNights}N-{trip.durationDays}D
          </span>
        </div>

        <h3 className="mt-2 text-base font-bold uppercase tracking-tight text-navy">{trip.title}</h3>

        <p className="mt-2 text-sm text-navy/50">
          Starts at{" "}
          {trip.startingPrice ? (
            <span className="font-bold text-navy">{formatINR(trip.startingPrice)}/-</span>
          ) : (
            <span className="text-navy/40">Contact us</span>
          )}
        </p>

        {trip.upcomingDates.length > 0 && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-navy/50">
            <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
            <span>
              {trip.upcomingDates
                .map((d) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(d))
                .join(", ")}
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}
