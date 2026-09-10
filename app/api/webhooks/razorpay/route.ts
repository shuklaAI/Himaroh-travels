import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { prisma } from "@/lib/db";
import { sendPostPaymentEmails } from "@/lib/email/send";

// Razorpay webhooks let us confirm payment even if the customer closes their
// browser right after paying, before the checkout.js success callback fires.
// This handler is intentionally idempotent — it can safely run twice for the
// same event (Razorpay does sometimes retry) without double-crediting a booking.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  try {
    if (event.event === "payment.captured") {
      const p = event.payload?.payment?.entity;
      if (p?.order_id && p?.id) await handleCaptured(p.order_id, p.id);
    } else if (event.event === "payment.failed") {
      const p = event.payload?.payment?.entity;
      if (p?.order_id) {
        await prisma.payment.updateMany({
          where: { razorpayOrderId: p.order_id },
          data: { status: "FAILED", failureReason: p.error_description ?? "Payment failed" },
        });
      }
    }
    // Other event types (refund.processed, etc.) are intentionally not handled yet —
    // refunds are recorded through the admin panel in Phase 7.
  } catch (err) {
    console.error("Razorpay webhook processing error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCaptured(orderId: string, paymentId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { razorpayOrderId: orderId } });
    if (!payment || payment.status === "CAPTURED") return null; // already processed or unknown order

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "CAPTURED", razorpayPaymentId: paymentId },
    });

    const updatedBooking = await tx.booking.update({
      where: { id: payment.bookingId },
      data: { amountPaid: { increment: payment.amount } },
    });

    const newStatus =
      Number(updatedBooking.amountPaid) >= Number(updatedBooking.finalTotal) ? "CONFIRMED" : "PARTIALLY_PAID";

    await tx.booking.update({ where: { id: updatedBooking.id }, data: { status: newStatus } });

    return { bookingId: updatedBooking.id, amountPaidNow: Number(payment.amount), isConfirmed: newStatus === "CONFIRMED" };
  });

  if (result) {
    sendPostPaymentEmails(result.bookingId, result.amountPaidNow, result.isConfirmed).catch((e) =>
      console.error("sendPostPaymentEmails (webhook) failed:", e)
    );
  }
}
