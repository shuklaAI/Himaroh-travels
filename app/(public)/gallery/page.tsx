import type { Metadata } from "next";
import { Image as ImageIcon } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from Himaroh Travels' Himalayan journeys — Tungnath, Chandrashila, Deoria Tal, Chopta and more.",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: { position: "asc" } });

  return (
    <div className="section">
      <div className="mb-10 text-center">
        <p className="eyebrow mb-3">Gallery</p>
        <h1 className="text-4xl font-semibold text-navy sm:text-5xl">Moments from the Mountains</h1>
        <p className="mx-auto mt-4 max-w-xl text-navy/60">
          A glimpse of Tungnath, Chandrashila, Deoria Tal and the rest of the journey, from real
          Himaroh departures.
        </p>
      </div>

      {images.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy/20 bg-white/50 p-16 text-center">
          <ImageIcon className="mx-auto mb-4 h-10 w-10 text-navy/30" strokeWidth={1.5} />
          <p className="text-navy/60">
            Photos are being added. In the meantime, check out individual trip pages for imagery
            from that journey.
          </p>
        </div>
      ) : (
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
          {images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={img.url}
              alt={img.altText ?? "Himaroh Travels"}
              loading="lazy"
              className="w-full rounded-xl object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}
