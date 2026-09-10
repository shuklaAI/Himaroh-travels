"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { submitEnquiryAction } from "@/app/(public)/contact/actions";

const inputClass =
  "h-12 w-full rounded-full border border-navy/25 bg-white px-5 text-sm outline-none focus:border-gold";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await submitEnquiryAction({
        name: `${firstName} ${lastName}`.trim(),
        phone,
        email,
        message,
        packageInterest: "",
        website,
      });
      if (result.success) {
        setSubmitted(true);
        setFirstName("");
        setLastName("");
        setPhone("");
        setEmail("");
        setMessage("");
      } else {
        setError(result.error);
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" />
        <p className="font-bold text-navy">Message sent — thank you.</p>
        <p className="mt-1 text-sm text-navy/60">We'll give you a call back shortly.</p>
        <button onClick={() => setSubmitted(false)} className="mt-4 text-sm font-semibold text-gold underline underline-offset-2">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <input className={inputClass} placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input className={inputClass} placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>
      <input className={inputClass} placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <input className={inputClass} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <textarea
        className="min-h-[140px] w-full rounded-2xl border border-navy/25 bg-white px-5 py-4 text-sm outline-none focus:border-gold"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {/* Honeypot — hidden from real visitors */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isPending || !firstName || !phone || !message}
        className="flex h-12 items-center justify-center rounded-full border-2 border-navy bg-white px-10 text-sm font-bold text-gold transition-colors hover:bg-navy disabled:opacity-50"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit
      </button>
    </div>
  );
}
