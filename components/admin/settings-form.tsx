"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateSiteSettingsAction } from "@/app/admin/(dashboard)/settings/actions";
import type { SiteSettingsFormInput } from "@/lib/validations/site-content";

const inputClass = "h-11 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold";
const labelClass = "mb-1.5 block text-xs font-medium text-navy/60";

export function SettingsForm({ initial }: { initial: SiteSettingsFormInput }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(initial);

  function set<K extends keyof SiteSettingsFormInput>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await updateSiteSettingsAction(form);
      if (result.success) setSaved(true);
      else setError(result.error);
    });
  }

  return (
    <div className="max-w-xl space-y-4">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" /> Settings saved.
        </div>
      )}

      <div>
        <label className={labelClass}>Company Name</label>
        <input className={inputClass} value={form.company_name} onChange={(e) => set("company_name", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Phone</label>
        <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Instagram URL</label>
        <input className={inputClass} value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>WhatsApp Number (digits only, with country code)</label>
        <input className={inputClass} value={form.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Business Hours</label>
        <input className={inputClass} value={form.business_hours} onChange={(e) => set("business_hours", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Cancellation Policy Summary</label>
        <textarea className={inputClass + " h-20 py-2"} value={form.cancellation_policy_summary} onChange={(e) => set("cancellation_policy_summary", e.target.value)} />
      </div>

      <Button onClick={handleSubmit} disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Save Settings
      </Button>

      <p className="text-xs text-navy/40">
        Payment credentials (Razorpay), database, and auth secrets are never editable here — they
        live only in environment variables, per Section 30's "no secrets in client bundles" rule.
      </p>
    </div>
  );
}
