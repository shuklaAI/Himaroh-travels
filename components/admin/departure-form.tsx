"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDepartureAction, updateDepartureAction } from "@/app/admin/(dashboard)/departures/actions";
import type { DepartureFormInput } from "@/lib/validations/departure";

const inputClass =
  "h-10 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold";
const labelClass = "mb-1.5 block text-xs font-medium text-navy/60";

const SHARING_OPTIONS = ["QUAD", "TRIPLE", "DOUBLE", "SINGLE", "CHILD"] as const;

type Props = {
  mode: "create" | "edit";
  departureId?: string;
  packages: { id: string; title: string }[];
  initial?: Partial<DepartureFormInput>;
  bookedSeats?: number;
};

export function DepartureForm({ mode, departureId, packages, initial, bookedSeats = 0 }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [packageId, setPackageId] = useState(initial?.packageId ?? packages[0]?.id ?? "");
  const [departureDate, setDepartureDate] = useState(initial?.departureDate ?? "");
  const [totalCapacity, setTotalCapacity] = useState(initial?.totalCapacity ?? 20);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [status, setStatus] = useState(initial?.status ?? "OPEN");
  const [pricing, setPricing] = useState<{ sharingType: string; price: number }[]>(
    initial?.pricing?.length
      ? initial.pricing
      : [
          { sharingType: "QUAD", price: 0 },
          { sharingType: "TRIPLE", price: 0 },
          { sharingType: "DOUBLE", price: 0 },
        ]
  );

  function updatePricingRow(sharingType: string, price: number) {
    setPricing((prev) => prev.map((p) => (p.sharingType === sharingType ? { ...p, price } : p)));
  }

  function toggleSharingType(sharingType: string, enabled: boolean) {
    setPricing((prev) =>
      enabled
        ? [...prev, { sharingType, price: 0 }]
        : prev.filter((p) => p.sharingType !== sharingType)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input: DepartureFormInput = {
      packageId,
      departureDate,
      totalCapacity,
      notes,
      status: status as DepartureFormInput["status"],
      pricing: pricing.map((p) => ({ sharingType: p.sharingType as any, price: p.price })),
    };

    const result =
      mode === "create" ? await createDepartureAction(input) : await updateDepartureAction(departureId!, input);

    if (result.success) {
      router.push("/admin/departures");
      router.refresh();
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="rounded-2xl border border-navy/10 bg-white p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-navy">Departure Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Package *</label>
            <select className={inputClass} value={packageId} onChange={(e) => setPackageId(e.target.value)} required>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Departure Date & Time *</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>
              Total Capacity * {bookedSeats > 0 && <span className="text-navy/40">(min {bookedSeats} — already booked)</span>}
            </label>
            <input
              type="number"
              min={bookedSeats}
              className={inputClass}
              value={totalCapacity}
              onChange={(e) => setTotalCapacity(Number(e.target.value))}
              required
            />
          </div>
          {mode === "edit" && (
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="SOLD_OUT">Sold Out</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          )}
          <div className="sm:col-span-2">
            <label className={labelClass}>Notes (internal)</label>
            <textarea className={inputClass + " h-20 py-2"} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-navy/10 bg-white p-6">
        <h3 className="mb-1 font-display text-lg font-semibold text-navy">Pricing</h3>
        <p className="mb-4 text-xs text-navy/50">
          Prices are per person, in ₹. Changes here update the public trip page immediately.
        </p>

        <div className="mb-4 flex flex-wrap gap-3">
          {SHARING_OPTIONS.map((opt) => {
            const enabled = pricing.some((p) => p.sharingType === opt);
            return (
              <label key={opt} className="flex items-center gap-1.5 text-xs text-navy/70">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => toggleSharingType(opt, e.target.checked)}
                />
                {opt}
              </label>
            );
          })}
        </div>

        <div className="space-y-3">
          {pricing.map((row) => (
            <div key={row.sharingType} className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium text-navy">{row.sharingType}</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-navy/40">₹</span>
                <input
                  type="number"
                  min={0}
                  className={inputClass + " pl-7"}
                  value={row.price}
                  onChange={(e) => updatePricingRow(row.sharingType, Number(e.target.value))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Saving…" : mode === "create" ? "Create Departure" : "Save Changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/departures")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
