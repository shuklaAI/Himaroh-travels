import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAdminSession, hasRole } from "@/lib/auth/session";
import { AccessDenied } from "@/components/admin/access-denied";
import { PackageRowActions } from "@/components/admin/package-row-actions";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Packages" };
export const dynamic = "force-dynamic";

export default async function AdminPackagesPage() {
  const admin = await getAdminSession();
  if (!admin || !hasRole(admin.role, ["SUPER_ADMIN", "CONTENT_MANAGER"])) return <AccessDenied />;

  const packages = await prisma.package.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { departures: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-navy">Packages</h1>
        <Button asChild size="sm">
          <Link href="/admin/packages/new">
            <Plus className="h-4 w-4" /> New Package
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
        {packages.length === 0 ? (
          <p className="p-8 text-center text-sm text-navy/50">
            No packages yet. Create your first one to get started.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-navy/40">
              <tr>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Slug</th>
                <th className="px-6 py-3 font-medium">Departures</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Updated</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {packages.map((pkg) => (
                <tr key={pkg.id}>
                  <td className="px-6 py-3 font-medium text-navy">
                    {pkg.title}
                    {pkg.isFeatured && (
                      <span className="ml-2 rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold-DEFAULT">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-navy/60">{pkg.slug}</td>
                  <td className="px-6 py-3 text-navy/60">{pkg._count.departures}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        pkg.isPublished ? "bg-green-100 text-green-700" : "bg-navy/5 text-navy/50"
                      }`}
                    >
                      {pkg.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-navy/50">{formatDate(pkg.updatedAt)}</td>
                  <td className="px-6 py-3">
                    <PackageRowActions packageId={pkg.id} isPublished={pkg.isPublished} />
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
