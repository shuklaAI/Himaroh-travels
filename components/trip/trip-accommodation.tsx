import { BedDouble } from "lucide-react";
import type { PackageDetail } from "@/lib/queries/packages";

export function TripAccommodation({ pkg }: { pkg: PackageDetail }) {
  if (pkg.accommodations.length === 0) return null;

  return (
    <section className="section !py-14">
      <p className="eyebrow mb-3">Where You'll Stay</p>
      <h2 className="mb-8 text-3xl font-semibold text-navy">Accommodation</h2>
      <p className="mb-8 max-w-2xl text-sm text-navy/60">
        Accommodation is provided as shown below, or a similar alternative of the same category,
        subject to availability.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {pkg.accommodations.map((acc) => (
          <div key={acc.id} className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
            <div className="flex h-40 items-center justify-center bg-navy/5">
              {acc.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={acc.images[0]} alt={acc.name} className="h-full w-full object-cover" />
              ) : (
                <BedDouble className="h-10 w-10 text-navy/25" />
              )}
            </div>
            <div className="p-6">
              <span className="eyebrow">{acc.category}</span>
              <h3 className="mt-1 text-lg font-semibold text-navy">{acc.name}</h3>
              {acc.description && (
                <p className="mt-2 text-sm leading-relaxed text-navy/60">{acc.description}</p>
              )}
              {acc.amenities.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {acc.amenities.map((a) => (
                    <span key={a} className="rounded-full bg-ivory px-2.5 py-1 text-[11px] text-navy/60">
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
