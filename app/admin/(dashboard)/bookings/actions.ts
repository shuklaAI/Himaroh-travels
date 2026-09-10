"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminAction, AuthorizationError } from "@/lib/auth/guard";
import { logAudit } from "@/lib/audit";
import {
  bookingStatusSchema,
  offlinePaymentSchema,
  refundSchema,
  bookingNoteSchema,
  type OfflinePaymentInput,
  type RefundInput,
} from "@/lib/validations/booking-admin";
import { sendBookingCancelledEmail, sendRefundInitiatedEmail, sendBookingConfirmedEmail, sendPaymentSuccessfulEmail } from "@/lib/email/send";

const BOOKING_ROLES = ["SUPER_ADMIN", "OPERATIONS_ADMIN"] as const;

type ActionResult = { success: true } | { success: false; error: string };

export async function updateBookingStatusAction(bookingId: string, status: string): Promise<ActionResult> {
  try {
    const admin = await requireAdminAction([...BOOKING_ROLES]);
    const parsedStatus = bookingStatusSchema.safeParse(status);
    if (!parsedStatus.success) return { success: false, error: "Invalid status." };

    const previous = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!previous) return { success: false, error: "Booking not found." };

    // Cancelling a booking releases its reserved seats back to the departure.
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({ where: { id: bookingId }, data: { status: parsedStatus.data } });

      if (parsedStatus.data === "CANCELLED" && previous.status !== "CANCELLED") {
        await tx.departure.update({
          where: { id: previous.departureId },
          data: { bookedSeats: { decrement: previous.travellerCount }, status: "OPEN" },
        });
      }
    });

    await logAudit({
      adminUserId: admin.id,
      action: "BOOKING_STATUS_CHANGED",
      entityType: "Booking",
      entityId: bookingId,
      previousValue: { status: previous.status },
      newValue: { status: parsedStatus.data },
    });

    if (parsedStatus.data === "CANCELLED") {
      sendBookingCancelledEmail(bookingId).catch((e) => console.error("sendBookingCancelledEmail failed:", e));
    }
    if (parsedStatus.data === "CONFIRMED" && previous.status !== "CONFIRMED") {
      sendBookingConfirmedEmail(bookingId).catch((e) => console.error("sendBookingConfirmedEmail failed:", e));
    }

    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/bookings");
    revalidatePath("/admin"); // dashboard counts
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("updateBookingStatusAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

export async function recordOfflinePaymentAction(bookingId: string, input: OfflinePaymentInput): Promise<ActionResult> {
  try {
    const admin = await requireAdminAction([...BOOKING_ROLES]);
    const parsed = offlinePaymentSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return { success: false, error: "Booking not found." };

    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          bookingId,
          method: parsed.data.method,
          status: "CAPTURED",
          amount: parsed.data.amount,
          failureReason: null,
          recordedByAdminId: admin.id,
        },
      });

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { amountPaid: { increment: parsed.data.amount } },
      });

      const newStatus = Number(updated.amountPaid) >= Number(updated.finalTotal) ? "CONFIRMED" : "PARTIALLY_PAID";
      await tx.booking.update({ where: { id: bookingId }, data: { status: newStatus } });

      if (parsed.data.note) {
        await tx.bookingNote.create({
          data: {
            bookingId,
            adminUserId: admin.id,
            note: `Offline payment recorded (${parsed.data.method}): ${parsed.data.note}`,
          },
        });
      }
    });

    await logAudit({
      adminUserId: admin.id,
      action: "OFFLINE_PAYMENT_RECORDED",
      entityType: "Booking",
      entityId: bookingId,
      newValue: parsed.data,
    });

    sendPaymentSuccessfulEmail(bookingId, parsed.data.amount).catch((e) =>
      console.error("sendPaymentSuccessfulEmail failed:", e)
    );

    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("recordOfflinePaymentAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

export async function refundBookingAction(bookingId: string, input: RefundInput): Promise<ActionResult> {
  try {
    const admin = await requireAdminAction([...BOOKING_ROLES]);
    const parsed = refundSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return { success: false, error: "Booking not found." };
    if (parsed.data.amount > Number(booking.amountPaid)) {
      return { success: false, error: "Refund amount can't exceed the amount actually paid." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "REFUNDED",
          amountPaid: { decrement: parsed.data.amount },
        },
      });
      await tx.bookingNote.create({
        data: {
          bookingId,
          adminUserId: admin.id,
          note: `Refund of ₹${parsed.data.amount} issued.${parsed.data.reason ? ` Reason: ${parsed.data.reason}` : ""}`,
        },
      });
    });

    await logAudit({
      adminUserId: admin.id,
      action: "BOOKING_REFUNDED",
      entityType: "Booking",
      entityId: bookingId,
      newValue: parsed.data,
    });

    sendRefundInitiatedEmail(bookingId, parsed.data.amount).catch((e) =>
      console.error("sendRefundInitiatedEmail failed:", e)
    );

    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("refundBookingAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

export async function addBookingNoteAction(bookingId: string, note: string): Promise<ActionResult> {
  try {
    const admin = await requireAdminAction([...BOOKING_ROLES]);
    const parsed = bookingNoteSchema.safeParse({ note });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    await prisma.bookingNote.create({
      data: { bookingId, adminUserId: admin.id, note: parsed.data.note },
    });

    revalidatePath(`/admin/bookings/${bookingId}`);
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("addBookingNoteAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

export type ExportCsvResult = { success: true; csv: string } | { success: false; error: string };

export async function exportBookingsCsvAction(): Promise<ExportCsvResult> {
  try {
    await requireAdminAction([...BOOKING_ROLES]);

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: true, departure: { include: { package: { select: { title: true } } } } },
    });

    const header = [
      "Booking Ref",
      "Customer",
      "Phone",
      "Trip",
      "Departure Date",
      "Status",
      "Travellers",
      "Total",
      "Paid",
      "Created At",
    ];
    const rows = bookings.map((b) =>
      [
        b.bookingRef,
        b.customer.fullName,
        b.customer.phone,
        b.departure.package.title,
        b.departure.departureDate.toISOString().slice(0, 10),
        b.status,
        b.travellerCount,
        Number(b.finalTotal),
        Number(b.amountPaid),
        b.createdAt.toISOString(),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header.join(","), ...rows].join("\n") };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("exportBookingsCsvAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}
