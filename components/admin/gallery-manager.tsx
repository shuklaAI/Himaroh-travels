"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addGalleryImageAction, deleteGalleryImageAction } from "@/app/admin/(dashboard)/gallery/actions";

type Img = { id: string; url: string; altText: string | null; category: string | null };
const inputClass = "h-10 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold";

export function GalleryManager({ images }: { images: Img[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [category, setCategory] = useState("");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {images.map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-xl border border-navy/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.altText ?? ""} className="aspect-square w-full object-cover" />
            {img.category && (
              <span className="absolute bottom-2 left-2 rounded-full bg-navy/80 px-2 py-0.5 text-[10px] text-ivory">{img.category}</span>
            )}
            <button
              onClick={() => startTransition(async () => { await deleteGalleryImageAction(img.id); router.refresh(); })}
              className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-red-500 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {images.length === 0 && <p className="col-span-full text-sm text-navy/50">No images yet.</p>}
      </div>

      <div className="max-w-xl rounded-xl border border-dashed border-navy/20 p-4">
        <p className="mb-3 text-sm font-medium text-navy">Add Image</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <input placeholder="Image URL" value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass + " sm:col-span-2"} />
          <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} />
          <input placeholder="Alt text" value={alt} onChange={(e) => setAlt(e.target.value)} className={inputClass + " sm:col-span-3"} />
        </div>
        <Button
          size="sm"
          className="mt-3"
          disabled={isPending || !url}
          onClick={() =>
            startTransition(async () => {
              await addGalleryImageAction({ url, altText: alt, category });
              setUrl("");
              setAlt("");
              setCategory("");
              router.refresh();
            })
          }
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Image
        </Button>
      </div>
    </div>
  );
}
