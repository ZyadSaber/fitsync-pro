import { query, queryOne, withTransaction } from "../pool.js";
import { hashPassword } from "../../auth/jwt.js";
import { randomUUID } from "node:crypto";

export interface CoachListFilters {
  search?: string;
  plan?: string;
  active?: string;
}

export async function listCoaches({ search, plan, active }: CoachListFilters = {}) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (plan) {
    params.push(plan);
    conditions.push(`plan_name = $${params.length}`);
  }
  if (active === "true" || active === "false") {
    conditions.push(`is_billing_active IS ${active === "true" ? "TRUE" : "NOT TRUE"}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(full_name ILIKE $${params.length} OR phone ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await query(
    `SELECT * FROM online_coach_list ${where} ORDER BY created_at DESC`,
    params
  );
  return rows;
}

export async function listActiveCoachPlanOptions() {
  const { rows } = await query<{ name: string }>(
    `SELECT name FROM subscription_plans WHERE is_active = true ORDER BY name`
  );
  return rows.map((p) => ({ key: p.name, label: p.name }));
}

export async function listNonCoachUsers() {
  const { rows } = await query(
    `SELECT id, full_name, phone, avatar_url, user_type, gym_id, created_at
       FROM user_credentials WHERE user_type = 'member' ORDER BY full_name ASC`
  );
  return rows;
}

export async function promoteToCoach(profileId: string): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE user_credentials SET user_type = 'coach', gym_id = NULL WHERE id = $1`,
      [profileId]
    );
    await client.query(
      `INSERT INTO coaches (profile_id, gym_id, bio, specialties)
       VALUES ($1, NULL, NULL, '{}')`,
      [profileId]
    );
  });
}

export interface CoachUpdateInput {
  full_name: string;
  phone?: string;
  bio?: string;
  specialties: string[];
}

export async function updateCoach(
  coachId: string,
  profileId: string,
  input: CoachUpdateInput
): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE user_credentials SET full_name = $2, phone = $3 WHERE id = $1`,
      [profileId, input.full_name, input.phone || null]
    );
    await client.query(
      `UPDATE coaches SET bio = $2, specialties = $3 WHERE id = $1`,
      [coachId, input.bio || null, input.specialties]
    );
  });
}

export interface CoachCreateInput {
  email: string;
  full_name: string;
  phone?: string;
  bio?: string;
  specialties: string[];
}

/**
 * Create a brand-new online coach: user (identity + placeholder credentials) +
 * coach row. Mirrors the old Supabase signUp flow — the coach is given a random
 * password and is expected to reset it via the (future) password-reset flow.
 */
export async function createCoach(input: CoachCreateInput): Promise<string> {
  const placeholderHash = await hashPassword(randomUUID());
  return withTransaction(async (client) => {
    const user = await client.query<{ id: string }>(
      `INSERT INTO user_credentials (user_type, full_name, phone, email, password_hash)
       VALUES ('coach', $1, $2, $3, $4) RETURNING id`,
      [input.full_name, input.phone || null, input.email, placeholderHash]
    );
    const profileId = user.rows[0].id;
    await client.query(
      `INSERT INTO coaches (profile_id, gym_id, bio, specialties)
       VALUES ($1, NULL, $2, $3)`,
      [profileId, input.bio || null, input.specialties]
    );
    return profileId;
  });
}

export async function deleteCoach(coachId: string): Promise<void> {
  await query(`DELETE FROM coaches WHERE id = $1`, [coachId]);
}

export async function getCoachSubscription(coachId: string) {
  return queryOne(
    `SELECT * FROM platform_subscription_details
      WHERE coach_id = $1 ORDER BY started_at DESC LIMIT 1`,
    [coachId]
  );
}

export async function getCoachBilling(coachId: string) {
  const { rows } = await query(
    `SELECT * FROM platform_billing_records
      WHERE coach_id = $1 ORDER BY period_start DESC`,
    [coachId]
  );
  return rows;
}

export async function emailExists(email: string): Promise<boolean> {
  const row = await queryOne(
    `SELECT 1 FROM user_credentials WHERE lower(email) = lower($1)`,
    [email]
  );
  return !!row;
}
