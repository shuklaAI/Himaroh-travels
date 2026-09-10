import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { TestimonialManager } from "@/components/admin/testimonial-manager";

export default async function AdminTestimonialsPage() {
  const [testimonials, packages] = await Promise.all([
    prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.package.findMany({ where: { deletedAt: null }, select: { id: true, title: true } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Testimonials" description="Only published, real testimonials appear on the public site." />
      <TestimonialManager
        testimonials={testimonials.map((t) => ({
          id: t.id,
          customerName: t.customerName,
          location: t.location ?? "",
          rating: t.rating,
          content: t.content,
          imageUrl: t.imageUrl ?? "",
          packageId: t.packageId ?? "",
          isVerified: t.isVerified,
          isPublished: t.isPublished,
        }))}
        packages={packages}
      />
    </div>
  );
}
