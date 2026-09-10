"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAccommodationAction, updateAccommodationAction } from "@/app/admin/(dashboard)/accommodations/actions";
import type { AccommodationFormInput } from "@/lib/validations/accommodation";

const inputClass = "h-11 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold";
const labelClass = "mb-1.5 block text-xs font-medium text-navy/60";

type Initial = Partial<AccommodationFormInput> & { id?: string };

export function AccommodationForm({
  initial,
  packages,
}: {
  initial?: Initial;
  packages: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<AccommodationFormInput>({
    name: initial?.name ?? "",
    category: initial?.category ?? "",
    description: initial?.description ?? "",
    location: initial?.location ?? "",
    images: initial?.images ?? "",
    amenities: initial?.amenities ?? "",
    capacity: initial?.capacity ?? undefined,
    availableUnits: initial?.availableUnits ?? undefined,
    isActive: initial?.isActive ?? true,
    priceAdjustment: initial?.priceAdjustment ?? 0,
    packageIds: initial?.packageIds ?? [],
  });

  function set<K extends keyof AccommodationFormInput>(key: K, value: AccommodationFormInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function togglePackage(id: string) {
    set("packageIds", form.packageIds.includes(id) ? form.packageIds.filter((p) => p !== id) : [...form.packageIds, id]);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = initial?.id
        ? await updateAccommodationAction(initial.id, form)
        : await createAccommodationAction(form);
      if (result.success) router.push("/admin/accommodations");
      else setError(result.error);
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Name *</label>
          <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Category *</label>
          <input className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Camp / Cottage" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea className={inputClass + " h-24 py-2"} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input className={inputClass} value={form.location} onChange={(e) => set("location", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Price Adjustment (₹/person)</label>
          <input type="number" className={inputClass} value={form.priceAdjustment} onChange={(e) => set("priceAdjustment", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Capacity</label>
          <input type="number" className={inputClass} value={form.capacity ?? ""} onChange={(e) => set("capacity", e.target.value ? Number(e.target.value) : undefined)} />
        </div>
        <div>
          <label className={labelClass}>Available Units</label>
          <input type="number" className={inputClass} value={form.availableUnits ?? ""} onChange={(e) => set("availableUnits", e.target.value ? Number(e.target.value) : undefined)} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Image URLs (comma-separated)</label>
          <input className={inputClass} value={form.images} onChange={(e) => set("images", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Amenities (comma-separated)</label>
          <input className={inputClass} value={form.amenities} onChange={(e) => set("amenities", e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Linked Packages</label>
        <div className="flex flex-wrap gap-2">
          {packages.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => togglePackage(p.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                form.packageIds.includes(p.id) ? "border-gold bg-gold/10 text-navy" : "border-navy/15 text-navy/60"
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-navy">
        <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
        Active
      </label>

      <Button onClick={handleSubmit} disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {initial?.id ? "Save Changes" : "Create Accommodation"}
      </Button>
    </div>
  );
}
