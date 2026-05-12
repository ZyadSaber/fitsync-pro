export type GymPlan = "starter" | "pro" | "enterprise";
export type GymStatus = "active" | "suspended" | "cancelled";

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
