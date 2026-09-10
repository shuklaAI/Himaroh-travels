"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { contactFormSchema, type ContactFormInput } from "@/lib/validations/contact";
import { checkRateLimit } from "@/lib/rate-limit";

type Result = { success: true } | { success: false; error: string };

export async function submitEnquiryAction(input: ContactFormInput): Promise<Result> {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  // Honeypot: a real visitor never sees or fills this field (it's visually hidden in the form).
  // A non-empty value means it was filled by a bot — accept silently rather than revealing the trap.
  if (parsed.data.website) {
    return { success: true };
  }

  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = await checkRateLimit(`enquiry:${ip}`);
  if (!rateCheck.allowed) {
    return { success: false, error: "Too many messages sent recently. Please try again in a few minutes." };
  }

  try {
    await prisma.enquiry.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone,
        message: parsed.data.message,
        packageInterest: parsed.data.packageInterest || null,
        status: "NEW",
      },
    });
    return { success: true };
  } catch (err) {
    console.error("submitEnquiryAction failed:", err);
    return { success: false, error: "Something went wrong sending your message. Please try WhatsApp instead." };
  }
}
