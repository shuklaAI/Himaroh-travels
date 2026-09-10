import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPackageBySlug } from "@/lib/queries/packages";
import { TripHero } from "@/components/trip/trip-hero";
import { TripOverview } from "@/components/trip/trip-overview";
import { TripItinerary } from "@/components/trip/trip-itinerary";
import { TripInclusions } from "@/components/trip/trip-inclusions";
import { TripAccommodation } from "@/components/trip/trip-accommodation";
import { UpcomingDepartures } from "@/components/trip/upcoming-departures";
import { TripGallery } from "@/components/trip/trip-gallery";
import { TripFAQ } from "@/components/trip/trip-faq";
import { TripPolicyNote } from "@/components/trip/trip-policy-note";
import { StickyBookBar } from "@/components/trip/sticky-book-bar";
import { Breadcrumb } from "@/components/trip/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { buildTripSchema, buildBreadcrumbSchema, buildFaqSchema } from "@/lib/seo/schema";

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pkg = await getPackageBySlug(params.slug);
  if (!pkg) return {};

  const title = pkg.metaTitle || `${pkg.title} — ${pkg.durationNights}N/${pkg.durationDays}D`;
  const description =
    pkg.metaDescription ||
    pkg.overview ||
    `${pkg.title}: a ${pkg.durationNights} nights / ${pkg.durationDays} days journey with Himaroh Travels.`;
  const image = pkg.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/trips/${pkg.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function TripDetailPage({ params }: Props) {
  const pkg = await getPackageBySlug(params.slug);
  if (!pkg) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const faqSchema = buildFaqSchema(pkg.faqs.map((f) => ({ question: f.question, answer: f.answer })));

  return (
    <>
      <JsonLd data={buildTripSchema(pkg, baseUrl)} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", url: baseUrl },
          { name: "Trips", url: `${baseUrl}/trips` },
          { name: pkg.title, url: `${baseUrl}/trips/${pkg.slug}` },
        ])}
      />
      {faqSchema && <JsonLd data={faqSchema} />}

      <TripHero pkg={pkg} />
      <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "Trips", href: "/trips" }, { name: pkg.title }]} />
      <TripOverview pkg={pkg} />
      <TripItinerary pkg={pkg} />
      <TripInclusions pkg={pkg} />
      <TripAccommodation pkg={pkg} />
      <UpcomingDepartures pkg={pkg} />
      <TripPolicyNote />
      <TripGallery pkg={pkg} />
      <TripFAQ pkg={pkg} />

      {/* bottom padding so the sticky mobile bar never covers content */}
      <div className="h-20 md:hidden" />
      <StickyBookBar pkg={pkg} />
    </>
  );
}

/**
 * Note: the floating WhatsApp button rendered by the shared (public) layout
 * already covers this page. It uses a generic message; wiring it to include
 * this specific package name would require lifting WhatsAppButton out of the
 * layout into a per-route slot — left as a Phase 4+ enhancement since it's
 * cosmetic (the sticky "Book Your Seat" bar already carries package context
 * via its href).
 */
