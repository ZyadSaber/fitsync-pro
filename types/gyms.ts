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
  address: string | null;
  joinedAt: string;
  plan: GymPlan | null;
  planPriceEgp: number | null;
  status: GymStatus | null;
  memberCount: number;
  lastActivityAt: string | null;
}
