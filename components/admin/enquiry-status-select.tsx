"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEnquiryStatusAction } from "@/app/admin/(dashboard)/enquiries/actions";

const STATUSES = ["NEW", "CONTACTED", "RESOLVED"];

export function EnquiryStatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(async () => {
          await updateEnquiryStatusAction(id, e.target.value);
          router.refresh();
        })
      }
      className="h-9 rounded-lg border border-navy/15 bg-white px-2 text-xs outline-none focus:border-gold"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
