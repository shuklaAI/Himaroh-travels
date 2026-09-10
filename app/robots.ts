import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin, API, and transactional pages carry no SEO value and shouldn't be crawled/indexed —
        // booking/thank-you pages are per-customer and would otherwise leak into search results.
        disallow: ["/admin", "/api", "/booking", "/thank-you"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
