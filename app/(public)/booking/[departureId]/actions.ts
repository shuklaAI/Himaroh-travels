"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { bookingRequestSchemaStrict, type BookingRequestInput } from "@/lib/validations/booking";
import { calculateBookingPrice } from "@/lib/booking/pricing";
import { validateCoupon } from "@/lib/booking/coupon";
import { BookingError, BOOKING_ERROR_MESSAGES, type BookingErrorCode } from "@/lib/booking/errors";
import { sendBookingReceivedEmail, sendAdminNewBookingEmail } from "@/lib/email/send";
import { checkRateLimit } from "@/lib/rate-limit";

export type CreateBookingResult =
  | { success: true; bookingId: string; bookingRef: string }
  | { success: false; error: string; code: BookingErrorCode };

/**
 * Creates a booking following the Section 31 security sequence:
 *   1. Fetch departure (with a row lock)      -> prevents two requests reading stale seat counts
 *   2. Validate availability & status          -> server-authoritative, never trusts the client
 *   3. Fetch current pricing from DB           -> server-authoritative price, ignores any client total
 *   4. Validate + apply coupon server-side
 *   5. Calculate advance/balance from DB config
 *   6. Create booking + travellers + reserve inventory, atomically, in one transaction
 *
 * If two customers submit for the last seat at the same instant, Postgres serializes the two
 * `SELECT ... FOR UPDATE` transactions: the first to commit reserves the seat, the second re-reads
 * the now-updated bookedSeats count and fails cleanly with SOLD_OUT — it can never overbook.
 */
