import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ThankYouNotFound() {
  return (
    <div className="section flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-semibold text-navy">Booking not found</h1>
      <p className="mt-2 text-navy/60">We couldn't find a booking with that reference.</p>
      <Button asChild className="mt-6">
        <Link href="/trips">Browse Trips</Link>
      </Button>
    </div>
  );
}
