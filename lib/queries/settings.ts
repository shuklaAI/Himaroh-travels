import { prisma } from "@/lib/db";
import { SITE_DEFAULTS } from "@/lib/constants";

/**
 * Reads editable site settings from the database, falling back to hardcoded
 * defaults only when a row hasn't been set yet by an admin. Admin edits
 * (Section 27 / Section 12 "Site Settings") flow through here automatically —
 * no code changes needed to update phone, email, WhatsApp number, etc.
 */
export async function getSiteSettings() {
  const rows = await prisma.siteSetting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return {
    companyName: map.company_name ?? SITE_DEFAULTS.companyName,
    phone: map.phone ?? SITE_DEFAULTS.phone,
    email: map.email ?? SITE_DEFAULTS.email,
    instagram: map.instagram ?? SITE_DEFAULTS.instagram,
    whatsappNumber: map.whatsapp_number ?? SITE_DEFAULTS.whatsappNumber,
    businessHours: map.business_hours ?? "Mon–Sat, 10:00 AM – 7:00 PM IST",
    cancellationPolicySummary:
      map.cancellation_policy_summary ??
      "The advance amount is non-refundable. Refer to the full cancellation policy page for details.",
  };
}
