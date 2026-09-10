import { prisma } from "@/lib/db";

export async function getBookingById(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      departure: { include: { package: { select: { title: true, slug: true, pickupCity: true } } } },
      travellers: true,
    },
  });
  if (!booking) return null;

  const finalTotal = Number(booking.finalTotal);
  const amountPaid = Number(booking.amountPaid);

  return {
    id: booking.id,
    bookingRef: booking.bookingRef,
    status: booking.status,
    travellerCount: booking.travellerCount,
    pickupPoint: booking.pickupPoint,
    finalTotal,
    advanceAmount: Number(booking.advanceAmount),
    balanceAmount: Number(booking.balanceAmount),
    amountPaid,
    amountDue: Math.max(finalTotal - amountPaid, 0),
    departureDate: booking.departure.departureDate,
    packageTitle: booking.departure.package.title,
    packageSlug: booking.departure.package.slug,
    travellerNames: booking.travellers.map((t) => t.fullName),
    contactName: booking.customer.fullName,
    contactPhone: booking.customer.phone,
    contactEmail: booking.customer.email,
  };
}

export type BookingSummary = NonNullable<Awaited<ReturnType<typeof getBookingById>>>;
