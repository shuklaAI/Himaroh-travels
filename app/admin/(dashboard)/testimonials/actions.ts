"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminAction, AuthorizationError } from "@/lib/auth/guard";
import { logAudit } from "@/lib/audit";
import { testimonialFormSchema, type TestimonialFormInput } from "@/lib/validations/site-content";

const ROLES = ["SUPER_ADMIN", "CONTENT_MANAGER"] as const;
type Result = { success: true } | { success: false; error: string };

function toData(d: TestimonialFormInput) {
  return {
    customerName: d.customerName,
    location: d.location || null,
    rating: d.rating,
    content: d.content,
    imageUrl: d.imageUrl || null,
    packageId: d.packageId || null,
    isVerified: d.isVerified,
    isPublished: d.isPublished,
  };
}

export async function upsertTestimonialAction(id: string | null, input: TestimonialFormInput): Promise<Result> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    const parsed = testimonialFormSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    if (id) {
      await prisma.testimonial.update({ where: { id }, data: toData(parsed.data) });
      await logAudit({ adminUserId: admin.id, action: "TESTIMONIAL_UPDATED", entityType: "Testimonial", entityId: id, newValue: parsed.data });
    } else {
      const created = await prisma.testimonial.create({ data: toData(parsed.data) });
      await logAudit({ adminUserId: admin.id, action: "TESTIMONIAL_CREATED", entityType: "Testimonial", entityId: created.id, newValue: parsed.data });
    }

    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("upsertTestimonialAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}

export async function deleteTestimonialAction(id: string): Promise<Result> {
  try {
    const admin = await requireAdminAction([...ROLES]);
    await prisma.testimonial.delete({ where: { id } });
    await logAudit({ adminUserId: admin.id, action: "TESTIMONIAL_DELETED", entityType: "Testimonial", entityId: id });
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("deleteTestimonialAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}
