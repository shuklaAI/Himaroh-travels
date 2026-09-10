import { prisma } from "@/lib/db";
import { getAdminSession, hasRole } from "@/lib/auth/session";
import { AccessDenied } from "@/components/admin/access-denied";
import { DepartureForm } from "@/components/admin/departure-form";

export const metadata = { title: "New Departure" };

export default async function NewDeparturePage() {
  const admin = await getAdminSession();
  if (!admin || !hasRole(admin.role, ["SUPER_ADMIN", "OPERATIONS_ADMIN"])) return <AccessDenied />;

  const packages = await prisma.package.findMany({
    where: { deletedAt: null },
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  if (packages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy/20 bg-white/50 p-16 text-center text-sm text-navy/60">
        Create a package first before adding a departure.
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">New Departure</h1>
      <DepartureForm mode="create" packages={packages} />
    </div>
  );
}
