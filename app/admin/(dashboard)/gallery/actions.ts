"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminAction, AuthorizationError } from "@/lib/auth/guard";
import { logAudit } from "@/lib/audit";
import { galleryImageSchema } from "@/lib/validations/site-content";

const ROLES = ["SUPER_ADMIN", "CONTENT_MANAGER"] as const;
type Result = { success: true } | { success: false; error: string };

export async function addGalleryImageAction(input: unknown): Promise<Result> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    const parsed = galleryImageSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const count = await prisma.galleryImage.count();
    const created = await prisma.galleryImage.create({
      data: { url: parsed.data.url, altText: parsed.data.altText || null, category: parsed.data.category || null, position: count },
    });

    await logAudit({ adminUserId: admin.id, action: "GALLERY_IMAGE_ADDED", entityType: "GalleryImage", entityId: created.id, newValue: parsed.data });
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("addGalleryImageAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

export async function deleteGalleryImageAction(id: string): Promise<Result> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    await prisma.galleryImage.delete({ where: { id } });
    await logAudit({ adminUserId: admin.id, action: "GALLERY_IMAGE_DELETED", entityType: "GalleryImage", entityId: id });
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("deleteGalleryImageAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}
