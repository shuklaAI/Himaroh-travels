import { notFound } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminCustomerById } from "@/lib/queries/admin-customers";
import { formatDate, formatINR } from "@/lib/utils";

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getAdminCustomerById(params.id);
  if (!customer) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy">{customer.fullName}</h1>
      <p className="mt-1 text-sm text-navy/60">
        {customer.phone} {customer.email && `· ${customer.email}`} · Customer since {formatDate(customer.createdAt)}
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-navy/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/[0.03] text-xs uppercase tracking-wide text-navy/50">
            <tr>
              <th className="px-5 py-3 font-medium">Ref</th>
              <th className="px-5 py-3 font-medium">Trip</th>
              <th className="px-5 py-3 font-medium">Departure</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {customer.bookings.map((b) => (
              <tr key={b.id} className="hover:bg-navy/[0.02]">
                <td className="px-5 py-3">
                  <Link href={`/admin/bookings/${b.id}`} className="font-medium text-navy hover:text-gold">
                    {b.bookingRef}
                  </Link>
                </td>
                <td className="px-5 py-3 text-navy/70">{b.packageTitle}</td>
                <td className="px-5 py-3 text-navy/70">{formatDate(b.departureDate)}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={b.status} />
                </td>
                <td className="px-5 py-3 text-navy/70">{formatINR(b.finalTotal)}</td>
                <td className="px-5 py-3 text-navy/70">{formatINR(b.amountPaid)}</td>
              </tr>
            ))}
            {customer.bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-navy/50">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
