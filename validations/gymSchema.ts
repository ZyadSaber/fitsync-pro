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
  owner_id: z.string().optional(),
});

export type GymFormData = z.infer<typeof gymSchema>;

// Status change for a gym billing record (paid stamps paid_at).
export const billingStatusSchema = z.object({
  status: z.enum(["paid", "pending", "failed", "refunded"]),
  paidAt: z.string().optional(),
});

export type BillingStatusData = z.infer<typeof billingStatusSchema>;
