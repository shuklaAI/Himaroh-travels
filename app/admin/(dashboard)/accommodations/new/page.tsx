import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AccommodationForm } from "@/components/admin/accommodation-form";

export default async function NewAccommodationPage() {
  const packages = await prisma.package.findMany({ where: { deletedAt: null }, select: { id: true, title: true } });
  return (
    <div>
      <AdminPageHeader title="Add Accommodation" />
      <AccommodationForm packages={packages} />
    </div>
  );
}
