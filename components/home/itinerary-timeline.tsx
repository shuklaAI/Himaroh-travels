"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

type Day = { dayNumber: number; title: string; description: string };

export function ItineraryTimeline({ days }: { days: Day[] }) {
  const [openDay, setOpenDay] = useState<number>(days[0]?.dayNumber ?? 0);

  return (
    <div className="mx-auto max-w-3xl">
      {days.map((day, i) => {
        const isOpen = openDay === day.dayNumber;
        const isLast = i === days.length - 1;
        return (
          <div key={day.dayNumber} className="relative flex gap-6">
            {/* ridge line + node */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 font-display text-sm font-semibold transition-colors ${
                  isOpen ? "border-gold bg-gold text-navy" : "border-navy/20 bg-white text-navy/50"
                }`}
              >
                {day.dayNumber}
              </div>
              {!isLast && <div className="w-px flex-1 bg-navy/15" />}
            </div>

            <button
              onClick={() => setOpenDay(isOpen ? -1 : day.dayNumber)}
              className="mb-8 flex-1 text-left"
              aria-expanded={isOpen}
            >
              <div className="flex items-center justify-between rounded-xl border border-navy/10 bg-white px-5 py-4 transition-colors hover:border-gold/40">
                <div>
                  <p className="eyebrow mb-1">Day {day.dayNumber}</p>
                  <h3 className="font-display text-lg font-semibold text-navy">{day.title}</h3>
                </div>
                {isOpen ? (
                  <Minus className="h-5 w-5 shrink-0 text-gold" />
                ) : (
                  <Plus className="h-5 w-5 shrink-0 text-navy/40" />
                )}
              </div>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-1 pt-4 text-sm leading-relaxed text-navy/65">
                      {day.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        );
      })}
    </div>
  );
}
