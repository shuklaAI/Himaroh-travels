"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Lock, Unlock, Trash2 } from "lucide-react";
import { setDepartureStatusAction, deleteDepartureAction } from "@/app/admin/(dashboard)/departures/actions";

export function DepartureRowActions({ departureId, status }: { departureId: string; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = status === "OPEN" ? "CLOSED" : "OPEN";
    startTransition(async () => {
      await setDepartureStatusAction(departureId, next);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("Delete this departure? This can't be undone.")) return;
    startTransition(async () => {
      const result = await deleteDepartureAction(departureId);
      if (!result.success) alert(result.error);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={`/admin/departures/${departureId}`} className="text-navy/60 hover:text-navy" title="Edit">
        <Pencil className="h-4 w-4" />
      </Link>
      {(status === "OPEN" || status === "CLOSED") && (
        <button onClick={handleToggle} disabled={isPending} className="text-navy/60 hover:text-navy" title={status === "OPEN" ? "Close booking" : "Reopen booking"}>
          {status === "OPEN" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </button>
      )}
      <button onClick={handleDelete} disabled={isPending} className="text-navy/60 hover:text-red-600" title="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
