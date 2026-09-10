import { prisma } from "@/lib/db";

export type FeaturedTrip = {
  id: string;
  slug: string;
  title: string;
  durationNights: number;
  durationDays: number;
  difficulty: string | null;
  pickupCity: string | null;
  coverImage: string | null;
  startingPrice: number | null;
  nextDepartureDate: Date | null;
  upcomingDates: Date[];
  seatsAvailable: number | null;
  isSoldOut: boolean;
};

/**
 * Featured trips for the homepage.
 * - Reads only published packages.
 * - "Starting price" = lowest active price across the *next upcoming* departure.
 * - Availability is always derived (totalCapacity - bookedSeats), never stored.
 */
export async function getFeaturedTrips(limit = 3): Promise<FeaturedTrip[]> {
  const packages = await prisma.package.findMany({
    where: { isPublished: true, isFeatured: true, deletedAt: null },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      departures: {
        where: { departureDate: { gte: new Date() }, status: { in: ["OPEN"] } },
        orderBy: { departureDate: "asc" },
        take: 4,
        include: { pricing: { where: { isActive: true } } },
      },
    },
  });

  return packages.map((pkg) => {
    const nextDeparture = pkg.departures[0];
    const prices = nextDeparture?.pricing.map((p) => Number(p.price)) ?? [];
    const seatsAvailable = nextDeparture
      ? Math.max(nextDeparture.totalCapacity - nextDeparture.bookedSeats, 0)
      : null;

    return {
      id: pkg.id,
      slug: pkg.slug,
      title: pkg.title,
      durationNights: pkg.durationNights,
      durationDays: pkg.durationDays,
      difficulty: pkg.difficulty,
      pickupCity: pkg.pickupCity,
      coverImage: pkg.images[0]?.url ?? null,
      startingPrice: prices.length ? Math.min(...prices) : null,
      nextDepartureDate: nextDeparture?.departureDate ?? null,
      upcomingDates: pkg.departures.map((d) => d.departureDate),
      seatsAvailable,
      isSoldOut: nextDeparture ? seatsAvailable === 0 : false,
    };
  });
}

export async function getPublishedTestimonials(limit = 6) {
  return prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// ---------------------------------------------------------------------
// /trips listing
// ---------------------------------------------------------------------

export type TripListFilters = {
  q?: string;
  difficulty?: string;
  maxDuration?: number;
  maxPrice?: number;
};

export async function getPublishedTrips(filters: TripListFilters = {}): Promise<FeaturedTrip[]> {
  const packages = await prisma.package.findMany({
    where: {
      isPublished: true,
      deletedAt: null,
      ...(filters.q
        ? {
            OR: [
              { title: { contains: filters.q, mode: "insensitive" } },
              { region: { contains: filters.q, mode: "insensitive" } },
              { highlights: { has: filters.q } },
            ],
          }
        : {}),
      ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
      ...(filters.maxDuration ? { durationDays: { lte: filters.maxDuration } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      departures: {
        where: { departureDate: { gte: new Date() }, status: { in: ["OPEN"] } },
        orderBy: { departureDate: "asc" },
        take: 4,
        include: { pricing: { where: { isActive: true } } },
      },
    },
  });

  const trips = packages.map((pkg) => {
    const nextDeparture = pkg.departures[0];
    const prices = nextDeparture?.pricing.map((p) => Number(p.price)) ?? [];
    const seatsAvailable = nextDeparture
      ? Math.max(nextDeparture.totalCapacity - nextDeparture.bookedSeats, 0)
      : null;

    return {
      id: pkg.id,
      slug: pkg.slug,
      title: pkg.title,
      durationNights: pkg.durationNights,
      durationDays: pkg.durationDays,
      difficulty: pkg.difficulty,
      pickupCity: pkg.pickupCity,
      coverImage: pkg.images[0]?.url ?? null,
      startingPrice: prices.length ? Math.min(...prices) : null,
      nextDepartureDate: nextDeparture?.departureDate ?? null,
      upcomingDates: pkg.departures.map((d) => d.departureDate),
      seatsAvailable,
      isSoldOut: nextDeparture ? seatsAvailable === 0 : false,
    };
  });

  // Price filtering happens post-query since "starting price" is derived
  // from the next departure's pricing rows, not a column we can index on.
  return filters.maxPrice
    ? trips.filter((t) => t.startingPrice === null || t.startingPrice <= filters.maxPrice!)
    : trips;
}

export async function getDistinctDifficulties(): Promise<string[]> {
  const rows = await prisma.package.findMany({
    where: { isPublished: true, difficulty: { not: null } },
    select: { difficulty: true },
    distinct: ["difficulty"],
  });
  return rows.map((r) => r.difficulty).filter((d): d is string => !!d);
}

// ---------------------------------------------------------------------
// /trips/[slug] detail
// ---------------------------------------------------------------------

export async function getPackageBySlug(slug: string) {
  const pkg = await prisma.package.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
    include: {
      images: { orderBy: { position: "asc" } },
      itineraryDays: { orderBy: { dayNumber: "asc" } },
      inclusions: { orderBy: { position: "asc" } },
      exclusions: { orderBy: { position: "asc" } },
      faqs: { where: { isPublished: true }, orderBy: { position: "asc" } },
      testimonials: { where: { isPublished: true } },
      accommodations: { include: { accommodation: true } },
      departures: {
        where: { departureDate: { gte: new Date() } },
        orderBy: { departureDate: "asc" },
        include: { pricing: { where: { isActive: true }, orderBy: { price: "asc" } } },
      },
    },
  });

  if (!pkg) return null;

  return {
    ...pkg,
    accommodations: pkg.accommodations
      .map((pa) => pa.accommodation)
      .filter((a) => a.isActive),
    departures: pkg.departures.map((dep) => ({
      id: dep.id,
      departureDate: dep.departureDate,
      status: dep.status,
      seatsAvailable: Math.max(dep.totalCapacity - dep.bookedSeats, 0),
      isSoldOut: dep.totalCapacity - dep.bookedSeats <= 0 || dep.status === "SOLD_OUT",
      pricing: dep.pricing.map((p) => ({
        id: p.id,
        sharingType: p.sharingType,
        price: Number(p.price),
      })),
    })),
  };
}

export type PackageDetail = NonNullable<Awaited<ReturnType<typeof getPackageBySlug>>>;
