import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSearchBox } from "@/components/admin/search-box";
import { getAdminCustomers } from "@/lib/queries/admin-customers";
import { formatDate } from "@/lib/utils";

export default async function AdminCustomersPage({ searchParams }: { searchParams: { q?: string } }) {
  const customers = await getAdminCustomers(searchParams.q);

  return (
    <div>
      <AdminPageHeader title="Customers" description={`${customers.length} customer(s)`} />
      <div className="mb-4">
        <AdminSearchBox placeholder="Search by name or phone…" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/[0.03] text-xs uppercase tracking-wide text-navy/50">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Bookings</th>
              <th className="px-5 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-navy/[0.02]">
                <td className="px-5 py-3">
                  <Link href={`/admin/customers/${c.id}`} className="font-medium text-navy hover:text-gold">
                    {c.fullName}
                  </Link>
                </td>
                <td className="px-5 py-3 text-navy/70">{c.phone}</td>
                <td className="px-5 py-3 text-navy/70">{c.email ?? "—"}</td>
                <td className="px-5 py-3 text-navy/70">{c.bookingCount}</td>
                <td className="px-5 py-3 text-navy/70">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-navy/50">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
