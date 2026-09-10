"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminAction, AuthorizationError } from "@/lib/auth/guard";
import { logAudit } from "@/lib/audit";
import { couponFormSchema, type CouponFormInput } from "@/lib/validations/site-content";

const ROLES = ["SUPER_ADMIN"] as const;
type Result = { success: true; id: string } | { success: false; error: string };

function toData(d: CouponFormInput) {
  return {
    code: d.code.trim().toUpperCase(),
    discountType: d.discountType,
    discountValue: d.discountValue,
    maxDiscountAmount: d.maxDiscountAmount ?? null,
    minBookingAmount: d.minBookingAmount ?? null,
    startDate: new Date(d.startDate),
    expiryDate: new Date(d.expiryDate),
    usageLimit: d.usageLimit ?? null,
    perCustomerLimit: d.perCustomerLimit ?? null,
    isActive: d.isActive,
  };
}

export async function createCouponAction(input: CouponFormInput): Promise<Result> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    const parsed = couponFormSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code.toUpperCase() } });
    if (existing) return { success: false, error: "A coupon with this code already exists." };

    const created = await prisma.coupon.create({ data: toData(parsed.data) });
    await logAudit({ adminUserId: admin.id, action: "COUPON_CREATED", entityType: "Coupon", entityId: created.id, newValue: parsed.data });

    revalidatePath("/admin/coupons");
    return { success: true, id: created.id };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("createCouponAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

export async function updateCouponAction(id: string, input: CouponFormInput): Promise<Result> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    const parsed = couponFormSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const previous = await prisma.coupon.findUnique({ where: { id } });
    if (!previous) return { success: false, error: "Coupon not found." };

    await prisma.coupon.update({ where: { id }, data: toData(parsed.data) });
    await logAudit({ adminUserId: admin.id, action: "COUPON_UPDATED", entityType: "Coupon", entityId: id, previousValue: previous, newValue: parsed.data });

    revalidatePath("/admin/coupons");
    return { success: true, id };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("updateCouponAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

export async function deleteCouponAction(id: string): Promise<Result> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    const usageCount = await prisma.couponUsage.count({ where: { couponId: id } });
    if (usageCount > 0) {
      return { success: false, error: "This coupon has been used in bookings — deactivate it instead of deleting." };
    }
    await prisma.coupon.delete({ where: { id } });
    await logAudit({ adminUserId: admin.id, action: "COUPON_DELETED", entityType: "Coupon", entityId: id });
    revalidatePath("/admin/coupons");
    return { success: true, id };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("deleteCouponAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}
