import { prisma } from "@/lib/db";

export async function getAdminCustomers(q?: string) {
  const customers = await prisma.customer.findMany({
    where: {
      deletedAt: null,
      ...(q
        ? { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { phone: { contains: q, mode: "insensitive" } }] }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { bookings: true } } },
  });
  return customers.map((c) => ({
    id: c.id,
    fullName: c.fullName,
    phone: c.phone,
    email: c.email,
    bookingCount: c._count.bookings,
    createdAt: c.createdAt,
  }));
}

export async function getAdminCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      bookings: {
        orderBy: { createdAt: "desc" },
        include: { departure: { include: { package: { select: { title: true } } } } },
      },
    },
  });
  if (!customer) return null;
  return {
    ...customer,
    bookings: customer.bookings.map((b) => ({
      id: b.id,
      bookingRef: b.bookingRef,
      packageTitle: b.departure.package.title,
      departureDate: b.departure.departureDate,
      status: b.status,
      finalTotal: Number(b.finalTotal),
      amountPaid: Number(b.amountPaid),
    })),
  };
}
