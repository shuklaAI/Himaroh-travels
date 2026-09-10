import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type BookingListFilters = {
  q?: string;
  status?: string;
  departureId?: string;
  page?: number;
};

const PAGE_SIZE = 20;

export async function getAdminBookings(filters: BookingListFilters) {
  const page = Math.max(filters.page ?? 1, 1);

  const where: Prisma.BookingWhereInput = {
    ...(filters.status ? { status: filters.status as any } : {}),
    ...(filters.departureId ? { departureId: filters.departureId } : {}),
    ...(filters.q
      ? {
          OR: [
            { bookingRef: { contains: filters.q, mode: "insensitive" } },
            { customer: { fullName: { contains: filters.q, mode: "insensitive" } } },
            { customer: { phone: { contains: filters.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        customer: true,
        departure: { include: { package: { select: { title: true } } } },
      },
    }),
  ]);

  return {
    total,
    page,
    pageCount: Math.max(Math.ceil(total / PAGE_SIZE), 1),
    bookings: bookings.map((b) => ({
      id: b.id,
      bookingRef: b.bookingRef,
      customerName: b.customer.fullName,
      customerPhone: b.customer.phone,
      packageTitle: b.departure.package.title,
      departureDate: b.departure.departureDate,
      status: b.status,
      travellerCount: b.travellerCount,
      finalTotal: Number(b.finalTotal),
      amountPaid: Number(b.amountPaid),
      createdAt: b.createdAt,
    })),
  };
}

export async function getAdminBookingById(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      departure: { include: { package: { select: { title: true, slug: true } } } },
      travellers: true,
      payments: { orderBy: { createdAt: "desc" } },
      internalNotes: { orderBy: { createdAt: "desc" }, include: { adminUser: true } },
      coupon: true,
      accommodation: true,
    },
  });
  if (!booking) return null;

  return {
    ...booking,
    finalTotal: Number(booking.finalTotal),
    basePriceTotal: Number(booking.basePriceTotal),
    discountAmount: Number(booking.discountAmount),
    addOnsTotal: Number(booking.addOnsTotal),
    advanceAmount: Number(booking.advanceAmount),
    balanceAmount: Number(booking.balanceAmount),
    amountPaid: Number(booking.amountPaid),
    payments: booking.payments.map((p) => ({ ...p, amount: Number(p.amount) })),
  };
}

export type AdminBookingDetail = NonNullable<Awaited<ReturnType<typeof getAdminBookingById>>>;

/** For the departure filter dropdown on the bookings list. */
export async function getDeparturesForFilter() {
  const departures = await prisma.departure.findMany({
    orderBy: { departureDate: "desc" },
    take: 100,
    include: { package: { select: { title: true } } },
  });
  return departures.map((d) => ({
    id: d.id,
    label: `${d.package.title} — ${new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(d.departureDate)}`,
  }));
}
