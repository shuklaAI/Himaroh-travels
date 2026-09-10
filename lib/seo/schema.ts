import type { PackageDetail } from "@/lib/queries/packages";

export function buildOrganizationSchema(settings: { companyName: string; phone: string; email: string; instagram: string }, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: settings.companyName,
    url: baseUrl,
    telephone: settings.phone,
    email: settings.email,
    sameAs: [settings.instagram].filter(Boolean),
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Builds a TouristTrip schema for a package detail page. Pricing comes from real
 * departure/pricing rows read moments earlier by getPackageBySlug. An `aggregateRating`
 * block is included ONLY when the package has real, published testimonials — never
 * fabricated, per the explicit "do not generate fake ratings or reviews" instruction.
 */
export function buildTripSchema(pkg: PackageDetail, baseUrl: string) {
  const prices = pkg.departures.flatMap((d) => d.pricing.map((p) => p.price));

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.overview ?? pkg.subtitle ?? pkg.title,
    url: `${baseUrl}/trips/${pkg.slug}`,
    ...(pkg.images[0] ? { image: pkg.images.map((i) => i.url) } : {}),
    itinerary: {
      "@type": "ItemList",
      itemListElement: pkg.itineraryDays.map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `Day ${d.dayNumber}: ${d.title}`,
        description: d.description,
      })),
    },
  };

  if (prices.length > 0) {
    schema.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      availability: pkg.departures.some((d) => !d.isSoldOut)
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
    };
  }

  if (pkg.testimonials.length > 0) {
    const avg = pkg.testimonials.reduce((sum, t) => sum + t.rating, 0) / pkg.testimonials.length;
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(1),
      reviewCount: pkg.testimonials.length,
    };
  }

  return schema;
}

export function buildFaqSchema(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
