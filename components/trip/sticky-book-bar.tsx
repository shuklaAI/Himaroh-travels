import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import type { PackageDetail } from "@/lib/queries/packages";

export function StickyBookBar({ pkg }: { pkg: PackageDetail }) {
  const nextDeparture = pkg.departures[0];
  const startingPrice = nextDeparture
    ? Math.min(...nextDeparture.pricing.map((p) => p.price))
    : null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-white/95 px-6 py-3 backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          {startingPrice ? (
            <>
              <span className="text-[10px] text-navy/50">From</span>
              <p className="font-semibold text-navy">{formatINR(startingPrice)}</p>
            </>
          ) : (
            <span className="text-xs text-navy/50">Contact for pricing</span>
          )}
        </div>
        <Button asChild size="default" className="flex-1" disabled={!nextDeparture}>
          <Link href="#departures">Book Your Seat</Link>
        </Button>
      </div>
    </div>
  );
}
