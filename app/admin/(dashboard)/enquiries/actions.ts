"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminAction, AuthorizationError } from "@/lib/auth/guard";
import { logAudit } from "@/lib/audit";
import { enquiryStatusSchema } from "@/lib/validations/site-content";

const ROLES = ["SUPER_ADMIN", "OPERATIONS_ADMIN"] as const;
type Result = { success: true } | { success: false; error: string };

export async function updateEnquiryStatusAction(id: string, status: string): Promise<Result> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    const parsed = enquiryStatusSchema.safeParse(status);
    if (!parsed.success) return { success: false, error: "Invalid status." };

    await prisma.enquiry.update({ where: { id }, data: { status: parsed.data } });
    await logAudit({ adminUserId: admin.id, action: "ENQUIRY_STATUS_CHANGED", entityType: "Enquiry", entityId: id, newValue: { status: parsed.data } });

    revalidatePath("/admin/enquiries");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("updateEnquiryStatusAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}
