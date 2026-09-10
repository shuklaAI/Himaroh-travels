import { z } from "zod";

export const accommodationFormSchema = z.object({
  name: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(60),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  images: z.string().optional().or(z.literal("")), // comma-separated URLs
  amenities: z.string().optional().or(z.literal("")), // comma-separated
  capacity: z.coerce.number().int().positive().optional().nullable(),
  availableUnits: z.coerce.number().int().min(0).optional().nullable(),
  isActive: z.boolean(),
  priceAdjustment: z.coerce.number().min(0),
  packageIds: z.array(z.string().cuid()).default([]),
});

export type AccommodationFormInput = z.infer<typeof accommodationFormSchema>;
