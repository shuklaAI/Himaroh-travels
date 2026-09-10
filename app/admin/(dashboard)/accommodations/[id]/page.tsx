import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AccommodationForm } from "@/components/admin/accommodation-form";
import { DeleteAccommodationButton } from "@/components/admin/delete-accommodation-button";

export default async function EditAccommodationPage({ params }: { params: { id: string } }) {
  const [accommodation, packages] = await Promise.all([
    prisma.accommodation.findUnique({ where: { id: params.id }, include: { packages: true } }),
    prisma.package.findMany({ where: { deletedAt: null }, select: { id: true, title: true } }),
  ]);
  if (!accommodation) notFound();

  return (
    <div>
      <AdminPageHeader title={`Edit — ${accommodation.name}`} />
      <AccommodationForm
        packages={packages}
        initial={{
          id: accommodation.id,
          name: accommodation.name,
          category: accommodation.category,
          description: accommodation.description ?? "",
          location: accommodation.location ?? "",
          images: accommodation.images.join(", "),
          amenities: accommodation.amenities.join(", "),
          capacity: accommodation.capacity ?? undefined,
          availableUnits: accommodation.availableUnits ?? undefined,
          isActive: accommodation.isActive,
          priceAdjustment: Number(accommodation.priceAdjustment),
          packageIds: accommodation.packages.map((p) => p.packageId),
        }}
      />
      <div className="mt-6 max-w-2xl border-t border-navy/10 pt-6">
        <DeleteAccommodationButton id={accommodation.id} />
      </div>
    </div>
  );
}
