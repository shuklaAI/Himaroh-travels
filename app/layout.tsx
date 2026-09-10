import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/seo/json-ld";
import { buildOrganizationSchema } from "@/lib/seo/schema";
import { getSiteSettings } from "@/lib/queries/settings";

const display = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Himaroh Travels — Discover the Spirit of the Himalayas",
    template: "%s | Himaroh Travels",
  },
  description:
    "Curated Himalayan treks and spiritual journeys with Delhi pickup and drop. Small groups, experienced trek leaders, comfortable stays.",
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-ivory font-sans text-ink antialiased">
        <JsonLd data={buildOrganizationSchema(settings, baseUrl)} />
        {children}
      </body>
    </html>
  );
}
