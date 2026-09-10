import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(2000),
  packageInterest: z.string().trim().max(160).optional().or(z.literal("")),
  // Honeypot field — real users never fill this in; bots that auto-fill every field will.
  website: z.string().max(0, "").optional().or(z.literal("")),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
