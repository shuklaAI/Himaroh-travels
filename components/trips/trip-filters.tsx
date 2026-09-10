"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";

export function TripFilters({ difficulties }: { difficulties: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  // Debounce the free-text search so we don't refetch on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set("q", q);
      else params.delete("q");
      startTransition(() => router.replace(`${pathname}?${params.toString()}`));
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by destination…"
          aria-label="Search trips"
          className="h-11 w-56 rounded-full border border-navy/20 bg-white pl-10 pr-4 text-sm outline-none focus:border-gold sm:w-64"
        />
      </div>

      <select
        aria-label="Filter by difficulty"
        defaultValue={searchParams.get("difficulty") ?? ""}
        onChange={(e) => setParam("difficulty", e.target.value)}
        className="h-11 rounded-full border border-navy/20 bg-white px-4 text-sm font-medium text-navy outline-none focus:border-gold"
      >
        <option value="">Difficulty</option>
        {difficulties.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by max duration"
        defaultValue={searchParams.get("maxDuration") ?? ""}
        onChange={(e) => setParam("maxDuration", e.target.value)}
        className="h-11 rounded-full border border-navy/20 bg-white px-4 text-sm font-medium text-navy outline-none focus:border-gold"
      >
        <option value="">Duration</option>
        <option value="3">Up to 3 days</option>
        <option value="5">Up to 5 days</option>
        <option value="7">Up to 7 days</option>
      </select>

      <select
        aria-label="Filter by max price"
        defaultValue={searchParams.get("maxPrice") ?? ""}
        onChange={(e) => setParam("maxPrice", e.target.value)}
        className="h-11 rounded-full border border-navy/20 bg-white px-4 text-sm font-medium text-navy outline-none focus:border-gold"
      >
        <option value="">Price</option>
        <option value="5000">Under ₹5,000</option>
        <option value="10000">Under ₹10,000</option>
        <option value="20000">Under ₹20,000</option>
      </select>

      {isPending && <span className="text-xs text-navy/40">Updating…</span>}
    </div>
  );
}
