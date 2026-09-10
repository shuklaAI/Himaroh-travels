import { z } from "zod";

export const bookingStatusSchema = z.enum([
  "PENDING",
  "PAYMENT_PENDING",
  "PARTIALLY_PAID",
  "CONFIRMED",
  "CANCELLED",
  "REFUNDED",
  "COMPLETED",
]);

export const offlinePaymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  method: z.enum(["OFFLINE_CASH", "OFFLINE_BANK_TRANSFER", "OFFLINE_UPI", "OTHER"]),
  note: z.string().trim().max(500).optional(),
});

export const refundSchema = z.object({
  amount: z.number().positive("Refund amount must be greater than zero"),
  reason: z.string().trim().max(500).optional(),
});

export const bookingNoteSchema = z.object({
  note: z.string().trim().min(1, "Note can't be empty").max(2000),
});

export type OfflinePaymentInput = z.infer<typeof offlinePaymentSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
