export type PriceBreakdown = {
  unitPrice: number;
  travellerCount: number;
  basePriceTotal: number;
  discountAmount: number;
  addOnsTotal: number;
  finalTotal: number;
  advanceAmount: number;
  balanceAmount: number;
};

export type AdvanceRule = {
  advanceType: "PERCENTAGE" | "FIXED";
  advanceAmount: number; // if FIXED: rupees per traveller. if PERCENTAGE: % of finalTotal.
};

export type CouponRule = {
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxDiscountAmount?: number | null;
};

/**
 * Pure, side-effect-free price calculation. This is called both:
 *  - server-side, inside the booking transaction, where its output is authoritative
 *  - client-side, purely to render a live price summary as the user fills the form
 * The server NEVER trusts a client-submitted total — it always recomputes this itself
 * from the departure/pricing/coupon rows it just read from the database.
 */
export function calculateBookingPrice(params: {
  unitPrice: number;
  travellerCount: number;
  accommodationAdjustment?: number;
  coupon?: CouponRule | null;
  advanceRule?: AdvanceRule | null;
}): PriceBreakdown {
  const { unitPrice, travellerCount, accommodationAdjustment = 0, coupon, advanceRule } = params;

  const basePriceTotal = unitPrice * travellerCount;
  const addOnsTotal = accommodationAdjustment * travellerCount;

  let discountAmount = 0;
  if (coupon) {
    discountAmount =
      coupon.discountType === "PERCENTAGE"
        ? (basePriceTotal * coupon.discountValue) / 100
        : coupon.discountValue;
    if (coupon.maxDiscountAmount != null) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
    discountAmount = Math.min(discountAmount, basePriceTotal); // never discount below 0
  }

  const finalTotal = Math.max(basePriceTotal - discountAmount + addOnsTotal, 0);

  let advanceAmount = 0;
  if (advanceRule) {
    advanceAmount =
      advanceRule.advanceType === "PERCENTAGE"
        ? (finalTotal * advanceRule.advanceAmount) / 100
        : advanceRule.advanceAmount * travellerCount;
    advanceAmount = Math.min(advanceAmount, finalTotal);
  }

  const balanceAmount = Math.max(finalTotal - advanceAmount, 0);

  return {
    unitPrice,
    travellerCount,
    basePriceTotal: round2(basePriceTotal),
    discountAmount: round2(discountAmount),
    addOnsTotal: round2(addOnsTotal),
    finalTotal: round2(finalTotal),
    advanceAmount: round2(advanceAmount),
    balanceAmount: round2(balanceAmount),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
