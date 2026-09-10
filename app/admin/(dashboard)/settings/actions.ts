"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminAction, AuthorizationError } from "@/lib/auth/guard";
import { logAudit } from "@/lib/audit";
import { siteSettingsFormSchema, type SiteSettingsFormInput } from "@/lib/validations/site-content";

type Result = { success: true } | { success: false; error: string };

export async function updateSiteSettingsAction(input: SiteSettingsFormInput): Promise<Result> {
  try {
    const admin = await requireAdminAction(["SUPER_ADMIN"]);
    const parsed = siteSettingsFormSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const previous = await prisma.siteSetting.findMany();
    const previousMap = Object.fromEntries(previous.map((r) => [r.key, r.value]));

    await prisma.$transaction(
      Object.entries(parsed.data).map(([key, value]) =>
        prisma.siteSetting.upsert({ where: { key }, update: { value: value ?? "" }, create: { key, value: value ?? "" } })
      )
    );

    await logAudit({
      adminUserId: admin.id,
      action: "SITE_SETTINGS_UPDATED",
      entityType: "SiteSetting",
      previousValue: previousMap,
      newValue: parsed.data,
    });

    // Site settings affect nearly every public page (footer, WhatsApp button, contact info)
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) return { success: false, error: err.message };
    console.error("updateSiteSettingsAction failed:", err);
    return { success: false, error: "Something went wrong." };
  }
}
