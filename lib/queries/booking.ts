import { prisma } from "@/lib/db";

export async function getDepartureForBooking(departureId: string) {
  const departure = await prisma.departure.findUnique({
    where: { id: departureId },
    include: {
      package: {
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          accommodations: { include: { accommodation: true } },
        },
      },
      pricing: { where: { isActive: true }, orderBy: { price: "asc" } },
    },
  });

  if (!departure) return null;

  const seatsAvailable = Math.max(departure.totalCapacity - departure.bookedSeats, 0);
  const isBookable = departure.status === "OPEN" && seatsAvailable > 0;

  return {
    id: departure.id,
    departureDate: departure.departureDate,
    status: departure.status,
    seatsAvailable,
    isBookable,
    package: {
      id: departure.package.id,
      slug: departure.package.slug,
      title: departure.package.title,
      pickupCity: departure.package.pickupCity,
      pickupPoint: departure.package.pickupPoint,
      coverImage: departure.package.images[0]?.url ?? null,
    },
    pricing: departure.pricing.map((p) => ({ sharingType: p.sharingType, price: Number(p.price) })),
    accommodations: departure.package.accommodations
      .map((pa) => pa.accommodation)
      .filter((a) => a.isActive)
      .map((a) => ({
        id: a.id,
        name: a.name,
        category: a.category,
        priceAdjustment: Number(a.priceAdjustment),
      })),
  };
}

export type DepartureForBooking = NonNullable<Awaited<ReturnType<typeof getDepartureForBooking>>>;
