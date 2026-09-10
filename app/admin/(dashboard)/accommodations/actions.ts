"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminAction, AuthorizationError } from "@/lib/auth/guard";
import { logAudit } from "@/lib/audit";
import { accommodationFormSchema, type AccommodationFormInput } from "@/lib/validations/accommodation";

const ROLES = ["SUPER_ADMIN", "OPERATIONS_ADMIN"] as const;

type ActionResult = { success: true; id: string } | { success: false; error: string };

function toData(data: AccommodationFormInput) {
  return {
    name: data.name,
    category: data.category,
    description: data.description || null,
    location: data.location || null,
    images: data.images ? data.images.split(",").map((s) => s.trim()).filter(Boolean) : [],
    amenities: data.amenities ? data.amenities.split(",").map((s) => s.trim()).filter(Boolean) : [],
    capacity: data.capacity ?? null,
    availableUnits: data.availableUnits ?? null,
    isActive: data.isActive,
    priceAdjustment: data.priceAdjustment,
  };
}

export async function createAccommodationAction(input: AccommodationFormInput): Promise<ActionResult> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    const parsed = accommodationFormSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const acc = await prisma.accommodation.create({
      data: {
        ...toData(parsed.data),
        packages: { create: parsed.data.packageIds.map((packageId) => ({ packageId })) },
      },
    });

    await logAudit({ adminUserId: admin.id, action: "ACCOMMODATION_CREATED", entityType: "Accommodation", entityId: acc.id, newValue: parsed.data });

    revalidatePath("/admin/accommodations");
    revalidatePath("/trips");
    return { success: true, id: acc.id };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("createAccommodationAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

export async function updateAccommodationAction(id: string, input: AccommodationFormInput): Promise<ActionResult> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    const parsed = accommodationFormSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const previous = await prisma.accommodation.findUnique({ where: { id } });
    if (!previous) return { success: false, error: "Accommodation not found." };

    await prisma.$transaction([
      prisma.accommodation.update({ where: { id }, data: toData(parsed.data) }),
      prisma.packageAccommodation.deleteMany({ where: { accommodationId: id } }),
      prisma.packageAccommodation.createMany({
        data: parsed.data.packageIds.map((packageId) => ({ accommodationId: id, packageId })),
        skipDuplicates: true,
      }),
    ]);

    await logAudit({ adminUserId: admin.id, action: "ACCOMMODATION_UPDATED", entityType: "Accommodation", entityId: id, previousValue: previous, newValue: parsed.data });

    revalidatePath("/admin/accommodations");
    revalidatePath("/trips");
    return { success: true, id };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("updateAccommodationAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

export async function deleteAccommodationAction(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    const bookingCount = await prisma.booking.count({ where: { accommodationId: id } });
    if (bookingCount > 0) {
      return { success: false, error: "Can't delete — this accommodation is referenced by existing bookings. Mark it inactive instead." };
    }

    await prisma.$transaction([
      prisma.packageAccommodation.deleteMany({ where: { accommodationId: id } }),
      prisma.accommodation.delete({ where: { id } }),
    ]);

    await logAudit({ adminUserId: admin.id, action: "ACCOMMODATION_DELETED", entityType: "Accommodation", entityId: id });

    revalidatePath("/admin/accommodations");
    revalidatePath("/trips");
    return { success: true, id };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("deleteAccommodationAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}
