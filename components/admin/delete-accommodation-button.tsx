"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAccommodationAction } from "@/app/admin/(dashboard)/accommodations/actions";

export function DeleteAccommodationButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm("Delete this accommodation? This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAccommodationAction(id);
      if (result.success) router.push("/admin/accommodations");
      else setError(result.error);
    });
  }

  return (
    <div>
      <Button variant="ghost" onClick={handleDelete} disabled={isPending} className="text-red-600 hover:bg-red-50">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Delete Accommodation
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
