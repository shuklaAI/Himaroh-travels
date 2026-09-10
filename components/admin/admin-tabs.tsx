"use client";

import { useState } from "react";

export function AdminTabs({ tabs }: { tabs: { label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="mb-6 flex gap-1 border-b border-navy/10">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              active === i ? "border-b-2 border-gold text-navy" : "text-navy/45 hover:text-navy/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs[active]?.content}
    </div>
  );
}
