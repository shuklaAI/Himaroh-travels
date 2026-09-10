"use client";

import { formatINR } from "@/lib/utils";
import type { PriceBreakdown } from "@/lib/booking/pricing";

export function PriceSummary({
  breakdown,
  className = "",
}: {
  breakdown: PriceBreakdown;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-navy/10 bg-white p-6 ${className}`}>
      <h3 className="mb-4 font-display text-lg font-semibold text-navy">Price Summary</h3>
      <dl className="space-y-2.5 text-sm">
        <Row label={`Base price × ${breakdown.travellerCount}`} value={formatINR(breakdown.basePriceTotal)} />
        {breakdown.addOnsTotal > 0 && <Row label="Add-ons" value={formatINR(breakdown.addOnsTotal)} />}
        {breakdown.discountAmount > 0 && (
          <Row label="Discount" value={`− ${formatINR(breakdown.discountAmount)}`} valueClass="text-green-700" />
        )}
        <div className="my-2 border-t border-navy/10" />
        <Row label="Total" value={formatINR(breakdown.finalTotal)} bold />
        <div className="my-2 border-t border-dashed border-navy/10" />
        <Row label="Advance payment (due now)" value={formatINR(breakdown.advanceAmount)} valueClass="text-gold" />
        <Row label="Balance (due before departure)" value={formatINR(breakdown.balanceAmount)} />
      </dl>
      <p className="mt-4 text-[11px] leading-relaxed text-navy/45">
        The advance amount is non-refundable and confirms your seat. Final pricing is always
        verified on our server before your booking is created.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  valueClass = "",
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={bold ? "font-semibold text-navy" : "text-navy/60"}>{label}</dt>
      <dd className={`${bold ? "font-semibold text-navy" : ""} ${valueClass}`}>{value}</dd>
    </div>
  );
}
