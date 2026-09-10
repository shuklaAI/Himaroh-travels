"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  upsertItineraryDayAction,
  deleteItineraryDayAction,
  moveItineraryDayAction,
} from "@/app/admin/(dashboard)/content/[packageId]/actions";

type Day = { id: string; dayNumber: number; title: string; description: string };
const inputClass = "h-10 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold";

export function ItineraryEditor({ packageId, slug, days }: { packageId: string; slug: string; days: Day[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ dayNumber: days.length, title: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  function submit() {
    startTransition(async () => {
      await upsertItineraryDayAction(packageId, slug, editingId, form);
      setForm({ dayNumber: days.length + 1, title: "", description: "" });
      setEditingId(null);
      router.refresh();
    });
  }

  function edit(day: Day) {
    setEditingId(day.id);
    setForm({ dayNumber: day.dayNumber, title: day.title, description: day.description });
  }

  return (
    <div className="space-y-4">
      {days.map((day, i) => (
        <div key={day.id} className="rounded-xl border border-navy/10 bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-navy/40">Day {day.dayNumber}</p>
              <p className="font-semibold text-navy">{day.title}</p>
              <p className="mt-1 text-sm text-navy/60">{day.description}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => startTransition(async () => { await moveItineraryDayAction(day.id, "up", slug); router.refresh(); })}
                disabled={i === 0}
                className="rounded p-1.5 text-navy/40 hover:bg-navy/5 disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => startTransition(async () => { await moveItineraryDayAction(day.id, "down", slug); router.refresh(); })}
                disabled={i === days.length - 1}
                className="rounded p-1.5 text-navy/40 hover:bg-navy/5 disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button onClick={() => edit(day)} className="rounded px-2 py-1 text-xs font-medium text-navy hover:bg-navy/5">
                Edit
              </button>
              <button
                onClick={() => startTransition(async () => { await deleteItineraryDayAction(day.id, slug); router.refresh(); })}
                className="rounded p-1.5 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-dashed border-navy/20 p-4">
        <p className="mb-3 text-sm font-medium text-navy">{editingId ? "Edit Day" : "Add a Day"}</p>
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            type="number"
            placeholder="Day #"
            value={form.dayNumber}
            onChange={(e) => setForm((f) => ({ ...f, dayNumber: Number(e.target.value) }))}
            className={inputClass}
          />
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className={inputClass + " sm:col-span-3"}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className={inputClass + " h-20 py-2 sm:col-span-4"}
          />
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={submit} disabled={isPending || !form.title}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Save Day" : "Add Day"}
          </Button>
          {editingId && (
            <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setForm({ dayNumber: days.length, title: "", description: "" }); }}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
