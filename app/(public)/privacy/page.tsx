import type { Metadata } from "next";
import { LegalDisclaimer } from "@/components/legal/legal-disclaimer";
import { getSiteSettings } from "@/lib/queries/settings";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <div className="section max-w-3xl">
      <div className="mb-8">
        <p className="eyebrow mb-3">Legal</p>
        <h1 className="text-4xl font-semibold text-navy">Privacy Policy</h1>
      </div>

      <LegalDisclaimer />

      <div className="space-y-8 text-navy/70">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-navy">Information We Collect</h2>
          <p className="leading-relaxed">
            When you make a booking or send us an enquiry, we collect information you provide
            directly: name, phone number, email, date of birth, gender, government ID details,
            emergency contact information, and any medical or accessibility notes relevant to your
            trip.
          </p>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-navy">How We Use It</h2>
          <p className="leading-relaxed">
            This information is used to process your booking, coordinate trek logistics, respond
            to enquiries, and communicate with you about your trip. Government ID and medical
            information are used only for safety and verification purposes related to your
            specific booking.
          </p>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-navy">What We Don't Do</h2>
          <p className="leading-relaxed">
            We do not sell traveller information to third parties. Payment processing is handled
            by Razorpay; we do not store your card or full payment details ourselves.
          </p>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-navy">Cookies</h2>
          <p className="leading-relaxed">
            The site uses cookies required for basic functionality, such as keeping an admin user
            signed in. We do not currently use third-party advertising cookies.
          </p>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-navy">Contact</h2>
          <p className="leading-relaxed">
            For questions about your data, or to request a copy or deletion of your information,
            contact us at {settings.email} or {settings.phone}.
          </p>
        </div>
      </div>
    </div>
  );
}
