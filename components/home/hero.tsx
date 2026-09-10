"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query ? `/trips?q=${encodeURIComponent(query)}` : "/trips");
  }

  return (
    <section className="relative flex h-[85vh] min-h-[560px] w-full items-center overflow-hidden bg-navy">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2400&auto=format&fit=crop')",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-navy/40" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 text-center sm:px-8 lg:px-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-5xl font-semibold leading-[1.05] text-ivory sm:text-6xl lg:text-7xl"
        >
          Escape to the Himalayas
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-4 max-w-xl text-base text-ivory/80 sm:text-lg"
        >
          Curated treks and spiritual journeys through Uttarakhand — small groups, Delhi pickup &amp; drop.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSearch}
          className="mx-auto mt-8 flex max-w-xl overflow-hidden rounded-full bg-ivory/95 shadow-lg"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Discover your next destination"
            aria-label="Search trips"
            className="h-14 flex-1 bg-transparent px-6 text-sm text-navy outline-none placeholder:text-navy/40"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex h-14 w-16 shrink-0 items-center justify-center bg-gold text-navy transition-colors hover:bg-gold-light"
          >
            <Search className="h-5 w-5" />
          </button>
        </motion.form>
      </div>
    </section>
  );
}
