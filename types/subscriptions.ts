export type BillingCycle = "monthly" | "yearly";
export type BillingStatus = "paid" | "pending" | "failed" | "refunded";
export type SubscriptionPlanType = "gym" | "online_coach" | "both";

export interface SubscriptionPlanStats {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_egp: number | null;
  billing_cycle: BillingCycle;
  duration_days: number;
  member_limit: number | null;
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
  gym_id: string;
  gym_name: string;
  subscription_id: string;
  amount_egp: number;
  billing_cycle: BillingCycle;
  period_start: string;
  period_end: string;
  next_billing_at: string | null;
  status: BillingStatus;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}
