"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Loader2 } from "lucide-react";
import { StepIndicator } from "@/components/booking/step-indicator";
import { TravellerForm } from "@/components/booking/traveller-form";
import { PriceSummary } from "@/components/booking/price-summary";
import { Button } from "@/components/ui/button";
import { calculateBookingPrice } from "@/lib/booking/pricing";
import { createBooking } from "@/app/(public)/booking/[departureId]/actions";
import type { TravellerInput } from "@/lib/validations/booking";
import type { DepartureForBooking } from "@/lib/queries/booking";
import { formatDate, formatINR } from "@/lib/utils";

const SHARING_LABEL: Record<string, string> = {
  QUAD: "Quad Sharing",
  TRIPLE: "Triple Sharing",
  DOUBLE: "Double Sharing",
  SINGLE: "Single Occupancy",
  CHILD: "Child",
};

function emptyTraveller(): TravellerInput {
  return { fullName: "", phone: "", email: "" };
}

export function BookingFlow({ departure }: { departure: DepartureForBooking }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const [sharingType, setSharingType] = useState(departure.pricing[0]?.sharingType ?? "QUAD");
  const [travellerCount, setTravellerCount] = useState(1);
  const [pickupPoint, setPickupPoint] = useState(departure.package.pickupPoint ?? "");
  const [accommodationId, setAccommodationId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [travellers, setTravellers] = useState<TravellerInput[]>([emptyTraveller()]);

  function updateTravellerCount(next: number) {
    const clamped = Math.max(1, Math.min(next, departure.seatsAvailable));
    setTravellerCount(clamped);
    setTravellers((prev) => {
      const copy = [...prev];
      while (copy.length < clamped) copy.push(emptyTraveller());
      return copy.slice(0, clamped);
    });
  }

  const unitPrice = departure.pricing.find((p) => p.sharingType === sharingType)?.price ?? 0;
  const accommodation = departure.accommodations.find((a) => a.id === accommodationId);

  // Client-side preview only — the coupon discount is intentionally NOT shown here
  // since it requires live DB validation (expiry, usage limits, min amount). The
  // server recalculates and applies it authoritatively when the booking is created.
  const breakdown = useMemo(
    () =>
      calculateBookingPrice({
        unitPrice,
        travellerCount,
        accommodationAdjustment: accommodation?.priceAdjustment ?? 0,
        advanceRule: { advanceType: "FIXED", advanceAmount: 1000 },
      }),
    [unitPrice, travellerCount, accommodation]
  );

  function handleTravellerChange(index: number, value: TravellerInput) {
    setTravellers((prev) => prev.map((t, i) => (i === index ? value : t)));
  }

  function canProceedFromStep2() {
    return travellers.every((t) => t.fullName.trim().length >= 2);
  }

  function canProceedFromStep3() {
    return contactName.trim().length >= 2 && /^[0-9+\-\s]{7,15}$/.test(contactPhone.trim());
  }

  function handleSubmit() {
    setServerError(null);
    startTransition(async () => {
      const result = await createBooking({
        departureId: departure.id,
        sharingType: sharingType as any,
        travellerCount,
        pickupPoint,
        accommodationId,
        couponCode: couponCode || undefined,
        contactName,
        contactPhone,
        contactEmail: contactEmail || undefined,
        travellers,
      });

      if (result.success) {
        router.push(`/thank-you/${result.bookingId}`);
      } else {
        setServerError(result.error);
        if (result.code === "SOLD_OUT") {
          setTimeout(() => router.push(`/trips/${departure.package.slug}`), 2500);
        }
      }
    });
  }

  return (
    <div className="section !py-10">
      <StepIndicator current={step} />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {step === 1 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-navy/10 bg-white p-6">
                <p className="eyebrow mb-1">{departure.package.title}</p>
                <p className="text-navy/70">
                  Departure: {formatDate(departure.departureDate)} · {departure.seatsAvailable} seats
                  available
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-navy">Sharing Type</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {departure.pricing.map((p) => (
                    <button
                      key={p.sharingType}
                      onClick={() => setSharingType(p.sharingType)}
                      className={`rounded-xl border-2 p-4 text-left transition-colors ${
                        sharingType === p.sharingType
                          ? "border-gold bg-gold/5"
                          : "border-navy/10 bg-white hover:border-navy/20"
                      }`}
                    >
                      <p className="text-sm font-medium text-navy">
                        {SHARING_LABEL[p.sharingType] ?? p.sharingType}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-navy">{formatINR(p.price)}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-navy">Number of Travellers</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => updateTravellerCount(travellerCount - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 text-navy hover:bg-navy/5"
                    aria-label="Decrease travellers"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-lg font-semibold text-navy">{travellerCount}</span>
                  <button
                    onClick={() => updateTravellerCount(travellerCount + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 text-navy hover:bg-navy/5"
                    aria-label="Increase travellers"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-navy/50">Max {departure.seatsAvailable} available</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-navy">Pickup Point</label>
                <input
                  value={pickupPoint}
                  onChange={(e) => setPickupPoint(e.target.value)}
                  className="h-11 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold"
                />
              </div>

              <Button onClick={() => setStep(2)} className="w-full sm:w-auto">
                Continue to Traveller Details
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {travellers.map((t, i) => (
                <TravellerForm key={i} index={i} value={t} onChange={handleTravellerChange} />
              ))}
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!canProceedFromStep2()}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {departure.accommodations.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-navy">Accommodation</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => setAccommodationId(null)}
                      className={`rounded-xl border-2 p-4 text-left ${
                        accommodationId === null ? "border-gold bg-gold/5" : "border-navy/10 bg-white"
                      }`}
                    >
                      <p className="text-sm font-medium text-navy">No preference</p>
                      <p className="text-xs text-navy/50">Assigned based on availability</p>
                    </button>
                    {departure.accommodations.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setAccommodationId(a.id)}
                        className={`rounded-xl border-2 p-4 text-left ${
                          accommodationId === a.id ? "border-gold bg-gold/5" : "border-navy/10 bg-white"
                        }`}
                      >
                        <p className="text-sm font-medium text-navy">{a.name}</p>
                        <p className="text-xs text-navy/50">
                          {a.category}
                          {a.priceAdjustment > 0 && ` · +${formatINR(a.priceAdjustment)}/person`}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy/60">Coupon Code (optional)</label>
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. HIMALAYA10"
                  className="h-11 w-full max-w-xs rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold"
                />
              </div>

              <div className="rounded-2xl border border-navy/10 bg-white p-6">
                <h4 className="mb-4 font-display text-lg font-semibold text-navy">Your Contact Details</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-navy/60">Full Name *</label>
                    <input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="h-11 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-navy/60">Phone *</label>
                    <input
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="h-11 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-navy/60">Email</label>
                    <input
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="h-11 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setStep(4)} disabled={!canProceedFromStep3()}>
                  Continue to Review
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-navy/10 bg-white p-6">
                <h4 className="mb-4 font-display text-lg font-semibold text-navy">Review Your Booking</h4>
                <dl className="space-y-2 text-sm">
                  <ReviewRow label="Trip" value={departure.package.title} />
                  <ReviewRow label="Departure" value={formatDate(departure.departureDate)} />
                  <ReviewRow label="Sharing" value={SHARING_LABEL[sharingType] ?? sharingType} />
                  <ReviewRow label="Travellers" value={String(travellerCount)} />
                  <ReviewRow label="Pickup Point" value={pickupPoint} />
                  <ReviewRow label="Contact" value={`${contactName} · ${contactPhone}`} />
                </dl>
              </div>

              {serverError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(3)} disabled={isPending}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isPending ? "Reserving your seat…" : "Confirm & Reserve Seat"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop sticky summary */}
        <div className="hidden lg:block">
          <div className="sticky top-28">
            <PriceSummary breakdown={breakdown} />
          </div>
        </div>
      </div>

      {/* Mobile bottom summary */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-white/95 px-6 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-navy/50">Total</span>
            <p className="font-semibold text-navy">{formatINR(breakdown.finalTotal)}</p>
          </div>
          <span className="text-xs text-navy/50">
            Advance due: <strong className="text-gold">{formatINR(breakdown.advanceAmount)}</strong>
          </span>
        </div>
      </div>
      <div className="h-16 lg:hidden" />
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-navy/5 py-1.5 last:border-0">
      <dt className="text-navy/50">{label}</dt>
      <dd className="font-medium text-navy">{value}</dd>
    </div>
  );
}
