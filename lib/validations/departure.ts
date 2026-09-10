import { z } from "zod";

export const pricingRowSchema = z.object({
  sharingType: z.enum(["SINGLE", "DOUBLE", "TRIPLE", "QUAD", "CHILD"]),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
});

export const departureFormSchema = z.object({
  packageId: z.string().cuid("Please select a package"),
  departureDate: z.string().refine((v) => !isNaN(Date.parse(v)), "Invalid date"),
  totalCapacity: z.coerce.number().int().min(1, "Capacity must be at least 1").max(200),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(["OPEN", "CLOSED", "SOLD_OUT", "CANCELLED", "COMPLETED"]).default("OPEN"),
  pricing: z.array(pricingRowSchema).min(1, "At least one sharing-type price is required"),
});

export type DepartureFormInput = z.infer<typeof departureFormSchema>;
