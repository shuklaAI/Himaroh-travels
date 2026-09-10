"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { upsertFaqAction, deleteFaqAction } from "@/app/admin/(dashboard)/content/[packageId]/actions";

type Faq = { id: string; question: string; answer: string; isPublished: boolean };
const inputClass = "h-10 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold";

export function FaqEditor({ packageId, slug, faqs }: { packageId: string; slug: string; faqs: Faq[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ question: "", answer: "", isPublished: true });
  const [editingId, setEditingId] = useState<string | null>(null);

  function submit() {
    startTransition(async () => {
      await upsertFaqAction(packageId, slug, editingId, form);
      setForm({ question: "", answer: "", isPublished: true });
      setEditingId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <div key={faq.id} className="rounded-xl border border-navy/10 bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-navy">{faq.question}</p>
              <p className="mt-1 text-sm text-navy/60">{faq.answer}</p>
              {!faq.isPublished && <span className="mt-1 inline-block text-xs text-navy/40">Unpublished</span>}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => { setEditingId(faq.id); setForm({ question: faq.question, answer: faq.answer, isPublished: faq.isPublished }); }}
                className="rounded px-2 py-1 text-xs font-medium text-navy hover:bg-navy/5"
              >
                Edit
              </button>
              <button
                onClick={() => startTransition(async () => { await deleteFaqAction(faq.id, slug); router.refresh(); })}
                className="rounded p-1.5 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-dashed border-navy/20 p-4">
        <p className="mb-3 text-sm font-medium text-navy">{editingId ? "Edit FAQ" : "Add FAQ"}</p>
        <input
          placeholder="Question"
          value={form.question}
          onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
          className={inputClass + " mb-3"}
        />
        <textarea
          placeholder="Answer"
          value={form.answer}
          onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
          className={inputClass + " h-20 py-2"}
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-navy">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} />
          Published
        </label>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={submit} disabled={isPending || !form.question || !form.answer}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Save FAQ" : "Add FAQ"}
          </Button>
          {editingId && (
            <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setForm({ question: "", answer: "", isPublished: true }); }}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
