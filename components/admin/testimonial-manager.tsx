"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { upsertTestimonialAction, deleteTestimonialAction } from "@/app/admin/(dashboard)/testimonials/actions";
import type { TestimonialFormInput } from "@/lib/validations/site-content";

type Testimonial = TestimonialFormInput & { id: string };
const inputClass = "h-10 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold";

const emptyForm: TestimonialFormInput = {
  customerName: "",
  location: "",
  rating: 5,
  content: "",
  imageUrl: "",
  packageId: "",
  isVerified: false,
  isPublished: false,
};

export function TestimonialManager({
  testimonials,
  packages,
}: {
  testimonials: Testimonial[];
  packages: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialFormInput>(emptyForm);

  function set<K extends keyof TestimonialFormInput>(key: K, value: TestimonialFormInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function edit(t: Testimonial) {
    setEditingId(t.id);
    setForm(t);
  }

  function submit() {
    startTransition(async () => {
      await upsertTestimonialAction(editingId, form);
      setEditingId(null);
      setForm(emptyForm);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <div key={t.id} className="rounded-2xl border border-navy/10 bg-white p-5">
            <div className="flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
              ))}
            </div>
            <p className="mt-2 text-sm text-navy/70">{t.content}</p>
            <p className="mt-3 text-xs font-medium text-navy">{t.customerName}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${t.isPublished ? "bg-green-50 text-green-700" : "bg-navy/5 text-navy/50"}`}>
                {t.isPublished ? "Published" : "Draft"}
              </span>
              {t.isVerified && <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] text-navy">Verified</span>}
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => edit(t)} className="text-xs font-medium text-navy hover:text-gold">
                Edit
              </button>
              <button
                onClick={() => startTransition(async () => { await deleteTestimonialAction(t.id); router.refresh(); })}
                className="text-xs font-medium text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {testimonials.length === 0 && <p className="text-sm text-navy/50">No testimonials yet.</p>}
      </div>

      <div className="max-w-xl rounded-2xl border border-dashed border-navy/20 p-5">
        <p className="mb-3 text-sm font-medium text-navy">{editingId ? "Edit Testimonial" : "Add Testimonial"}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Customer name" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} className={inputClass} />
          <input placeholder="Location" value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} className={inputClass} />
          <select value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} className={inputClass}>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} star{r > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <select value={form.packageId ?? ""} onChange={(e) => set("packageId", e.target.value)} className={inputClass}>
            <option value="">No specific trip</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Testimonial content"
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            className={inputClass + " h-20 py-2 sm:col-span-2"}
          />
        </div>
        <div className="mt-3 flex gap-4">
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" checked={form.isVerified} onChange={(e) => set("isVerified", e.target.checked)} />
            Verified booking
          </label>
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />
            Published
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={submit} disabled={isPending || !form.customerName || !form.content}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Save" : "Add Testimonial"}
          </Button>
          {editingId && (
            <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
