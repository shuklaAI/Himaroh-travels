import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { GalleryManager } from "@/components/admin/gallery-manager";

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: { position: "asc" } });

  return (
    <div>
      <AdminPageHeader title="Gallery" description="Site-wide images shown on the public Gallery page." />
      <GalleryManager images={images} />
    </div>
  );
}
