import Link from "next/link";
import { CalendarDays, Mountain, MapPin, Gauge, Milestone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import type { PackageDetail } from "@/lib/queries/packages";

export function TripHero({ pkg }: { pkg: PackageDetail }) {
  const cover = pkg.images[0]?.url;
  const nextDeparture = pkg.departures[0];
  const startingPrice = nextDeparture
    ? Math.min(...nextDeparture.pricing.map((p) => p.price))
    : null;

  const facts = [
    { icon: Gauge, label: pkg.difficulty ?? "—" },
    { icon: Mountain, label: pkg.altitudeFt ? `${pkg.altitudeFt.toLocaleString("en-IN")} ft` : null },
    { icon: Milestone, label: pkg.distanceKm ? `${pkg.distanceKm} km` : null },
    { icon: MapPin, label: pkg.pickupCity ? `${pkg.pickupCity} Pickup & Drop` : null },
  ].filter((f) => f.label);

  return (
    <section className="relative flex min-h-[70vh] items-end bg-navy">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${cover ?? "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2400&auto=format&fit=crop"}')`,
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-navy/20" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-14 sm:px-8 lg:px-10">
        <p className="eyebrow mb-3">
          {pkg.durationNights} Nights / {pkg.durationDays} Days
        </p>
        <h1 className="max-w-2xl text-4xl font-bold text-ivory sm:text-5xl">{pkg.title}</h1>
        {pkg.subtitle && <p className="mt-3 max-w-xl text-ivory/70">{pkg.subtitle}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          {facts.map((f, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 rounded-full bg-ivory/10 px-3 py-1.5 text-xs font-medium text-ivory/85"
            >
              <f.icon className="h-3.5 w-3.5 text-gold" /> {f.label}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-6">
          <div>
            {startingPrice ? (
              <>
                <span className="text-xs text-ivory/50">Starting from</span>
                <p className="font-display text-3xl font-semibold text-gold">
                  {formatINR(startingPrice)}
                </p>
              </>
            ) : (
              <span className="text-sm text-ivory/50">Pricing coming soon</span>
            )}
          </div>
          <Button asChild size="lg" disabled={!nextDeparture}>
            <Link href="#departures">
              <CalendarDays className="h-4 w-4" />
              Book Your Seat
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
