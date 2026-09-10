import { z } from "zod";

export const sharingTypeSchema = z.enum(["SINGLE", "DOUBLE", "TRIPLE", "QUAD", "CHILD"]);

export const travellerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is too short").max(120),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number").optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  dateOfBirth: z.string().refine((v) => !v || !isNaN(Date.parse(v)), "Invalid date").optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  govtIdType: z.string().trim().max(60).optional().or(z.literal("")),
  govtIdNumber: z.string().trim().max(60).optional().or(z.literal("")),
  emergencyContactName: z.string().trim().max(120).optional().or(z.literal("")),
  emergencyContactPhone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  medicalNotes: z.string().trim().max(1000).optional().or(z.literal("")),
  specialRequirements: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const bookingRequestSchema = z.object({
  departureId: z.string().cuid(),
  sharingType: sharingTypeSchema,
  travellerCount: z.number().int().min(1, "At least 1 traveller is required").max(20),
  pickupPoint: z.string().trim().min(2).max(200),
  accommodationId: z.string().cuid().optional().nullable(),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),

  contactName: z.string().trim().min(2, "Name is too short").max(120),
  contactPhone: z.string().trim().regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  contactEmail: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),

  travellers: z.array(travellerSchema).min(1),
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
export type TravellerInput = z.infer<typeof travellerSchema>;

// A booking request must have exactly `travellerCount` traveller records —
// enforced with .superRefine so the error message is specific and useful.
export const bookingRequestSchemaStrict = bookingRequestSchema.superRefine((data, ctx) => {
  if (data.travellers.length !== data.travellerCount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Expected ${data.travellerCount} traveller record(s), received ${data.travellers.length}`,
      path: ["travellers"],
    });
  }
});
