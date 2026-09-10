import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, MessageCircle } from "lucide-react";
import { getBookingById } from "@/lib/queries/booking-summary";
import { getSiteSettings } from "@/lib/queries/settings";
import { isMockPaymentMode } from "@/lib/payments/razorpay";
import { RazorpayCheckoutButton } from "@/components/booking/razorpay-checkout-button";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR } from "@/lib/utils";

export const metadata = { title: "Booking Status" };

export default async function ThankYouPage({ params }: { params: { bookingId: string } }) {
  const booking = await getBookingById(params.bookingId);
  if (!booking) notFound();

  const settings = await getSiteSettings();
  const isConfirmed = booking.status === "CONFIRMED";
  const isCancelled = booking.status === "CANCELLED" || booking.status === "REFUNDED";
  const hasAmountDue = booking.amountDue > 0 && !isCancelled;

  const waText = `Hi Himaroh Travels, my booking ref is ${booking.bookingRef} for ${booking.packageTitle}. I'd like help with my payment.`;
  const waHref = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="section flex justify-center !py-16">
      <div className="w-full max-w-xl rounded-2xl border border-navy/10 bg-white p-8 text-center">
        {isConfirmed ? (
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
        ) : (
          <Clock className="mx-auto mb-4 h-12 w-12 text-gold" />
        )}

        <h1 className="text-2xl font-semibold text-navy">
          {isConfirmed
            ? "Booking Confirmed"
            : booking.status === "PARTIALLY_PAID"
            ? "Advance Received — Balance Pending"
            : "Seat Reserved — Payment Pending"}
        </h1>
        <p className="mt-2 text-sm text-navy/60">Booking reference</p>
        <p className="font-display text-xl font-semibold text-gold">{booking.bookingRef}</p>

        <dl className="mt-6 space-y-2 text-left text-sm">
          <Row label="Trip" value={booking.packageTitle} />
          <Row label="Departure" value={formatDate(booking.departureDate)} />
          <Row label="Travellers" value={String(booking.travellerCount)} />
          <Row label="Pickup Point" value={booking.pickupPoint ?? "—"} />
          <Row label="Total Amount" value={formatINR(booking.finalTotal)} />
          <Row label="Amount Paid" value={formatINR(booking.amountPaid)} />
          <Row label="Amount Due" value={formatINR(booking.amountDue)} />
        </dl>

        {hasAmountDue && (
          <div className="mt-6 flex justify-center">
            <RazorpayCheckoutButton
              bookingId={booking.id}
              amountDue={booking.amountDue}
              bookingRef={booking.bookingRef}
              contactName={booking.contactName}
              contactPhone={booking.contactPhone}
              contactEmail={booking.contactEmail ?? undefined}
              mockMode={isMockPaymentMode()}
            />
          </div>
        )}

        {isConfirmed && !hasAmountDue && (
          <p className="mt-6 text-sm text-navy/60">
            You're all set. We'll be in touch with trip logistics closer to your departure date.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant={hasAmountDue ? "ghost" : "dark"}>
            <a href={waHref} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> Need Help? WhatsApp Us
            </a>
          </Button>
          <Button asChild variant="ghost">
            <Link href={`/trips/${booking.packageSlug}`}>View Trip Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-navy/5 py-1.5 last:border-0">
      <dt className="text-navy/50">{label}</dt>
      <dd className="font-medium text-navy">{value}</dd>
    </div>
  );
}
