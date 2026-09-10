"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addPackageImageAction, deletePackageImageAction } from "@/app/admin/(dashboard)/content/[packageId]/actions";

type Img = { id: string; url: string; altText: string | null; isCover: boolean };
const inputClass = "h-10 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold";

export function PackageImageEditor({ packageId, slug, images }: { packageId: string; slug: string; images: Img[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-xl border border-navy/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.altText ?? ""} className="aspect-square w-full object-cover" />
            {img.isCover && (
              <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-navy">
                <Star className="h-3 w-3" /> Cover
              </span>
            )}
            <button
              onClick={() => startTransition(async () => { await deletePackageImageAction(img.id, slug); router.refresh(); })}
              className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-red-500 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-navy/20 p-4">
        <p className="mb-3 text-sm font-medium text-navy">Add Image</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Image URL" value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} />
          <input placeholder="Alt text" value={alt} onChange={(e) => setAlt(e.target.value)} className={inputClass} />
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            disabled={isPending || !url}
            onClick={() =>
              startTransition(async () => {
                await addPackageImageAction(packageId, slug, { url, altText: alt, isCover: images.length === 0 });
                setUrl("");
                setAlt("");
                router.refresh();
              })
            }
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Image
          </Button>
        </div>
        <p className="mt-2 text-xs text-navy/40">
          Storage upload isn't wired yet (Section 42) — paste a hosted image URL for now. The first
          image added automatically becomes the cover.
        </p>
      </div>
    </div>
  );
}
