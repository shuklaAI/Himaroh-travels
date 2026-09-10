import type { Metadata } from "next";
import Link from "next/link";
import { LegalDisclaimer } from "@/components/legal/legal-disclaimer";
import { getSiteSettings } from "@/lib/queries/settings";

export const metadata: Metadata = { title: "Cancellation Policy" };

export default async function CancellationPolicyPage() {
  const settings = await getSiteSettings();

  return (
    <div className="section max-w-3xl">
      <div className="mb-8">
        <p className="eyebrow mb-3">Legal</p>
        <h1 className="text-4xl font-semibold text-navy">Cancellation Policy</h1>
      </div>

      <LegalDisclaimer />

      <div className="space-y-8 text-navy/70">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-navy">Advance Payment</h2>
          <p className="leading-relaxed">{settings.cancellationPolicySummary}</p>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-navy">Exact Amounts</h2>
          <p className="leading-relaxed">
            The specific advance amount and any tiered refund schedule for the remaining balance
            are shown during the booking process for each departure, since they can vary by trip
            and season. Please refer to your booking confirmation for the figures that apply to
            your reservation.
          </p>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-navy">Weather & Force Majeure</h2>
          <p className="leading-relaxed">
            If a departure is cancelled by Himaroh Travels due to weather, road closures, or other
            circumstances beyond our control, we will work with affected travellers on
            rescheduling or an appropriate resolution.
          </p>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-navy">Questions</h2>
          <p className="leading-relaxed">
            For cancellation requests or questions about a specific booking, contact us at{" "}
            {settings.email}, {settings.phone}, or via{" "}
            <Link href="/contact" className="font-medium text-navy underline underline-offset-2">
              our contact page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
