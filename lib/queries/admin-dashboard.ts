import { prisma } from "@/lib/db";

export async function getDashboardStats() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalBookings,
    todayBookings,
    upcomingDepartures,
    confirmedBookings,
    cancelledBookings,
    pendingPayments,
    newEnquiries,
    revenueAgg,
    openDepartures,
    recentBookings,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.departure.count({ where: { departureDate: { gte: new Date() } } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
    prisma.booking.count({ where: { status: { in: ["PAYMENT_PENDING", "PARTIALLY_PAID"] } } }),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.booking.aggregate({ _sum: { amountPaid: true } }),
    prisma.departure.findMany({
      where: { status: "OPEN" },
      select: { totalCapacity: true, bookedSeats: true },
    }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true, departure: { include: { package: { select: { title: true } } } } },
    }),
  ]);

  const availableSeats = openDepartures.reduce(
    (sum, d) => sum + Math.max(d.totalCapacity - d.bookedSeats, 0),
    0
  );

  return {
    totalBookings,
    todayBookings,
    upcomingDepartures,
    confirmedBookings,
    cancelledBookings,
    pendingPayments,
    newEnquiries,
    totalRevenue: Number(revenueAgg._sum.amountPaid ?? 0),
    availableSeats,
    recentBookings: recentBookings.map((b) => ({
      id: b.id,
      bookingRef: b.bookingRef,
      customerName: b.customer.fullName,
      packageTitle: b.departure.package.title,
      status: b.status,
      finalTotal: Number(b.finalTotal),
      createdAt: b.createdAt,
    })),
  };
}
