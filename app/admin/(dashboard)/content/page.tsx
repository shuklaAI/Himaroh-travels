import Link from "next/link";
import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";

export default async function AdminContentPage() {
  const packages = await prisma.package.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { itineraryDays: true, inclusions: true, exclusions: true, faqs: true, images: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader title="Content" description="Manage itinerary, inclusions, exclusions, FAQs and images per package." />

      <div className="grid gap-4 sm:grid-cols-2">
        {packages.map((p) => (
          <Link
            key={p.id}
            href={`/admin/content/${p.id}`}
            className="rounded-2xl border border-navy/10 bg-white p-6 transition-colors hover:border-gold/40"
          >
            <p className="font-display text-lg font-semibold text-navy">{p.title}</p>
            <p className="mt-2 text-xs text-navy/50">
              {p._count.itineraryDays} itinerary days · {p._count.inclusions} inclusions ·{" "}
              {p._count.exclusions} exclusions · {p._count.faqs} FAQs · {p._count.images} images
            </p>
          </Link>
        ))}
        {packages.length === 0 && <p className="text-navy/50">No packages yet — create one first.</p>}
      </div>
    </div>
  );
}
