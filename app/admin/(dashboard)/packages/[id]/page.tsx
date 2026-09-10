import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminSession, hasRole } from "@/lib/auth/session";
import { AccessDenied } from "@/components/admin/access-denied";
import { PackageForm } from "@/components/admin/package-form";

export const metadata = { title: "Edit Package" };

export default async function EditPackagePage({ params }: { params: { id: string } }) {
  const admin = await getAdminSession();
  if (!admin || !hasRole(admin.role, ["SUPER_ADMIN", "CONTENT_MANAGER"])) return <AccessDenied />;

  const pkg = await prisma.package.findUnique({ where: { id: params.id } });
  if (!pkg) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy">Edit Package</h1>
      <PackageForm
        mode="edit"
        packageId={pkg.id}
        initial={{
          title: pkg.title,
          slug: pkg.slug,
          subtitle: pkg.subtitle ?? "",
          region: pkg.region ?? "",
          country: pkg.country,
          durationNights: pkg.durationNights,
          durationDays: pkg.durationDays,
          difficulty: pkg.difficulty ?? "",
          altitudeFt: pkg.altitudeFt,
          distanceKm: pkg.distanceKm,
          pickupCity: pkg.pickupCity ?? "",
          pickupPoint: pkg.pickupPoint ?? "",
          overview: pkg.overview ?? "",
          highlights: pkg.highlights.join(", "),
          isPublished: pkg.isPublished,
          isFeatured: pkg.isFeatured,
          metaTitle: pkg.metaTitle ?? "",
          metaDescription: pkg.metaDescription ?? "",
        }}
      />
    </div>
  );
}
