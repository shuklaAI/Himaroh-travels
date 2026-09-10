"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminAction, AuthorizationError } from "@/lib/auth/guard";
import { logAudit } from "@/lib/audit";
import { departureFormSchema, type DepartureFormInput } from "@/lib/validations/departure";

const DEPARTURE_EDIT_ROLES = ["SUPER_ADMIN", "OPERATIONS_ADMIN"] as const;

export type DepartureActionResult =
  | { success: true; departureId: string }
  | { success: false; error: string };

export async function createDepartureAction(input: DepartureFormInput): Promise<DepartureActionResult> {
  try {
    const admin = await requireAdminAction([...DEPARTURE_EDIT_ROLES]);
    const parsed = departureFormSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    const data = parsed.data;

    const pkg = await prisma.package.findUnique({ where: { id: data.packageId } });
    if (!pkg) return { success: false, error: "Selected package not found." };

    const departure = await prisma.$transaction(async (tx) => {
      const created = await tx.departure.create({
        data: {
          packageId: data.packageId,
          departureDate: new Date(data.departureDate),
          totalCapacity: data.totalCapacity,
          status: data.status,
          notes: data.notes || null,
          pricing: { create: data.pricing.map((p) => ({ sharingType: p.sharingType, price: p.price })) },
        },
      });
      return created;
    });

    await logAudit({
      adminUserId: admin.id,
      action: "DEPARTURE_CREATED",
      entityType: "Departure",
      entityId: departure.id,
      newValue: { ...data },
    });

    revalidatePath("/admin/departures");
    revalidatePath(`/trips/${pkg.slug}`);
    revalidatePath("/trips");
    revalidatePath("/");
    return { success: true, departureId: departure.id };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("createDepartureAction failed:", err);
    return { success: false, error: "Something went wrong while creating the departure." };
  }
}

export async function updateDepartureAction(
  departureId: string,
  input: DepartureFormInput
): Promise<DepartureActionResult> {
  try {
    const admin = await requireAdminAction([...DEPARTURE_EDIT_ROLES]);
    const parsed = departureFormSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    const data = parsed.data;

    const previous = await prisma.departure.findUnique({
      where: { id: departureId },
      include: { pricing: true, package: true },
    });
    if (!previous) return { success: false, error: "Departure not found." };

    if (data.totalCapacity < previous.bookedSeats) {
      return {
        success: false,
        error: `Capacity can't be set below ${previous.bookedSeats} — that many seats are already booked.`,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.departure.update({
        where: { id: departureId },
        data: {
          departureDate: new Date(data.departureDate),
          totalCapacity: data.totalCapacity,
          status: data.status,
          notes: data.notes || null,
        },
      });

      // Upsert each submitted pricing row, and deactivate any sharing type removed from the form
      for (const row of data.pricing) {
        await tx.pricing.upsert({
          where: { departureId_sharingType: { departureId, sharingType: row.sharingType } },
          update: { price: row.price, isActive: true },
          create: { departureId, sharingType: row.sharingType, price: row.price },
        });
      }
      const submittedTypes = data.pricing.map((p) => p.sharingType);
      await tx.pricing.updateMany({
        where: { departureId, sharingType: { notIn: submittedTypes } },
        data: { isActive: false },
      });
    });

    await logAudit({
      adminUserId: admin.id,
      action: "DEPARTURE_UPDATED",
      entityType: "Departure",
      entityId: departureId,
      previousValue: {
        departureDate: previous.departureDate,
        totalCapacity: previous.totalCapacity,
        status: previous.status,
        pricing: previous.pricing,
      },
      newValue: data,
    });

    revalidatePath("/admin/departures");
    revalidatePath(`/trips/${previous.package.slug}`);
    revalidatePath("/trips");
    revalidatePath("/");
    return { success: true, departureId };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("updateDepartureAction failed:", err);
    return { success: false, error: "Something went wrong while updating the departure." };
  }
}

/** Quick action used from the list page: Close booking / Reopen booking. */
export async function setDepartureStatusAction(
  departureId: string,
  status: "OPEN" | "CLOSED"
): Promise<DepartureActionResult> {
  try {
    const admin = await requireAdminAction([...DEPARTURE_EDIT_ROLES]);
    const previous = await prisma.departure.findUnique({ where: { id: departureId } });
    if (!previous) return { success: false, error: "Departure not found." };

    await prisma.departure.update({ where: { id: departureId }, data: { status } });

    await logAudit({
      adminUserId: admin.id,
      action: "DEPARTURE_STATUS_CHANGED",
      entityType: "Departure",
      entityId: departureId,
      previousValue: { status: previous.status },
      newValue: { status },
    });

    revalidatePath("/admin/departures");
    revalidatePath("/trips");
    return { success: true, departureId };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("setDepartureStatusAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

export async function deleteDepartureAction(departureId: string): Promise<DepartureActionResult> {
  try {
    const admin = await requireAdminAction([...DEPARTURE_EDIT_ROLES]);
    const departure = await prisma.departure.findUnique({ where: { id: departureId } });
    if (!departure) return { success: false, error: "Departure not found." };

    if (departure.bookedSeats > 0) {
      return { success: false, error: "Can't delete a departure that already has bookings. Cancel it instead." };
    }

    await prisma.$transaction([
      prisma.pricing.deleteMany({ where: { departureId } }),
      prisma.departure.delete({ where: { id: departureId } }),
    ]);

    await logAudit({
      adminUserId: admin.id,
      action: "DEPARTURE_DELETED",
      entityType: "Departure",
      entityId: departureId,
      previousValue: departure,
    });

    revalidatePath("/admin/departures");
    revalidatePath("/trips");
    return { success: true, departureId };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("deleteDepartureAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}
