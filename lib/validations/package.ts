import { z } from "zod";

export const packageFormSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .min(3)
    .max(160),
  subtitle: z.string().trim().max(200).optional().or(z.literal("")),
  region: z.string().trim().max(120).optional().or(z.literal("")),
  country: z.string().trim().max(80).default("India"),
  durationNights: z.coerce.number().int().min(0).max(60),
  durationDays: z.coerce.number().int().min(1).max(60),
  difficulty: z.string().trim().max(60).optional().or(z.literal("")),
  altitudeFt: z.coerce.number().int().min(0).optional().nullable(),
  distanceKm: z.coerce.number().min(0).optional().nullable(),
  pickupCity: z.string().trim().max(120).optional().or(z.literal("")),
  pickupPoint: z.string().trim().max(200).optional().or(z.literal("")),
  overview: z.string().trim().max(4000).optional().or(z.literal("")),
  highlights: z.string().trim().optional().or(z.literal("")), // comma-separated in the form, split before saving
  isPublished: z.coerce.boolean().default(false),
  isFeatured: z.coerce.boolean().default(false),
  metaTitle: z.string().trim().max(160).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(300).optional().or(z.literal("")),
});

export type PackageFormInput = z.infer<typeof packageFormSchema>;
