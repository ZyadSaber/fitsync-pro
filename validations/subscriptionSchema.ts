import { z } from "zod";

export const planFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug required")
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscores only"),
  description: z.string().optional().or(z.literal("")),
  price_egp: z.string(),       // "" = contact pricing (null in DB)
  billing_cycle: z.enum(["monthly", "yearly"]),
  duration_days: z.string().min(1, "Duration required"),
  member_limit: z.string(),    // "" = unlimited (null in DB)
  type: z.enum(["gym", "online_coach", "both"]),
  features: z.string(),        // newline-separated → string[] on save
  is_active: z.boolean(),
});

export type PlanFormData = z.infer<typeof planFormSchema>;

export const invoiceFormSchema = z.object({
  gym_id: z.string().min(1, "Select a gym"),
  subscription_id: z.string().min(1, "No active subscription found for this gym"),
  amount_egp: z.string().min(1, "Amount required"),
  billing_cycle: z.enum(["monthly", "yearly"]),
  period_start: z.string().min(1, "Start date required"),
  period_end: z.string().min(1, "End date required"),
  next_billing_at: z.string().optional().or(z.literal("")),
  status: z.enum(["paid", "pending", "failed", "refunded"]),
  paid_at: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
