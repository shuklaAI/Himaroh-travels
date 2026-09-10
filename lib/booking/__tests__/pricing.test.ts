import { describe, it, expect } from "vitest";
import { calculateBookingPrice } from "@/lib/booking/pricing";

describe("calculateBookingPrice", () => {
  it("computes base total and fixed per-person advance with no coupon", () => {
    const result = calculateBookingPrice({
      unitPrice: 4999,
      travellerCount: 2,
      advanceRule: { advanceType: "FIXED", advanceAmount: 1000 },
    });
    expect(result.basePriceTotal).toBe(9998);
    expect(result.finalTotal).toBe(9998);
    expect(result.advanceAmount).toBe(2000); // 1000 x 2 travellers
    expect(result.balanceAmount).toBe(7998);
  });

  it("applies a percentage coupon capped at maxDiscountAmount", () => {
    const result = calculateBookingPrice({
      unitPrice: 10000,
      travellerCount: 2, // base = 20000
      coupon: { discountType: "PERCENTAGE", discountValue: 20, maxDiscountAmount: 2000 },
      advanceRule: { advanceType: "FIXED", advanceAmount: 1000 },
    });
    // 20% of 20000 = 4000, capped at 2000
    expect(result.discountAmount).toBe(2000);
    expect(result.finalTotal).toBe(18000);
  });

  it("applies a fixed coupon and never discounts below zero", () => {
    const result = calculateBookingPrice({
      unitPrice: 500,
      travellerCount: 1,
      coupon: { discountType: "FIXED", discountValue: 5000 }, // larger than base
    });
    expect(result.discountAmount).toBe(500); // clamped to basePriceTotal
    expect(result.finalTotal).toBe(0);
  });

  it("adds accommodation adjustment per traveller", () => {
    const result = calculateBookingPrice({
      unitPrice: 5000,
      travellerCount: 3,
      accommodationAdjustment: 300,
    });
    expect(result.addOnsTotal).toBe(900);
    expect(result.finalTotal).toBe(15900);
  });

  it("computes percentage-based advance from the final total", () => {
    const result = calculateBookingPrice({
      unitPrice: 10000,
      travellerCount: 1,
      advanceRule: { advanceType: "PERCENTAGE", advanceAmount: 25 },
    });
    expect(result.advanceAmount).toBe(2500);
    expect(result.balanceAmount).toBe(7500);
  });

  it("never lets advance exceed the final total", () => {
    const result = calculateBookingPrice({
      unitPrice: 500,
      travellerCount: 1,
      advanceRule: { advanceType: "FIXED", advanceAmount: 1000 }, // advance > total
    });
    expect(result.advanceAmount).toBe(500);
    expect(result.balanceAmount).toBe(0);
  });
});
