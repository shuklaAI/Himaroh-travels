import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BookingCTA() {
  return (
    <section className="bg-gold-band px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 rounded-3xl bg-white p-8 shadow-lg sm:flex-row sm:p-12">
        <div>
          <h2 className="max-w-md text-2xl font-bold leading-tight text-navy sm:text-3xl">
            Planning a trip can be overwhelming — let our trek experts help you pick the right journey.
          </h2>
          <Button asChild size="lg" className="mt-6">
            <Link href="/contact">Get a Call Back</Link>
          </Button>
        </div>
        <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-gold/10 sm:h-40 sm:w-40">
          <Compass className="h-16 w-16 text-gold sm:h-20 sm:w-20" strokeWidth={1.2} />
        </div>
      </div>
    </section>
  );
}
