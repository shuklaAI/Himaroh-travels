import { Suspense } from "react";
import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { TrustBar } from "@/components/home/trust-bar";
import { FeaturedTrips } from "@/components/home/featured-trips";
import { FeaturedTripsSkeleton } from "@/components/skeletons/trip-card-skeleton";
import { WhyHimaroh } from "@/components/home/why-himaroh";
import { DestinationExperience } from "@/components/home/destination-experience";
import { ItineraryPreview } from "@/components/home/itinerary-preview";
import { BookingCTA } from "@/components/home/booking-cta";
import { Testimonials } from "@/components/home/testimonials";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Discover the Spirit of the Himalayas",
  description:
    "Curated Himalayan treks and spiritual journeys with Delhi pickup and drop. Small groups, experienced trek leaders, comfortable stays.",
};

export const revalidate = 60; // ISR: public homepage re-reads DB at most once/min

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />

      <Suspense fallback={<div className="section"><FeaturedTripsSkeleton /></div>}>
        <FeaturedTrips />
      </Suspense>

      <WhyHimaroh />
      <DestinationExperience />

      <Suspense
        fallback={
          <div className="section space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full max-w-3xl mx-auto" />
            ))}
          </div>
        }
      >
        <ItineraryPreview />
      </Suspense>

      <BookingCTA />

      <Suspense fallback={null}>
        <Testimonials />
      </Suspense>
    </>
  );
}
