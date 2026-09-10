"use server";

import { prisma } from "@/lib/db";
import { createRazorpayOrder, verifyRazorpaySignature, isMockPaymentMode } from "@/lib/payments/razorpay";
import { sendPostPaymentEmails } from "@/lib/email/send";

export type CreateOrderResult =
  | { success: true; orderId: string; amount: number; currency: string; keyId: string | null; bookingRef: string; mock: boolean }
  | { success: false; error: string };

/**
 * Creates a Razorpay order for whatever amount is currently due on this booking —
 * the advance, if nothing has been paid yet, otherwise the remaining balance.
 * The amount is always read from the database, never accepted from the client.
 */
export async function createPaymentOrderAction(bookingId: string): Promise<CreateOrderResult> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { success: false, error: "Booking not found." };
  if (booking.status === "CANCELLED" || booking.status === "REFUNDED") {
    return { success: false, error: "This booking is no longer active." };
  }

  const finalTotal = Number(booking.finalTotal);
  const advanceAmount = Number(booking.advanceAmount);
  const amountPaid = Number(booking.amountPaid);

  const amountDue = amountPaid <= 0 ? advanceAmount : Math.max(finalTotal - amountPaid, 0);
  if (amountDue <= 0) {
    return { success: false, error: "This booking is already fully paid." };
  }

  const order = await createRazorpayOrder({
    amountRupees: amountDue,
    receipt: `${booking.bookingRef}-${Date.now()}`,
  });

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      method: "RAZORPAY",
      status: "CREATED",
      amount: amountDue,
      razorpayOrderId: order.orderId,
    },
  });

  return {
    success: true,
    orderId: order.orderId,
    amount: order.amount,
    currency: order.currency,
    keyId: order.keyId,
    bookingRef: booking.bookingRef,
    mock: isMockPaymentMode(),
  };
}

export type VerifyPaymentResult =
  | { success: true; bookingId: string; newStatus: string }
  | { success: false; error: string };

/**
 * Verifies a Razorpay checkout callback and, if valid, atomically marks the
 * payment CAPTURED and advances the booking status. Idempotent: if this
 * payment was already captured (e.g. the webhook beat the client callback
 * here), it returns success without double-crediting the booking.
 */
export async function verifyPaymentAction(params: {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<VerifyPaymentResult> {
  const isValid = verifyRazorpaySignature({
    orderId: params.razorpayOrderId,
    paymentId: params.razorpayPaymentId,
    signature: params.razorpaySignature,
  });

  if (!isValid) {
    await prisma.payment.updateMany({
      where: { razorpayOrderId: params.razorpayOrderId },
      data: { status: "FAILED", failureReason: "Signature verification failed" },
    });
    return { success: false, error: "Payment verification failed. Please contact us before retrying." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { razorpayOrderId: params.razorpayOrderId } });
      if (!payment) throw new Error("Payment record not found for this order.");

      if (payment.status === "CAPTURED") {
        // Already processed — e.g. by the webhook — return the current state without re-crediting.
        const existingBooking = await tx.booking.findUniqueOrThrow({ where: { id: payment.bookingId } });
        return { bookingId: existingBooking.id, newStatus: existingBooking.status, amountPaidNow: 0, alreadyProcessed: true };
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "CAPTURED",
          razorpayPaymentId: params.razorpayPaymentId,
          razorpaySignature: params.razorpaySignature,
        },
      });

      const updatedBooking = await tx.booking.update({
        where: { id: payment.bookingId },
        data: { amountPaid: { increment: payment.amount } },
      });

      const newStatus =
        Number(updatedBooking.amountPaid) >= Number(updatedBooking.finalTotal) ? "CONFIRMED" : "PARTIALLY_PAID";

      const finalBooking = await tx.booking.update({
        where: { id: updatedBooking.id },
        data: { status: newStatus },
      });

      return {
        bookingId: finalBooking.id,
        newStatus: finalBooking.status,
        amountPaidNow: Number(payment.amount),
        alreadyProcessed: false,
      };
    });

    if (!result.alreadyProcessed) {
      sendPostPaymentEmails(result.bookingId, result.amountPaidNow, result.newStatus === "CONFIRMED").catch((e) =>
        console.error("sendPostPaymentEmails failed:", e)
      );
    }

    return { success: true, bookingId: result.bookingId, newStatus: result.newStatus };
  } catch (err) {
    console.error("verifyPaymentAction failed:", err);
    return { success: false, error: "Something went wrong while confirming your payment. Please contact us." };
  }
}
