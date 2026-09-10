"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminAction, AuthorizationError } from "@/lib/auth/guard";
import { logAudit } from "@/lib/audit";
import {
  itineraryDaySchema,
  listItemSchema,
  faqFormSchema,
  packageImageSchema,
} from "@/lib/validations/content";

const ROLES = ["SUPER_ADMIN", "CONTENT_MANAGER"] as const;

type Result = { success: true } | { success: false; error: string };

function revalidateContent(slug: string) {
  revalidatePath(`/admin/content/${slug}`);
  revalidatePath(`/trips/${slug}`);
}

// ---------------------------------------------------------------- Itinerary

export async function upsertItineraryDayAction(
  packageId: string,
  slug: string,
  dayId: string | null,
  input: unknown
): Promise<Result> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    const parsed = itineraryDaySchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    if (dayId) {
      const previous = await prisma.itineraryDay.findUnique({ where: { id: dayId } });
      await prisma.itineraryDay.update({ where: { id: dayId }, data: parsed.data });
      await logAudit({ adminUserId: admin.id, action: "ITINERARY_DAY_UPDATED", entityType: "ItineraryDay", entityId: dayId, previousValue: previous, newValue: parsed.data });
    } else {
      const count = await prisma.itineraryDay.count({ where: { packageId } });
      const created = await prisma.itineraryDay.create({ data: { ...parsed.data, packageId, position: count } });
      await logAudit({ adminUserId: admin.id, action: "ITINERARY_DAY_CREATED", entityType: "ItineraryDay", entityId: created.id, newValue: parsed.data });
    }

    revalidateContent(slug);
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("upsertItineraryDayAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

export async function deleteItineraryDayAction(dayId: string, slug: string): Promise<Result> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    await prisma.itineraryDay.delete({ where: { id: dayId } });
    await logAudit({ adminUserId: admin.id, action: "ITINERARY_DAY_DELETED", entityType: "ItineraryDay", entityId: dayId });
    revalidateContent(slug);
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("deleteItineraryDayAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

/** Swaps `position` with the adjacent day — simple, dependency-free reordering. */
export async function moveItineraryDayAction(dayId: string, direction: "up" | "down", slug: string): Promise<Result> {
  try {
    await requireAdminAction([...ROLES]);
    const day = await prisma.itineraryDay.findUnique({ where: { id: dayId } });
    if (!day) return { success: false, error: "Day not found." };

    const neighbor = await prisma.itineraryDay.findFirst({
      where: {
        packageId: day.packageId,
        position: direction === "up" ? { lt: day.position } : { gt: day.position },
      },
      orderBy: { position: direction === "up" ? "desc" : "asc" },
    });
    if (!neighbor) return { success: true }; // already at the edge — no-op

    await prisma.$transaction([
      prisma.itineraryDay.update({ where: { id: day.id }, data: { position: neighbor.position } }),
      prisma.itineraryDay.update({ where: { id: neighbor.id }, data: { position: day.position } }),
    ]);

    revalidateContent(slug);
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("moveItineraryDayAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

// ---------------------------------------------------------- Inclusions / Exclusions

async function addListItem(model: "inclusion" | "exclusion", packageId: string, label: string, slug: string): Promise<Result> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    const parsed = listItemSchema.safeParse({ label });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const count = await (prisma[model] as any).count({ where: { packageId } });
    const created = await (prisma[model] as any).create({ data: { packageId, label: parsed.data.label, position: count } });

    await logAudit({ adminUserId: admin.id, action: `${model.toUpperCase()}_CREATED`, entityType: model, entityId: created.id, newValue: parsed.data });
    revalidateContent(slug);
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error(`add${model} failed:`, err);
    return { success: false, error: "Something went wrong." };
  }
}

async function deleteListItem(model: "inclusion" | "exclusion", id: string, slug: string): Promise<Result> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    await (prisma[model] as any).delete({ where: { id } });
    await logAudit({ adminUserId: admin.id, action: `${model.toUpperCase()}_DELETED`, entityType: model, entityId: id });
    revalidateContent(slug);
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error(`delete${model} failed:`, err);
    return { success: false, error: "Something went wrong." };
  }
}

export const addInclusionAction = (packageId: string, label: string, slug: string) => addListItem("inclusion", packageId, label, slug);
export const deleteInclusionAction = (id: string, slug: string) => deleteListItem("inclusion", id, slug);
export const addExclusionAction = (packageId: string, label: string, slug: string) => addListItem("exclusion", packageId, label, slug);
export const deleteExclusionAction = (id: string, slug: string) => deleteListItem("exclusion", id, slug);

// ---------------------------------------------------------------------- FAQs

export async function upsertFaqAction(packageId: string, slug: string, faqId: string | null, input: unknown): Promise<Result> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    const parsed = faqFormSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    if (faqId) {
      await prisma.fAQ.update({ where: { id: faqId }, data: parsed.data });
      await logAudit({ adminUserId: admin.id, action: "FAQ_UPDATED", entityType: "FAQ", entityId: faqId, newValue: parsed.data });
    } else {
      const count = await prisma.fAQ.count({ where: { packageId } });
      const created = await prisma.fAQ.create({ data: { ...parsed.data, packageId, position: count } });
      await logAudit({ adminUserId: admin.id, action: "FAQ_CREATED", entityType: "FAQ", entityId: created.id, newValue: parsed.data });
    }

    revalidateContent(slug);
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("upsertFaqAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

export async function deleteFaqAction(faqId: string, slug: string): Promise<Result> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    await prisma.fAQ.delete({ where: { id: faqId } });
    await logAudit({ adminUserId: admin.id, action: "FAQ_DELETED", entityType: "FAQ", entityId: faqId });
    revalidateContent(slug);
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("deleteFaqAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

// ------------------------------------------------------------- Package images

export async function addPackageImageAction(packageId: string, slug: string, input: unknown): Promise<Result> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    const parsed = packageImageSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const count = await prisma.packageImage.count({ where: { packageId } });
    if (parsed.data.isCover) {
      await prisma.packageImage.updateMany({ where: { packageId }, data: { isCover: false } });
    }
    const created = await prisma.packageImage.create({
      data: { packageId, url: parsed.data.url, altText: parsed.data.altText || null, isCover: parsed.data.isCover, position: count },
    });

    await logAudit({ adminUserId: admin.id, action: "PACKAGE_IMAGE_ADDED", entityType: "PackageImage", entityId: created.id, newValue: parsed.data });
    revalidateContent(slug);
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("addPackageImageAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

export async function deletePackageImageAction(imageId: string, slug: string): Promise<Result> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    await prisma.packageImage.delete({ where: { id: imageId } });
    await logAudit({ adminUserId: admin.id, action: "PACKAGE_IMAGE_DELETED", entityType: "PackageImage", entityId: imageId });
    revalidateContent(slug);
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("deletePackageImageAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}
