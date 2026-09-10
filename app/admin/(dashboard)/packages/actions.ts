"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminAction, AuthorizationError } from "@/lib/auth/guard";
import { logAudit } from "@/lib/audit";
import { packageFormSchema, type PackageFormInput } from "@/lib/validations/package";

const PACKAGE_EDIT_ROLES = ["SUPER_ADMIN", "CONTENT_MANAGER"] as const;

export type PackageActionResult =
  | { success: true; packageId: string }
  | { success: false; error: string };

function toPackageData(data: PackageFormInput) {
  return {
    title: data.title,
    slug: data.slug,
    subtitle: data.subtitle || null,
    region: data.region || null,
    country: data.country || "India",
    durationNights: data.durationNights,
    durationDays: data.durationDays,
    difficulty: data.difficulty || null,
    altitudeFt: data.altitudeFt ?? null,
    distanceKm: data.distanceKm ?? null,
    pickupCity: data.pickupCity || null,
    pickupPoint: data.pickupPoint || null,
    overview: data.overview || null,
    highlights: data.highlights
      ? data.highlights.split(",").map((h) => h.trim()).filter(Boolean)
      : [],
    isPublished: data.isPublished,
    isFeatured: data.isFeatured,
    metaTitle: data.metaTitle || null,
    metaDescription: data.metaDescription || null,
  };
}

export async function createPackageAction(input: PackageFormInput): Promise<PackageActionResult> {
  try {
    const admin = await requireAdminAction([...PACKAGE_EDIT_ROLES]);
    const parsed = packageFormSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const existing = await prisma.package.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) return { success: false, error: "A package with this slug already exists." };

    const pkg = await prisma.package.create({ data: toPackageData(parsed.data) });

    await logAudit({
      adminUserId: admin.id,
      action: "PACKAGE_CREATED",
      entityType: "Package",
      entityId: pkg.id,
      newValue: toPackageData(parsed.data),
    });

    revalidatePath("/admin/packages");
    revalidatePath("/trips");
    return { success: true, packageId: pkg.id };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("createPackageAction failed:", err);
    return { success: false, error: "Something went wrong while creating the package." };
  }
}

export async function updatePackageAction(
  packageId: string,
  input: PackageFormInput
): Promise<PackageActionResult> {
  try {
    const admin = await requireAdminAction([...PACKAGE_EDIT_ROLES]);
    const parsed = packageFormSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const previous = await prisma.package.findUnique({ where: { id: packageId } });
    if (!previous) return { success: false, error: "Package not found." };

    if (parsed.data.slug !== previous.slug) {
      const slugTaken = await prisma.package.findUnique({ where: { slug: parsed.data.slug } });
      if (slugTaken) return { success: false, error: "A package with this slug already exists." };
    }

    const newData = toPackageData(parsed.data);
    const updated = await prisma.package.update({ where: { id: packageId }, data: newData });

    await logAudit({
      adminUserId: admin.id,
      action: "PACKAGE_UPDATED",
      entityType: "Package",
      entityId: packageId,
      previousValue: previous,
      newValue: newData,
    });

    revalidatePath("/admin/packages");
    revalidatePath(`/trips/${previous.slug}`);
    if (parsed.data.slug !== previous.slug) revalidatePath(`/trips/${parsed.data.slug}`);
    revalidatePath("/trips");
    revalidatePath("/");
    return { success: true, packageId: updated.id };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("updatePackageAction failed:", err);
    return { success: false, error: "Something went wrong while updating the package." };
  }
}

export async function togglePackagePublishAction(packageId: string): Promise<PackageActionResult> {
  try {
    const admin = await requireAdminAction([...PACKAGE_EDIT_ROLES]);
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) return { success: false, error: "Package not found." };

    const updated = await prisma.package.update({
      where: { id: packageId },
      data: { isPublished: !pkg.isPublished },
    });

    await logAudit({
      adminUserId: admin.id,
      action: updated.isPublished ? "PACKAGE_PUBLISHED" : "PACKAGE_UNPUBLISHED",
      entityType: "Package",
      entityId: packageId,
      previousValue: { isPublished: pkg.isPublished },
      newValue: { isPublished: updated.isPublished },
    });

    revalidatePath("/admin/packages");
    revalidatePath("/trips");
    revalidatePath(`/trips/${pkg.slug}`);
    return { success: true, packageId };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("togglePackagePublishAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

/** Soft delete — packages are archived, never hard-deleted, since departures/bookings reference them. */
export async function archivePackageAction(packageId: string): Promise<PackageActionResult> {
  try {
    const admin = await requireAdminAction([...PACKAGE_EDIT_ROLES]);
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) return { success: false, error: "Package not found." };

    await prisma.package.update({
      where: { id: packageId },
      data: { deletedAt: new Date(), isPublished: false },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "PACKAGE_ARCHIVED",
      entityType: "Package",
      entityId: packageId,
    });

    revalidatePath("/admin/packages");
    revalidatePath("/trips");
    return { success: true, packageId };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("archivePackageAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}
