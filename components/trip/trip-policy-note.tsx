import Link from "next/link";
import { Info } from "lucide-react";

export function TripPolicyNote() {
  return (
    <section className="section !py-10">
      <div className="flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-6">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <p className="text-sm text-navy/70">
          A non-refundable advance is required to confirm your seat; the remaining balance is due
          before departure. See our{" "}
          <Link href="/cancellation-policy" className="font-medium text-navy underline underline-offset-2">
            Cancellation Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="font-medium text-navy underline underline-offset-2">
            Terms & Conditions
          </Link>{" "}
          for full details.
        </p>
      </div>
    </section>
  );
}
