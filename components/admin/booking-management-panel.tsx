"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  updateBookingStatusAction,
  recordOfflinePaymentAction,
  refundBookingAction,
  addBookingNoteAction,
} from "@/app/admin/(dashboard)/bookings/actions";

const STATUSES = ["PENDING", "PAYMENT_PENDING", "PARTIALLY_PAID", "CONFIRMED", "CANCELLED", "REFUNDED", "COMPLETED"];
const OFFLINE_METHODS = ["OFFLINE_CASH", "OFFLINE_BANK_TRANSFER", "OFFLINE_UPI", "OTHER"];

const inputClass = "h-10 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold";

export function BookingManagementPanel({ bookingId, currentStatus }: { bookingId: string; currentStatus: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState(currentStatus);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("OFFLINE_CASH");
  const [payNote, setPayNote] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [note, setNote] = useState("");

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) setError(result.error ?? "Something went wrong.");
      else router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-2xl border border-navy/10 bg-white p-6">
        <h3 className="mb-3 font-display text-base font-semibold text-navy">Change Status</h3>
        <div className="flex gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            disabled={isPending || status === currentStatus}
            onClick={() => run(() => updateBookingStatusAction(bookingId, status))}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Update
          </Button>
        </div>
        <p className="mt-2 text-xs text-navy/45">Cancelling automatically releases reserved seats back to the departure.</p>
      </div>

      <div className="rounded-2xl border border-navy/10 bg-white p-6">
        <h3 className="mb-3 font-display text-base font-semibold text-navy">Record Offline Payment</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="number"
            placeholder="Amount (₹)"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            className={inputClass}
          />
          <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className={inputClass}>
            {OFFLINE_METHODS.map((m) => (
              <option key={m} value={m}>
                {m.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <input
            placeholder="Note (optional)"
            value={payNote}
            onChange={(e) => setPayNote(e.target.value)}
            className={inputClass + " sm:col-span-2"}
          />
        </div>
        <Button
          size="sm"
          className="mt-3"
          disabled={isPending || !payAmount}
          onClick={() =>
            run(() =>
              recordOfflinePaymentAction(bookingId, {
                amount: Number(payAmount),
                method: payMethod as any,
                note: payNote || undefined,
              })
            )
          }
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Record Payment
        </Button>
      </div>

      <div className="rounded-2xl border border-navy/10 bg-white p-6">
        <h3 className="mb-3 font-display text-base font-semibold text-navy">Issue Refund</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="number"
            placeholder="Refund amount (₹)"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Reason (optional)"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            className={inputClass}
          />
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="mt-3"
          disabled={isPending || !refundAmount}
          onClick={() =>
            run(() => refundBookingAction(bookingId, { amount: Number(refundAmount), reason: refundReason || undefined }))
          }
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Issue Refund
        </Button>
      </div>

      <div className="rounded-2xl border border-navy/10 bg-white p-6">
        <h3 className="mb-3 font-display text-base font-semibold text-navy">Add Internal Note</h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={inputClass + " h-20 py-2"}
          placeholder="Visible to admins only, never shown to the customer"
        />
        <Button
          size="sm"
          className="mt-3"
          disabled={isPending || !note.trim()}
          onClick={() => {
            run(() => addBookingNoteAction(bookingId, note));
            setNote("");
          }}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Add Note
        </Button>
      </div>
    </div>
  );
}
