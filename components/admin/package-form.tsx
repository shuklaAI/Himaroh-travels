"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPackageAction, updatePackageAction } from "@/app/admin/(dashboard)/packages/actions";
import type { PackageFormInput } from "@/lib/validations/package";

const inputClass =
  "h-10 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold";
const labelClass = "mb-1.5 block text-xs font-medium text-navy/60";

type Props = {
  mode: "create" | "edit";
  packageId?: string;
  initial?: Partial<PackageFormInput>;
};

export function PackageForm({ mode, packageId, initial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<PackageFormInput>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    subtitle: initial?.subtitle ?? "",
    region: initial?.region ?? "",
    country: initial?.country ?? "India",
    durationNights: initial?.durationNights ?? 2,
    durationDays: initial?.durationDays ?? 3,
    difficulty: initial?.difficulty ?? "",
    altitudeFt: initial?.altitudeFt ?? null,
    distanceKm: initial?.distanceKm ?? null,
    pickupCity: initial?.pickupCity ?? "",
    pickupPoint: initial?.pickupPoint ?? "",
    overview: initial?.overview ?? "",
    highlights: initial?.highlights ?? "",
    isPublished: initial?.isPublished ?? false,
    isFeatured: initial?.isFeatured ?? false,
    metaTitle: initial?.metaTitle ?? "",
    metaDescription: initial?.metaDescription ?? "",
  });

  function set<K extends keyof PackageFormInput>(key: K, value: PackageFormInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function slugify(text: string) {
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result =
      mode === "create"
        ? await createPackageAction(form)
        : await updatePackageAction(packageId!, form);

    if (result.success) {
      router.push("/admin/packages");
      router.refresh();
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="rounded-2xl border border-navy/10 bg-white p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-navy">Basics</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Title *</label>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (mode === "create") set("slug", slugify(e.target.value));
              }}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Slug *</label>
            <input className={inputClass} value={form.slug} onChange={(e) => set("slug", e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input className={inputClass} value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Region</label>
            <input className={inputClass} value={form.region} onChange={(e) => set("region", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <input className={inputClass} value={form.country} onChange={(e) => set("country", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Nights</label>
            <input
              type="number"
              className={inputClass}
              value={form.durationNights}
              onChange={(e) => set("durationNights", Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Days</label>
            <input
              type="number"
              className={inputClass}
              value={form.durationDays}
              onChange={(e) => set("durationDays", Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Difficulty</label>
            <input
              className={inputClass}
              value={form.difficulty}
              onChange={(e) => set("difficulty", e.target.value)}
              placeholder="Easy to Moderate"
            />
          </div>
          <div>
            <label className={labelClass}>Altitude (ft)</label>
            <input
              type="number"
              className={inputClass}
              value={form.altitudeFt ?? ""}
              onChange={(e) => set("altitudeFt", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div>
            <label className={labelClass}>Distance (km)</label>
            <input
              type="number"
              className={inputClass}
              value={form.distanceKm ?? ""}
              onChange={(e) => set("distanceKm", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div>
            <label className={labelClass}>Pickup City</label>
            <input className={inputClass} value={form.pickupCity} onChange={(e) => set("pickupCity", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Pickup Point</label>
            <input className={inputClass} value={form.pickupPoint} onChange={(e) => set("pickupPoint", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-navy/10 bg-white p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-navy">Content</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Overview</label>
            <textarea
              className={inputClass + " h-28 py-2"}
              value={form.overview}
              onChange={(e) => set("overview", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Highlights (comma-separated)</label>
            <input
              className={inputClass}
              value={form.highlights}
              onChange={(e) => set("highlights", e.target.value)}
              placeholder="Tungnath Temple, Chandrashila Summit, Deoria Tal"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-navy/10 bg-white p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-navy">SEO</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Meta Title</label>
            <input className={inputClass} value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Meta Description</label>
            <textarea
              className={inputClass + " h-20 py-2"}
              value={form.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 rounded-2xl border border-navy/10 bg-white p-6">
        <label className="flex items-center gap-2 text-sm text-navy">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm text-navy">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
          Featured on homepage
        </label>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Saving…" : mode === "create" ? "Create Package" : "Save Changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/packages")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
