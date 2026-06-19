export type GymStatus = "active" | "suspended" | "cancelled";

// Display-only status for the gym list. "expired" is derived in the service:
// a subscription is active but its latest fee period has lapsed.
export type GymDisplayStatus = GymStatus | "expired";

export type SubscriptionPlanType = "gym" | "online_coach";
export type BillingCycle = "monthly" | "yearly";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price_egp: number | null;
  billing_cycle: BillingCycle;
  duration_days: number;
  member_limit: number | null;
  coach_limit: number | null;
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
  plan: string;
  planPriceEgp: number | "";
  status: GymDisplayStatus | "";
  memberCount: number;
  lastActivityAt: string | "";
  member_limit: number | "";
  plan_id: string | "";
  owner_id: string | "";
}

export type BillingRecordStatus = "paid" | "pending" | "failed" | "refunded";

export interface PlatformBillingRecord {
  id: string;
  subscription_id: string;
  gym_id: string | null;
  coach_id: string | null;
  amount_egp: number;
  period_start: string;
  period_end: string;
  status: BillingRecordStatus;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface PlatformSubscriptionDetails {
  id: string;
  gym_id: string | null;
  coach_id: string | null;
  plan_id: string | null;
  price_egp: number;
  status: GymStatus;
  started_at: string;
  notes: string | null;
  created_at: string;
  // derived from subscription_plans
  plan_name: string | null;
  billing_cycle: BillingCycle;
  duration_days: number | null;
  member_limit: number | null;
  coach_limit: number | null;
  features: string[];
  // derived from latest billing record
  latest_billing_record_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  billing_status: BillingRecordStatus | null;
  billed_amount_egp: number | null;
  paid_at: string | null;
}

