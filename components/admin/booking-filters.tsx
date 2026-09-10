"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";

const STATUSES = ["PENDING", "PAYMENT_PENDING", "PARTIALLY_PAID", "CONFIRMED", "CANCELLED", "REFUNDED", "COMPLETED"];

export function BookingFilters({ departures }: { departures: { id: string; label: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set("q", q);
      else params.delete("q");
      params.delete("page");
      startTransition(() => router.replace(`${pathname}?${params.toString()}`));
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="flex flex-1 flex-wrap gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ref, name, phone…"
          className="h-10 w-64 rounded-lg border border-navy/15 bg-white pl-9 pr-3 text-sm outline-none focus:border-gold"
        />
      </div>
      <select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => setParam("status", e.target.value)}
        className="h-10 rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold"
      >
        <option value="">Any status</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("departureId") ?? ""}
        onChange={(e) => setParam("departureId", e.target.value)}
        className="h-10 max-w-xs rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold"
      >
        <option value="">Any departure</option>
        {departures.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </select>
    </div>
  );
}
