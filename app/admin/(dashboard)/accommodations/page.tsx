import Link from "next/link";
import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatINR } from "@/lib/utils";

export default async function AdminAccommodationsPage() {
  const accommodations = await prisma.accommodation.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { packages: true } } },
  });

  return (
    <div>
      <AdminPageHeader title="Accommodations" actionLabel="Add Accommodation" actionHref="/admin/accommodations/new" />

      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/[0.03] text-xs uppercase tracking-wide text-navy/50">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Linked Packages</th>
              <th className="px-5 py-3 font-medium">Price Adj.</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {accommodations.map((a) => (
              <tr key={a.id} className="hover:bg-navy/[0.02]">
                <td className="px-5 py-3 font-medium text-navy">{a.name}</td>
                <td className="px-5 py-3 text-navy/70">{a.category}</td>
                <td className="px-5 py-3 text-navy/70">{a._count.packages}</td>
                <td className="px-5 py-3 text-navy/70">{formatINR(Number(a.priceAdjustment))}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${a.isActive ? "bg-green-50 text-green-700" : "bg-navy/5 text-navy/50"}`}>
                    {a.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/admin/accommodations/${a.id}`} className="text-sm font-medium text-navy hover:text-gold">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {accommodations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-navy/50">
                  No accommodations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
