import Link from "next/link";
import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatDate } from "@/lib/utils";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { usages: true } } },
  });

  return (
    <div>
      <AdminPageHeader title="Coupons" actionLabel="Create Coupon" actionHref="/admin/coupons/new" />

      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/[0.03] text-xs uppercase tracking-wide text-navy/50">
            <tr>
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Discount</th>
              <th className="px-5 py-3 font-medium">Valid</th>
              <th className="px-5 py-3 font-medium">Used</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-navy/[0.02]">
                <td className="px-5 py-3 font-mono font-medium text-navy">{c.code}</td>
                <td className="px-5 py-3 text-navy/70">
                  {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                </td>
                <td className="px-5 py-3 text-navy/70">
                  {formatDate(c.startDate, { day: "numeric", month: "short" })} – {formatDate(c.expiryDate, { day: "numeric", month: "short" })}
                </td>
                <td className="px-5 py-3 text-navy/70">
                  {c._count.usages}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${c.isActive ? "bg-green-50 text-green-700" : "bg-navy/5 text-navy/50"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/admin/coupons/${c.id}`} className="text-sm font-medium text-navy hover:text-gold">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-navy/50">
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
