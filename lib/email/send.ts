import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/queries/settings";
import type { BookingEmailContext } from "@/emails/types";

import BookingReceivedEmail from "@/emails/booking-received";
import PaymentSuccessfulEmail from "@/emails/payment-successful";
import BookingConfirmedEmail from "@/emails/booking-confirmed";
import PaymentPendingEmail from "@/emails/payment-pending";
import BookingCancelledEmail from "@/emails/booking-cancelled";
import RefundInitiatedEmail from "@/emails/refund-initiated";
import TripReminderEmail from "@/emails/trip-reminder";
import AdminNewBookingEmail from "@/emails/admin-new-booking";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "Himaroh Travels <bookings@himarohtravels.com>";

async function send(to: string | null | undefined, subject: string, react: React.ReactElement) {
  if (!to) return { skipped: true, reason: "no recipient email on file" };
  if (!resend) {
    // Graceful no-op in dev/when unconfigured — never throws, never blocks the booking/payment flow.
    console.log(`[email:skipped] "${subject}" -> ${to} (RESEND_API_KEY not configured)`);
    return { skipped: true, reason: "RESEND_API_KEY not configured" };
  }
  try {
    return await resend.emails.send({ from: FROM, to, subject, react });
  } catch (err) {
    console.error(`Email send failed ("${subject}" -> ${to}):`, err);
    return { skipped: true, error: String(err) };
  }
}

async function getBookingContext(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true, departure: { include: { package: true } } },
  });
  if (!booking) return null;

  const ctx: BookingEmailContext = {
    bookingRef: booking.bookingRef,
    customerName: booking.customer.fullName,
    packageTitle: booking.departure.package.title,
    departureDate: booking.departure.departureDate,
    travellerCount: booking.travellerCount,
    pickupPoint: booking.pickupPoint,
    finalTotal: Number(booking.finalTotal),
    advanceAmount: Number(booking.advanceAmount),
    balanceAmount: Number(booking.balanceAmount),
    amountPaid: Number(booking.amountPaid),
  };
  return { ctx, customerEmail: booking.customer.email, customerPhone: booking.customer.phone };
}

export async function sendBookingReceivedEmail(bookingId: string) {
  const data = await getBookingContext(bookingId);
  if (!data) return;
  await send(data.customerEmail, `Booking Received — ${data.ctx.bookingRef}`, BookingReceivedEmail({ booking: data.ctx }));
}

export async function sendPaymentSuccessfulEmail(bookingId: string, amountPaidNow: number) {
  const data = await getBookingContext(bookingId);
  if (!data) return;
  await send(
    data.customerEmail,
    `Payment Received — ${data.ctx.bookingRef}`,
    PaymentSuccessfulEmail({ booking: data.ctx, amountPaidNow })
  );
}

export async function sendBookingConfirmedEmail(bookingId: string) {
  const data = await getBookingContext(bookingId);
  if (!data) return;
  await send(data.customerEmail, `Booking Confirmed — ${data.ctx.bookingRef}`, BookingConfirmedEmail({ booking: data.ctx }));
}

export async function sendPaymentPendingEmail(bookingId: string) {
  const data = await getBookingContext(bookingId);
  if (!data) return;
  await send(data.customerEmail, `Payment Pending — ${data.ctx.bookingRef}`, PaymentPendingEmail({ booking: data.ctx }));
}

export async function sendBookingCancelledEmail(bookingId: string, reason?: string) {
  const data = await getBookingContext(bookingId);
  if (!data) return;
  await send(
    data.customerEmail,
    `Booking Cancelled — ${data.ctx.bookingRef}`,
    BookingCancelledEmail({ booking: data.ctx, reason })
  );
}

export async function sendRefundInitiatedEmail(bookingId: string, refundAmount: number) {
  const data = await getBookingContext(bookingId);
  if (!data) return;
  await send(
    data.customerEmail,
    `Refund Initiated — ${data.ctx.bookingRef}`,
    RefundInitiatedEmail({ booking: data.ctx, refundAmount })
  );
}

export async function sendTripReminderEmail(bookingId: string) {
  const data = await getBookingContext(bookingId);
  if (!data) return;
  await send(data.customerEmail, `Reminder: ${data.ctx.packageTitle} is coming up`, TripReminderEmail({ booking: data.ctx }));
}

export async function sendAdminNewBookingEmail(bookingId: string) {
  const data = await getBookingContext(bookingId);
  if (!data) return;
  const settings = await getSiteSettings();
  await send(
    settings.email,
    `New Booking — ${data.ctx.bookingRef}`,
    AdminNewBookingEmail({ booking: data.ctx, customerPhone: data.customerPhone })
  );
}

/** Fired after a verified payment: tells the customer it succeeded, confirms the booking if fully paid, and notifies admin. */
export async function sendPostPaymentEmails(bookingId: string, amountPaidNow: number, isNowConfirmed: boolean) {
  await sendPaymentSuccessfulEmail(bookingId, amountPaidNow);
  if (isNowConfirmed) await sendBookingConfirmedEmail(bookingId);
  await sendAdminNewBookingEmail(bookingId);
}
