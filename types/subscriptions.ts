import type { InstallmentRow } from "@/validations/subscriptionSchema";

export type BillingCycle = "monthly" | "yearly";
export type TenantType = "gym" | "online_coach";

export interface AssignPlanForm {
  tenant_type:   TenantType;
  gym_id:        string;
  coach_id:      string;
  plan_id:       string;
  billing_cycle: BillingCycle;
  started_at:    string;
  quantity:      string;
  notes:         string;
  // Contact-pricing ("Custom") plans let the admin negotiate every term of the
  // private plan that gets created. Ignored for fixed-price catalog plans.
  custom_price:         string;   // negotiated price (required for contact plans)
  custom_member_limit:  string;   // "" = unlimited
  custom_coach_limit:   string;   // gym plans only — "" = unlimited
  custom_duration_days: string;
  custom_features:      string[];
  // Payment schedule + transient UI helpers (split count, feature draft input).
  installments: InstallmentRow[];
  splitCount:   string;
  newFeature:   string;
}

export type BillingStatus = "paid" | "pending" | "failed" | "refunded";
export type SubscriptionPlanType = "gym" | "online_coach";

export interface SubscriptionPlanStats {
  id: string;
  name: string;
  description: string | null;
  price_egp: number | null;
  billing_cycle: BillingCycle;
  duration_days: number;
  member_limit: number | null;
  coach_limit: number | null;   // gym plans only — coaches who can access the platform
  type: SubscriptionPlanType;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  active_tenant_count: number;
  total_tenant_count: number;
  mrr_egp: number;
}

export interface BillingRecordListItem {
  id: string;
  gym_id: string | null;
  coach_id: string | null;
  tenant_name: string;
  tenant_type: TenantType;
  subscription_id: string;
  amount_egp: number;
  period_start: string;
  period_end: string;
  status: BillingStatus;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}
