import { Check, X } from "lucide-react";
import type { PackageDetail } from "@/lib/queries/packages";

export function TripInclusions({ pkg }: { pkg: PackageDetail }) {
  if (pkg.inclusions.length === 0 && pkg.exclusions.length === 0) return null;

  return (
    <section className="section !py-14 grid gap-10 sm:grid-cols-2">
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-navy">
          <Check className="h-5 w-5 text-gold" /> Inclusions
        </h3>
        <ul className="space-y-2.5">
          {pkg.inclusions.map((inc) => (
            <li key={inc.id} className="flex items-start gap-2 text-sm text-navy/70">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {inc.label}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-navy">
          <X className="h-5 w-5 text-navy/40" /> Exclusions
        </h3>
        <ul className="space-y-2.5">
          {pkg.exclusions.map((exc) => (
            <li key={exc.id} className="flex items-start gap-2 text-sm text-navy/60">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-navy/30" />
              {exc.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
