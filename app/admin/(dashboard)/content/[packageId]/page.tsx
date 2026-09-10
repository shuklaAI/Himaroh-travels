import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { ItineraryEditor } from "@/components/admin/itinerary-editor";
import { ListEditor } from "@/components/admin/list-editor";
import { FaqEditor } from "@/components/admin/faq-editor";
import { PackageImageEditor } from "@/components/admin/package-image-editor";
import { addInclusionAction, deleteInclusionAction, addExclusionAction, deleteExclusionAction } from "@/app/admin/(dashboard)/content/[packageId]/actions";

export default async function AdminContentEditorPage({ params }: { params: { packageId: string } }) {
  const pkg = await prisma.package.findUnique({
    where: { id: params.packageId },
    include: {
      itineraryDays: { orderBy: { position: "asc" } },
      inclusions: { orderBy: { position: "asc" } },
      exclusions: { orderBy: { position: "asc" } },
      faqs: { orderBy: { position: "asc" } },
      images: { orderBy: { position: "asc" } },
    },
  });
  if (!pkg) notFound();

  return (
    <div>
      <AdminPageHeader title={pkg.title} description="Manage this package's content" />

      <AdminTabs
        tabs={[
          {
            label: `Itinerary (${pkg.itineraryDays.length})`,
            content: <ItineraryEditor packageId={pkg.id} slug={pkg.slug} days={pkg.itineraryDays} />,
          },
          {
            label: `Inclusions (${pkg.inclusions.length})`,
            content: (
              <ListEditor
                items={pkg.inclusions}
                placeholder="e.g. 2 breakfasts, 2 dinners"
                onAdd={(label) => addInclusionAction(pkg.id, label, pkg.slug)}
                onDelete={(id) => deleteInclusionAction(id, pkg.slug)}
              />
            ),
          },
          {
            label: `Exclusions (${pkg.exclusions.length})`,
            content: (
              <ListEditor
                items={pkg.exclusions}
                placeholder="e.g. Personal trekking gear"
                onAdd={(label) => addExclusionAction(pkg.id, label, pkg.slug)}
                onDelete={(id) => deleteExclusionAction(id, pkg.slug)}
              />
            ),
          },
          {
            label: `FAQs (${pkg.faqs.length})`,
            content: <FaqEditor packageId={pkg.id} slug={pkg.slug} faqs={pkg.faqs} />,
          },
          {
            label: `Images (${pkg.images.length})`,
            content: <PackageImageEditor packageId={pkg.id} slug={pkg.slug} images={pkg.images} />,
          },
        ]}
      />
    </div>
  );
}
