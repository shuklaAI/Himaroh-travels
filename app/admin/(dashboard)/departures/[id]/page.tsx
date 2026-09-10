import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminSession, hasRole } from "@/lib/auth/session";
import { AccessDenied } from "@/components/admin/access-denied";
import { DepartureForm } from "@/components/admin/departure-form";

export const metadata = { title: "Edit Departure" };

function toLocalInputValue(date: Date): string {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default async function EditDeparturePage({ params }: { params: { id: string } }) {
  const admin = await getAdminSession();
  if (!admin || !hasRole(admin.role, ["SUPER_ADMIN", "OPERATIONS_ADMIN"])) return <AccessDenied />;

  const [departure, packages] = await Promise.all([
    prisma.departure.findUnique({ where: { id: params.id }, include: { pricing: { where: { isActive: true } } } }),
    prisma.package.findMany({ where: { deletedAt: null }, orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);

  if (!departure) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">Edit Departure</h1>
      <DepartureForm
        mode="edit"
        departureId={departure.id}
        packages={packages}
        bookedSeats={departure.bookedSeats}
        initial={{
          packageId: departure.packageId,
          departureDate: toLocalInputValue(departure.departureDate),
          totalCapacity: departure.totalCapacity,
          notes: departure.notes ?? "",
          status: departure.status,
          pricing: departure.pricing.map((p) => ({ sharingType: p.sharingType, price: Number(p.price) })),
        }}
      />
    </div>
  );
}
