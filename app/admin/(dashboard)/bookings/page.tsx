import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { BookingFilters } from "@/components/admin/booking-filters";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { getAdminBookings, getDeparturesForFilter } from "@/lib/queries/admin-bookings";
import { formatDate, formatINR } from "@/lib/utils";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; departureId?: string; page?: string };
}) {
  const [data, departures] = await Promise.all([
    getAdminBookings({
      q: searchParams.q,
      status: searchParams.status,
      departureId: searchParams.departureId,
      page: searchParams.page ? Number(searchParams.page) : 1,
    }),
    getDeparturesForFilter(),
  ]);

  return (
    <div>
      <AdminPageHeader title="Bookings" description={`${data.total} total booking(s)`} />

      <div className="mb-4 flex items-center justify-between gap-4">
        <BookingFilters departures={departures} />
        <ExportCsvButton filename="himaroh-bookings.csv" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-navy/[0.03] text-xs uppercase tracking-wide text-navy/50">
              <tr>
                <th className="px-5 py-3 font-medium">Ref</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Trip</th>
                <th className="px-5 py-3 font-medium">Departure</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {data.bookings.map((b) => (
                <tr key={b.id} className="hover:bg-navy/[0.02]">
                  <td className="px-5 py-3">
                    <Link href={`/admin/bookings/${b.id}`} className="font-medium text-navy hover:text-gold">
                      {b.bookingRef}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-navy/70">
                    {b.customerName}
                    <div className="text-xs text-navy/40">{b.customerPhone}</div>
                  </td>
                  <td className="px-5 py-3 text-navy/70">{b.packageTitle}</td>
                  <td className="px-5 py-3 text-navy/70">{formatDate(b.departureDate, { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-5 py-3 text-navy/70">{formatINR(b.finalTotal)}</td>
                  <td className="px-5 py-3 text-navy/70">{formatINR(b.amountPaid)}</td>
                </tr>
              ))}
              {data.bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-navy/50">
                    No bookings match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data.pageCount > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: data.pageCount }).map((_, i) => (
            <Link
              key={i}
              href={`/admin/bookings?page=${i + 1}`}
              className={`h-8 w-8 rounded-full text-center text-xs leading-8 ${
                data.page === i + 1 ? "bg-navy text-ivory" : "text-navy/50 hover:bg-navy/5"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
