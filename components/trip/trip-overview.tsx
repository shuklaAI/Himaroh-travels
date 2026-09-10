import { Check } from "lucide-react";
import type { PackageDetail } from "@/lib/queries/packages";

export function TripOverview({ pkg }: { pkg: PackageDetail }) {
  if (!pkg.overview && pkg.highlights.length === 0) return null;

  return (
    <section className="section grid gap-12 !py-14 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <p className="eyebrow mb-3">Overview</p>
        {pkg.overview && <p className="leading-relaxed text-navy/70">{pkg.overview}</p>}
      </div>

      {pkg.highlights.length > 0 && (
        <div>
          <p className="eyebrow mb-3">Trip Highlights</p>
          <ul className="space-y-2.5">
            {pkg.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm text-navy/75">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
