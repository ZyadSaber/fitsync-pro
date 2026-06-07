import { z } from "zod";

export const planFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional().or(z.literal("")),
  price_egp: z.string(),       // "" = contact pricing (null in DB)
  billing_cycle: z.enum(["monthly", "yearly"]),
  duration_days: z.string().min(1, "Duration required"),
  member_limit: z.string(),    // "" = unlimited (null in DB)
  coach_limit: z.string(),     // gym plans only — "" = unlimited (null in DB)
  type: z.enum(["gym", "online_coach"]),
  features: z.array(z.string()).default([]),
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

export const installmentRowSchema = z.object({
  due_date: z.string().min(1, "Date required"),
  amount:   z.string().min(1, "Amount required"),
  label:    z.string().optional().or(z.literal("")),
});
export type InstallmentRow = z.infer<typeof installmentRowSchema>;

export const assignPlanSchema = z.object({
  tenant_type:   z.enum(["gym", "online_coach"]),
  // Empty-string defaults, not optional: every field is a controlled form input
  // that always carries a string, so the inferred type stays `string` (no
  // `| undefined`) and matches AssignPlanForm.
  gym_id:        z.string(),
  coach_id:      z.string(),
  plan_id:       z.string().min(1, "Select a plan"),
  billing_cycle: z.enum(["monthly", "yearly"]),
  started_at:    z.string().min(1, "Start date required"),
  quantity:      z.string().min(1),
  notes:         z.string(),
  custom_price:  z.string(),
  custom_member_limit:  z.string(),
  custom_coach_limit:   z.string(),
  custom_duration_days: z.string(),
  custom_features:      z.array(z.string()).default([]),
  // Payment schedule + transient UI helpers. Rows are validated strictly in the
  // service via installmentRowSchema; here they stay loose so the form's
  // own onSubmit handler can surface friendlier toasts on empty/zero amounts.
  installments: z.array(z.object({
    due_date: z.string(),
    amount:   z.string(),
    label:    z.string().optional().or(z.literal("")),
  })).default([]),
  splitCount: z.string().default("2"),
  newFeature: z.string().default(""),
}).superRefine((d, ctx) => {
  const isGym = d.tenant_type === "gym";
  if (isGym ? !d.gym_id : !d.coach_id) {
    ctx.addIssue({
      code: "custom",
      message: isGym ? "Select a gym" : "Select a coach",
      path: [isGym ? "gym_id" : "coach_id"],
    });
  }
});

export type AssignPlanFormData = z.infer<typeof assignPlanSchema>;
