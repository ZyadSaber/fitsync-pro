import { z } from "zod";

export const gymSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().optional(),
  phone: z
    .string()
    .regex(/^[+\d\s()-]{0,20}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  logo_url: z.string().optional(),
});

export type GymFormData = z.infer<typeof gymSchema>;
