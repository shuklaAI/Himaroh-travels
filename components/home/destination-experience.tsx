import Link from "next/link";

const DESTINATIONS = [
  { name: "Tungnath", img: "photo-1626621341517-bbf3d9990a23" },
  { name: "Chandrashila", img: "photo-1544198365-f5d60b6d8190" },
  { name: "Deoria Tal", img: "photo-1506905925346-21bda4d32df4" },
  { name: "Devprayag", img: "photo-1591123120675-6f7f1aae0e5b" },
  { name: "Dhari Devi", img: "photo-1609766857041-ed402ea8069a" },
  { name: "Omkareshwar", img: "photo-1609766857041-ed402ea8069a" },
];

export function DestinationExperience() {
  return (
    <section className="section !pb-10">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-navy sm:text-4xl">Exclusive Destinations</h2>
        <div className="heading-bar-center" />
      </div>

      <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
        {DESTINATIONS.map((dest) => (
          <Link
            key={dest.name}
            href={`/trips/tungnath-chandrashila#${dest.name.toLowerCase().replace(/\s+/g, "-")}`}
            className="group flex flex-col items-center gap-3"
          >
            <div
              className="h-28 w-28 rounded-2xl bg-cover bg-center shadow-md transition-transform group-hover:scale-105 sm:h-32 sm:w-32"
              style={{ backgroundImage: `url(https://images.unsplash.com/${dest.img}?q=80&w=400&auto=format&fit=crop)` }}
            />
            <span className="text-xs font-bold uppercase tracking-wide text-navy/80">{dest.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
