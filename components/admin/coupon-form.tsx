"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCouponAction, updateCouponAction, deleteCouponAction } from "@/app/admin/(dashboard)/coupons/actions";
import type { CouponFormInput } from "@/lib/validations/site-content";

const inputClass = "h-11 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold";
const labelClass = "mb-1.5 block text-xs font-medium text-navy/60";

type Initial = CouponFormInput & { id?: string };

export function CouponForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CouponFormInput>(
    initial ?? {
      code: "",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxDiscountAmount: undefined,
      minBookingAmount: undefined,
      startDate: new Date().toISOString().slice(0, 10),
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      usageLimit: undefined,
      perCustomerLimit: 1,
      isActive: true,
    }
  );

  function set<K extends keyof CouponFormInput>(key: K, value: CouponFormInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = initial?.id ? await updateCouponAction(initial.id, form) : await createCouponAction(form);
      if (result.success) router.push("/admin/coupons");
      else setError(result.error);
    });
  }

  function handleDelete() {
    if (!initial?.id) return;
    if (!confirm("Delete this coupon?")) return;
    startTransition(async () => {
      const result = await deleteCouponAction(initial.id!);
      if (result.success) router.push("/admin/coupons");
      else setError(result.error);
    });
  }

  return (
    <div className="max-w-xl space-y-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Coupon Code *</label>
          <input className={inputClass + " font-mono uppercase"} value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} />
        </div>
        <div>
          <label className={labelClass}>Discount Type</label>
          <select className={inputClass} value={form.discountType} onChange={(e) => set("discountType", e.target.value as any)}>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed Amount</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Discount Value *</label>
          <input type="number" className={inputClass} value={form.discountValue} onChange={(e) => set("discountValue", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Max Discount (₹, optional)</label>
          <input type="number" className={inputClass} value={form.maxDiscountAmount ?? ""} onChange={(e) => set("maxDiscountAmount", e.target.value ? Number(e.target.value) : undefined)} />
        </div>
        <div>
          <label className={labelClass}>Min Booking Amount (₹, optional)</label>
          <input type="number" className={inputClass} value={form.minBookingAmount ?? ""} onChange={(e) => set("minBookingAmount", e.target.value ? Number(e.target.value) : undefined)} />
        </div>
        <div>
          <label className={labelClass}>Start Date</label>
          <input type="date" className={inputClass} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Expiry Date</label>
          <input type="date" className={inputClass} value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Total Usage Limit (optional)</label>
          <input type="number" className={inputClass} value={form.usageLimit ?? ""} onChange={(e) => set("usageLimit", e.target.value ? Number(e.target.value) : undefined)} />
        </div>
        <div>
          <label className={labelClass}>Per-Customer Limit</label>
          <input type="number" className={inputClass} value={form.perCustomerLimit ?? ""} onChange={(e) => set("perCustomerLimit", e.target.value ? Number(e.target.value) : undefined)} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-navy">
        <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
        Active
      </label>

      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={isPending || !form.code}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial?.id ? "Save Changes" : "Create Coupon"}
        </Button>
        {initial?.id && (
          <Button variant="ghost" onClick={handleDelete} disabled={isPending} className="text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        )}
      </div>
    </div>
  );
}
