import type { PackageDetail } from "@/lib/queries/packages";

export function TripGallery({ pkg }: { pkg: PackageDetail }) {
  if (pkg.images.length < 2) return null;

  return (
    <section className="section !py-14">
      <p className="eyebrow mb-3">Gallery</p>
      <h2 className="mb-8 text-3xl font-semibold text-navy">A Glimpse of the Journey</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {pkg.images.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.id}
            src={img.url}
            alt={img.altText ?? pkg.title}
            loading="lazy"
            className="aspect-square w-full rounded-xl object-cover"
          />
        ))}
      </div>
    </section>
  );
}