export async function createBooking(input: BookingRequestInput): Promise<CreateBookingResult> {
  const parsed = bookingRequestSchemaStrict.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      code: "VALIDATION_ERROR",
      error: parsed.error.issues[0]?.message ?? BOOKING_ERROR_MESSAGES.VALIDATION_ERROR,
    };
  }
  const data = parsed.data;

  // Rate-limit by connection IP first, then by phone — catches both a single abusive
  // connection hammering the endpoint and someone rotating IPs but reusing a phone number.
  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipCheck = await checkRateLimit(`booking:ip:${ip}`);
  const phoneCheck = await checkRateLimit(`booking:phone:${data.contactPhone}`);
  if (!ipCheck.allowed || !phoneCheck.allowed) {
    return { success: false, code: "RATE_LIMITED", error: BOOKING_ERROR_MESSAGES.RATE_LIMITED };
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      // --- 1. Lock the departure row for the duration of this transaction ---
      const locked = await tx.$queryRaw<
        Array<{ id: string; packageId: string; totalCapacity: number; bookedSeats: number; status: string }>
      >`SELECT id, "packageId", "totalCapacity", "bookedSeats", status FROM "Departure" WHERE id = ${data.departureId} FOR UPDATE`;

      const departure = locked[0];
      if (!departure) throw new BookingError("DEPARTURE_NOT_FOUND");
      if (departure.status !== "OPEN") throw new BookingError("DEPARTURE_CLOSED");

      // --- 2. Validate availability against the just-locked row ---
      const seatsAvailable = departure.totalCapacity - departure.bookedSeats;
      if (seatsAvailable < data.travellerCount) throw new BookingError("SOLD_OUT");

      // --- 3. Server-authoritative pricing ---
      const pricingRow = await tx.pricing.findFirst({
        where: { departureId: data.departureId, sharingType: data.sharingType, isActive: true },
      });
      if (!pricingRow) throw new BookingError("PRICING_NOT_FOUND");
      const unitPrice = Number(pricingRow.price);

      let accommodationAdjustment = 0;
      if (data.accommodationId) {
        const acc = await tx.accommodation.findUnique({ where: { id: data.accommodationId } });
        if (acc?.isActive) accommodationAdjustment = Number(acc.priceAdjustment);
      }

      // --- 4. Find-or-create the guest customer (guest booking must always work) ---
      const customer = await tx.customer.upsert({
        where: { phone: data.contactPhone },
        update: {
          fullName: data.contactName,
          email: data.contactEmail || undefined,
        },
        create: {
          fullName: data.contactName,
          phone: data.contactPhone,
          email: data.contactEmail || undefined,
        },
      });

      // --- 5. Coupon (server-validated, never trusts a client-computed discount) ---
      const basePriceTotalPreCoupon = unitPrice * data.travellerCount;
      let couponResult: Awaited<ReturnType<typeof validateCoupon>> | null = null;
      if (data.couponCode) {
        couponResult = await validateCoupon(tx, {
          code: data.couponCode,
          customerId: customer.id,
          basePriceTotal: basePriceTotalPreCoupon,
        });
      }

      // --- 6. Advance/balance config (package-specific, else global fallback) ---
      let advanceConfigRow = await tx.advanceConfig.findUnique({
        where: { packageId: departure.packageId },
      });
      if (!advanceConfigRow) {
        advanceConfigRow = await tx.advanceConfig.findFirst({ where: { packageId: null } });
      }

      const priceBreakdown = calculateBookingPrice({
        unitPrice,
        travellerCount: data.travellerCount,
        accommodationAdjustment,
        coupon: couponResult
          ? {
              discountType: couponResult.discountType,
              discountValue: couponResult.discountValue,
              maxDiscountAmount: couponResult.maxDiscountAmount,
            }
          : null,
        advanceRule: advanceConfigRow
          ? { advanceType: advanceConfigRow.advanceType, advanceAmount: Number(advanceConfigRow.advanceAmount) }
          : { advanceType: "FIXED", advanceAmount: 1000 }, // brochure default, only used if admin hasn't configured one
      });

      // --- 7. Generate a human-friendly booking ref atomically ---
      const year = new Date().getFullYear();
      const counterKey = `booking-ref-${year}`;
      const counter = await tx.sequenceCounter.upsert({
        where: { key: counterKey },
        update: { value: { increment: 1 } },
        create: { key: counterKey, value: 1 },
      });
      const bookingRef = `HT-${year}-${String(counter.value).padStart(6, "0")}`;

      // --- 8. Create the booking + travellers ---
      const createdBooking = await tx.booking.create({
        data: {
          bookingRef,
          customerId: customer.id,
          departureId: data.departureId,
          status: "PAYMENT_PENDING",
          travellerCount: data.travellerCount,
          pickupPoint: data.pickupPoint,
          accommodationId: data.accommodationId || null,
          basePriceTotal: priceBreakdown.basePriceTotal,
          discountAmount: priceBreakdown.discountAmount,
          addOnsTotal: priceBreakdown.addOnsTotal,
          finalTotal: priceBreakdown.finalTotal,
          advanceAmount: priceBreakdown.advanceAmount,
          balanceAmount: priceBreakdown.balanceAmount,
          couponId: couponResult?.id ?? null,
          travellers: {
            create: data.travellers.map((t) => ({
              sharingType: data.sharingType,
              fullName: t.fullName,
              phone: t.phone || null,
              email: t.email || null,
              dateOfBirth: t.dateOfBirth ? new Date(t.dateOfBirth) : null,
              gender: t.gender,
              govtIdType: t.govtIdType || null,
              govtIdNumber: t.govtIdNumber || null,
              emergencyContactName: t.emergencyContactName || null,
              emergencyContactPhone: t.emergencyContactPhone || null,
              medicalNotes: t.medicalNotes || null,
              specialRequirements: t.specialRequirements || null,
            })),
          },
        },
      });

      // Record coupon usage against this booking, if one was applied
      if (couponResult) {
        await tx.couponUsage.create({
          data: { couponId: couponResult.id, customerId: customer.id, bookingId: createdBooking.id },
        });
      }

      // --- 9. Reserve inventory atomically (single UPDATE, safe under the row lock held above) ---
      const updatedDeparture = await tx.departure.update({
        where: { id: data.departureId },
        data: { bookedSeats: { increment: data.travellerCount } },
      });
      if (updatedDeparture.bookedSeats >= updatedDeparture.totalCapacity) {
        await tx.departure.update({ where: { id: data.departureId }, data: { status: "SOLD_OUT" } });
      }

      return createdBooking;
    });

    // Fire-and-forget: never let email delivery block or fail the booking response.
    // These run after the transaction has already committed successfully.
    sendBookingReceivedEmail(booking.id).catch((e) => console.error("sendBookingReceivedEmail failed:", e));
    sendAdminNewBookingEmail(booking.id).catch((e) => console.error("sendAdminNewBookingEmail failed:", e));

    return { success: true, bookingId: booking.id, bookingRef: booking.bookingRef };
  } catch (err) {
    if (err instanceof BookingError) {
      return { success: false, code: err.code, error: BOOKING_ERROR_MESSAGES[err.code] };
    }
    console.error("createBooking failed:", err);
    return { success: false, code: "UNKNOWN", error: BOOKING_ERROR_MESSAGES.UNKNOWN };
  }
}
