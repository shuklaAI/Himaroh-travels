import { z } from "zod";

export const itineraryDaySchema = z.object({
  dayNumber: z.coerce.number().int().min(0).max(60),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(2).max(3000),
});

export const listItemSchema = z.object({
  label: z.string().trim().min(1).max(300),
});

export const faqFormSchema = z.object({
  question: z.string().trim().min(3).max(300),
  answer: z.string().trim().min(3).max(3000),
  isPublished: z.boolean(),
});

export const packageImageSchema = z.object({
  url: z.string().trim().url("Enter a valid image URL"),
  altText: z.string().trim().max(200).optional().or(z.literal("")),
  isCover: z.boolean(),
});

export type ItineraryDayInput = z.infer<typeof itineraryDaySchema>;
export type ListItemInput = z.infer<typeof listItemSchema>;
export type FaqFormInput = z.infer<typeof faqFormSchema>;
export type PackageImageInput = z.infer<typeof packageImageSchema>;
