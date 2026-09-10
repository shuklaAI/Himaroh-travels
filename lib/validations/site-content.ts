import { z } from "zod";

export const galleryImageSchema = z.object({
  url: z.string().trim().url("Enter a valid image URL"),
  altText: z.string().trim().max(200).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional().or(z.literal("")),
});

export const testimonialFormSchema = z.object({
  customerName: z.string().trim().min(2).max(160),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5),
  content: z.string().trim().min(10).max(2000),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
  packageId: z.string().cuid().optional().or(z.literal("")),
  isVerified: z.boolean(),
  isPublished: z.boolean(),
});

export const couponFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, hyphens or underscores only"),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.coerce.number().positive(),
    maxDiscountAmount: z.coerce.number().min(0).optional().nullable(),
    minBookingAmount: z.coerce.number().min(0).optional().nullable(),
    startDate: z.string().min(1, "Start date is required"),
    expiryDate: z.string().min(1, "Expiry date is required"),
    usageLimit: z.coerce.number().int().positive().optional().nullable(),
    perCustomerLimit: z.coerce.number().int().positive().optional().nullable(),
    isActive: z.boolean(),
  })
  .refine((d) => new Date(d.expiryDate) > new Date(d.startDate), {
    message: "Expiry date must be after the start date",
    path: ["expiryDate"],
  })
  .refine((d) => d.discountType !== "PERCENTAGE" || d.discountValue <= 100, {
    message: "A percentage discount can't exceed 100",
    path: ["discountValue"],
  });

export const enquiryStatusSchema = z.enum(["NEW", "CONTACTED", "RESOLVED"]);

export const siteSettingsFormSchema = z.object({
  company_name: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email(),
  instagram: z.string().trim().url().optional().or(z.literal("")),
  whatsapp_number: z.string().trim().regex(/^\d{10,15}$/, "Digits only, with country code, no + or spaces"),
  business_hours: z.string().trim().max(160).optional().or(z.literal("")),
  cancellation_policy_summary: z.string().trim().max(500).optional().or(z.literal("")),
});

export type GalleryImageInput = z.infer<typeof galleryImageSchema>;
export type TestimonialFormInput = z.infer<typeof testimonialFormSchema>;
export type CouponFormInput = z.infer<typeof couponFormSchema>;
export type SiteSettingsFormInput = z.infer<typeof siteSettingsFormSchema>;
