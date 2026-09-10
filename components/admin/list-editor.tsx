"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Item = { id: string; label: string };

export function ListEditor({
  items,
  onAdd,
  onDelete,
  placeholder,
}: {
  items: Item[];
  onAdd: (label: string) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  placeholder: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState("");

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between rounded-lg border border-navy/10 bg-white px-4 py-2.5 text-sm">
          <span className="text-navy/80">{item.label}</span>
          <button
            onClick={() => startTransition(async () => { await onDelete(item.id); router.refresh(); })}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="h-10 flex-1 rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold"
        />
        <Button
          size="sm"
          disabled={isPending || !value.trim()}
          onClick={() =>
            startTransition(async () => {
              await onAdd(value);
              setValue("");
              router.refresh();
            })
          }
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </Button>
      </div>
    </div>
  );
}
