export type GymPlan =
  | "trial"
  | "starter"
  | "pro"
  | "elite"
  | "enterprise"   // legacy slug — kept for backward compat with old rows
  | "custom"
  | "coach_solo"
  | "coach_pro";

export type GymStatus = "active" | "suspended" | "cancelled";

export type SubscriptionPlanType = "gym" | "online_coach" | "both";
export type BillingCycle = "monthly" | "yearly";

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: GymPlan;
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
}

export interface GymListItem {
  id: string;
  name: string;
  address: string | "";
  phone: string | "";
  logo_url: string | "";
  joinedAt: string;
  plan: GymPlan | "";
  planPriceEgp: number | "";
  status: GymStatus | "";
  memberCount: number;
  lastActivityAt: string | "";
  member_limit: number | "";
  plan_id: string | "";
}

export type BillingRecordStatus = "paid" | "pending" | "failed" | "refunded";

export interface PlatformBillingRecord {
  id: string;
  subscription_id: string;
  gym_id: string;
  plan_id: string | null;
  amount_egp: number;
  billing_cycle: BillingCycle;
  period_start: string;
  period_end: string;
  next_billing_at: string | null;
  status: BillingRecordStatus;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface PlatformSubscriptionDetails {
  id: string;
  gym_id: string;
  plan_id: string | null;
  price_egp: number;
  status: GymStatus;
  started_at: string;
  notes: string | null;
  created_at: string;
  // derived from subscription_plans
  plan_slug: GymPlan | null;
  plan_name: string | null;
  billing_cycle: BillingCycle;
  duration_days: number | null;
  member_limit: number | null;
  features: string[];
  // derived from latest billing record
  latest_billing_record_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  next_billing_at: string | null;
  billing_status: BillingRecordStatus | null;
  billed_amount_egp: number | null;
  paid_at: string | null;
}

