import type { Prisma, PrismaClient } from "@prisma/client";
import { BookingError } from "@/lib/booking/errors";

type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

/**
 * Validates a coupon code against current DB state (active flag, date window,
 * usage limits, per-customer limit, minimum booking amount) and returns the
 * rule to apply. Throws BookingError with a safe, specific code on failure —
 * never silently ignores an invalid coupon.
 */
export async function validateCoupon(
  tx: TxClient,
  params: { code: string; customerId: string | null; basePriceTotal: number }
) {
  const coupon = await tx.coupon.findUnique({ where: { code: params.code.trim().toUpperCase() } });

  if (!coupon || !coupon.isActive) {
    throw new BookingError("INVALID_COUPON");
  }

  const now = new Date();
  if (now < coupon.startDate || now > coupon.expiryDate) {
    throw new BookingError("COUPON_EXPIRED");
  }

  if (coupon.minBookingAmount && params.basePriceTotal < Number(coupon.minBookingAmount)) {
    throw new BookingError("COUPON_MIN_AMOUNT_NOT_MET");
  }

  if (coupon.usageLimit != null) {
    const totalUses = await tx.couponUsage.count({ where: { couponId: coupon.id } });
    if (totalUses >= coupon.usageLimit) {
      throw new BookingError("COUPON_LIMIT_REACHED");
    }
  }

  if (coupon.perCustomerLimit != null && params.customerId) {
    const customerUses = await tx.couponUsage.count({
      where: { couponId: coupon.id, customerId: params.customerId },
    });
    if (customerUses >= coupon.perCustomerLimit) {
      throw new BookingError("COUPON_LIMIT_REACHED");
    }
  }

  return {
    id: coupon.id,
    discountType: coupon.discountType,
    discountValue: Number(coupon.discountValue),
    maxDiscountAmount: coupon.maxDiscountAmount != null ? Number(coupon.maxDiscountAmount) : null,
  };
}
