import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TripNotFound() {
  return (
    <div className="section flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Compass className="mb-6 h-12 w-12 text-navy/25" strokeWidth={1.5} />
      <h1 className="text-2xl font-semibold text-navy">Trip not found</h1>
      <p className="mt-2 max-w-sm text-navy/60">
        This trip may have been unpublished or the link is incorrect. Take a look at our other
        journeys instead.
      </p>
      <Button asChild className="mt-6">
        <Link href="/trips">Browse All Trips</Link>
      </Button>
    </div>
  );
}
