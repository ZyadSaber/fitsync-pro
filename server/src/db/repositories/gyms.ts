import { query, queryOne } from "../pool.js";
import type { PlatformSubscriptionDetails } from "@/types/gyms";
import { format } from "date-fns";

export interface GymListItem {
  id: string;
  name: string;
  address: string;
  phone: string;
  logo_url: string;
  joinedAt: string;
  plan: string;
  plan_id: string;
  planPriceEgp: number | "";
  status: string;
  memberCount: number;
  lastActivityAt: string;
  member_limit: number;
}

interface GymListRow {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  created_at: string;
  plan_name: string | null;
  price_egp: string | number | null;
  subscription_status: string | null;
  member_count: string | number | null;
  last_activity_at: string | null;
  member_limit: string | number | null;
  plan_id: string | null;
}

export interface GymListFilters {
  search?: string;
  plan?: string;
  status?: string;
}

export async function listGyms({ search, plan, status }: GymListFilters = {}): Promise<GymListItem[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    conditions.push(`subscription_status = $${params.length}`);
  }
  if (plan) {
    params.push(plan);
    conditions.push(`plan_id = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(name ILIKE $${params.length} OR address ILIKE $${params.length} OR phone ILIKE $${params.length})`
    );
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await query<GymListRow>(
    `SELECT *
       FROM gym_list
       ${where}`,
    params
  );
  return rows.map((item) => ({
    id: item.id,
    name: item.name,
    address: item.address ?? "",
    phone: item.phone ?? "",
    logo_url: item.logo_url ?? "",
    joinedAt: format(item.created_at, "yyyy-MM-dd HH:mm"),
    plan: item.plan_name ?? "",
    plan_id: item.plan_id ?? "",
    planPriceEgp: item.price_egp != null ? Number(item.price_egp) : "",
    status: item.subscription_status ?? "unknown",
    memberCount: Number(item.member_count ?? 0),
    lastActivityAt: item.last_activity_at ? format(item.last_activity_at, "yyyy-MM-dd HH:mm") : "",
    member_limit: Number(item.member_limit ?? 0),
  }));
}

// Lightweight {key,label} gym list for filter/select dropdowns.
export async function listGymOptions() {
  const { rows } = await query<{ id: string; name: string }>(
    `SELECT id AS key, name AS label FROM gym_list ORDER BY name`
  );
  return rows;
}

// Candidate gym owners for the create/edit dialog: non-super-admin gym/member
// profiles. Labelled by full_name, falling back to phone then id.
export async function listGymOwnerOptions() {
  const { rows } = await query<{ id: string; full_name: string; }>(
    `SELECT id, full_name
       FROM user_credentials
      WHERE user_type IN ('member')
        AND is_super_admin = false
      ORDER BY full_name`
  );
  return rows.map((u) => ({
    key: u.id,
    label: u.full_name?.trim(),
  }));
}

export interface GymInput {
  name: string;
  address?: string;
  phone?: string;
  logo_url?: string;
}

export async function createGym(input: GymInput): Promise<string> {
  const row = await queryOne<{ id: string }>(
    `INSERT INTO gyms (name, address, phone, logo_url)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [input.name, input.address || null, input.phone || null, input.logo_url || null]
  );
  return row!.id;
}

export async function updateGym(id: string, input: GymInput): Promise<void> {
  await query(
    `UPDATE gyms SET name = $2, address = $3, phone = $4, logo_url = $5 WHERE id = $1`,
    [id, input.name, input.address || null, input.phone || null, input.logo_url || null]
  );
}

export async function deleteGym(id: string): Promise<void> {
  await query(`DELETE FROM gyms WHERE id = $1`, [id]);
}

export async function getGymSubscription(gymId: string) {
  return queryOne<PlatformSubscriptionDetails>(
    `SELECT * FROM platform_subscription_details
      WHERE gym_id = $1 ORDER BY started_at DESC LIMIT 1`,
    [gymId]
  );
}

export async function getGymBillingHistory(gymId: string) {
  const { rows } = await query(
    `SELECT * FROM platform_billing_records
      WHERE gym_id = $1 ORDER BY period_start DESC`,
    [gymId]
  );
  return rows;
}

export interface BillingRecordInput {
  subscription_id: string;
  gym_id: string;
  amount_egp: number;
  billing_cycle: string;
  period_start: string;
  period_end: string;
  next_billing_at?: string | null;
  status: string;
  paid_at?: string | null;
  notes?: string | null;
}

export async function createBillingRecord(record: BillingRecordInput) {
  return queryOne(
    `INSERT INTO platform_billing_records
       (subscription_id, gym_id, amount_egp, billing_cycle, period_start, period_end,
        next_billing_at, status, paid_at, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [
      record.subscription_id,
      record.gym_id,
      record.amount_egp,
      record.billing_cycle,
      record.period_start,
      record.period_end,
      record.next_billing_at ?? null,
      record.status,
      record.paid_at ?? null,
      record.notes ?? null,
    ]
  );
}

// Update a gym billing record's status; stamps paid_at only when marking paid.
export async function updateBillingRecordStatus(
  id: string,
  status: string,
  paidAt?: string | null
): Promise<void> {
  await query(
    `UPDATE platform_billing_records
        SET status = $2,
            paid_at = CASE WHEN $2 = 'paid' THEN $3 ELSE paid_at END
      WHERE id = $1`,
    [id, status, paidAt ?? null]
  );
}
