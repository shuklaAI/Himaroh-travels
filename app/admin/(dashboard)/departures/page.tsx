import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAdminSession, hasRole } from "@/lib/auth/session";
import { AccessDenied } from "@/components/admin/access-denied";
import { DepartureRowActions } from "@/components/admin/departure-row-actions";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Departures" };
export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-green-100 text-green-700",
  CLOSED: "bg-navy/5 text-navy/50",
  SOLD_OUT: "bg-red-100 text-red-700",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-navy/5 text-navy/40",
};

export default async function AdminDeparturesPage() {
  const admin = await getAdminSession();
  if (!admin || !hasRole(admin.role, ["SUPER_ADMIN", "OPERATIONS_ADMIN"])) return <AccessDenied />;

  const departures = await prisma.departure.findMany({
    orderBy: { departureDate: "desc" },
    include: { package: { select: { title: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-navy">Departures</h1>
        <Button asChild size="sm">
          <Link href="/admin/departures/new">
            <Plus className="h-4 w-4" /> New Departure
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
        {departures.length === 0 ? (
          <p className="p-8 text-center text-sm text-navy/50">
            No departures yet. Create one for an existing package.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-navy/40">
              <tr>
                <th className="px-6 py-3 font-medium">Package</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Capacity</th>
                <th className="px-6 py-3 font-medium">Booked</th>
                <th className="px-6 py-3 font-medium">Available</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {departures.map((dep) => (
                <tr key={dep.id}>
                  <td className="px-6 py-3 font-medium text-navy">{dep.package.title}</td>
                  <td className="px-6 py-3 text-navy/70">{formatDate(dep.departureDate)}</td>
                  <td className="px-6 py-3 text-navy/70">{dep.totalCapacity}</td>
                  <td className="px-6 py-3 text-navy/70">{dep.bookedSeats}</td>
                  <td className="px-6 py-3 text-navy/70">{Math.max(dep.totalCapacity - dep.bookedSeats, 0)}</td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[dep.status] ?? ""}`}>
                      {dep.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <DepartureRowActions departureId={dep.id} status={dep.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
