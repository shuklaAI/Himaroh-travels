import type { Metadata } from "next";
import { LegalDisclaimer } from "@/components/legal/legal-disclaimer";
import { getSiteSettings } from "@/lib/queries/settings";

export const metadata: Metadata = { title: "Terms & Conditions" };

const SECTIONS = [
  {
    title: "Advance Payment",
    body: "A booking advance is required to confirm a seat on any departure. This advance amount is non-refundable, regardless of the reason for later cancellation.",
  },
  {
    title: "Verification",
    body: "Travellers may be required to provide a valid government-issued photo ID at the time of booking or departure, for safety and verification purposes.",
  },
  {
    title: "Refunds",
    body: "Refund eligibility for amounts paid beyond the advance depends on the specific Cancellation Policy in effect for a given trip and departure date.",
  },
  {
    title: "Traveller Responsibility",
    body: "Travellers are responsible for carrying required personal items, following trek leader instructions, and disclosing any relevant medical conditions in advance.",
  },
  {
    title: "Departure",
    body: "Travellers must arrive at the specified pickup point before the stated departure time. Himaroh Travels is not responsible for missed departures due to late arrival.",
  },
  {
    title: "Weather & Conditions",
    body: "Mountain travel can be affected by weather, road conditions, and other circumstances outside our control, which may require itinerary changes.",
  },
  {
    title: "Safety",
    body: "Trip leaders may modify an itinerary where reasonably necessary for the safety of the group or logistical reasons, at their discretion.",
  },
];

export default async function TermsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="section max-w-3xl">
      <div className="mb-8">
        <p className="eyebrow mb-3">Legal</p>
        <h1 className="text-4xl font-semibold text-navy">Terms & Conditions</h1>
      </div>

      <LegalDisclaimer />

      <div className="space-y-8">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="mb-2 text-lg font-semibold text-navy">{s.title}</h2>
            <p className="leading-relaxed text-navy/70">{s.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-navy/50">
        Questions about these terms? Contact us at {settings.email} or {settings.phone}.
      </p>
    </div>
  );
}
