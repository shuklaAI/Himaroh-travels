"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Archive, Pencil } from "lucide-react";
import { togglePackagePublishAction, archivePackageAction } from "@/app/admin/(dashboard)/packages/actions";

export function PackageRowActions({ packageId, isPublished }: { packageId: string; isPublished: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleTogglePublish() {
    startTransition(async () => {
      await togglePackagePublishAction(packageId);
      router.refresh();
    });
  }

  function handleArchive() {
    if (!confirm("Archive this package? It will be unpublished and hidden from admin lists.")) return;
    startTransition(async () => {
      await archivePackageAction(packageId);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={`/admin/packages/${packageId}`} className="text-navy/60 hover:text-navy" title="Edit">
        <Pencil className="h-4 w-4" />
      </Link>
      <button onClick={handleTogglePublish} disabled={isPending} className="text-navy/60 hover:text-navy" title={isPublished ? "Unpublish" : "Publish"}>
        {isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      <button onClick={handleArchive} disabled={isPending} className="text-navy/60 hover:text-red-600" title="Archive">
        <Archive className="h-4 w-4" />
      </button>
    </div>
  );
}
