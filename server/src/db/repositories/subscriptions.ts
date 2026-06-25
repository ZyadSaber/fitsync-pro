import { query, queryOne, withTransaction } from "../pool.js";
import type { PlanFormData, InvoiceFormData, AssignPlanFormData, InstallmentRow } from "@/validations/subscriptionSchema";
import type { TenantType, BillingRecordListItem } from "@/types/subscriptions";

// ── Plan stats ───────────────────────────────────────────────────────────────
export async function listPlanStats() {
  const { rows } = await query(`SELECT * FROM subscription_plan_stats`);
  return rows;
}

// ── Plan CRUD ────────────────────────────────────────────────────────────────
function planValues(data: PlanFormData) {
  return [
    data.name,
    data.description || null,
    data.price_egp === "" ? null : parseFloat(data.price_egp) || 0,
    data.billing_cycle,
    parseInt(data.duration_days) || 30,
    data.member_limit === "" ? null : parseInt(data.member_limit) || null,
    data.type === "gym" ? (data.coach_limit === "" ? null : parseInt(data.coach_limit) || null) : null,
    data.type,
    data.features,
    data.is_active,
  ];
}

export async function createPlan(data: PlanFormData): Promise<string> {
  const row = await queryOne<{ id: string }>(
    `INSERT INTO subscription_plans
       (name, description, price_egp, billing_cycle, duration_days, member_limit,
        coach_limit, type, features, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
    planValues(data)
  );
  return row!.id;
}

export async function updatePlan(id: string, data: PlanFormData): Promise<void> {
  await query(
    `UPDATE subscription_plans SET
       name = $2, description = $3, price_egp = $4, billing_cycle = $5,
       duration_days = $6, member_limit = $7, coach_limit = $8, type = $9,
       features = $10, is_active = $11, updated_at = now()
     WHERE id = $1`,
    [id, ...planValues(data)]
  );
}

export async function deletePlan(id: string): Promise<void> {
  await query(`DELETE FROM subscription_plans WHERE id = $1`, [id]);
}

// ── Billing records (invoice list) ───────────────────────────────────────────
export interface BillingRecordFilter {
  status?: string;
  planType?: string;
}

export async function listBillingRecords(filter: BillingRecordFilter = {}) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filter.status && filter.status !== "all") {
    conditions.push(`r.status = $${params.push(filter.status)}`);
  }
  // Exactly one of (gym_id, coach_id) is set; filter by the other being NULL.
  if (filter.planType === "gym") conditions.push(`r.coach_id IS NULL`);
  else if (filter.planType === "online_coach") conditions.push(`r.gym_id IS NULL`);

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await query<BillingRecordListItem>(
    `SELECT r.id, r.subscription_id, r.gym_id, r.coach_id, r.amount_egp,
            r.period_start, r.period_end, r.status, r.paid_at, r.notes,
            r.created_at,
            COALESCE(g.name, p.full_name, 'Unknown') AS tenant_name,
            CASE WHEN r.gym_id IS NOT NULL THEN 'gym' ELSE 'online_coach' END AS tenant_type
       FROM platform_billing_records r
       LEFT JOIN gyms g ON g.id = r.gym_id
       LEFT JOIN coaches c ON c.id = r.coach_id
       LEFT JOIN user_credentials p ON p.id = c.profile_id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT 100`,
    params
  );
  return rows;
}

export async function getBillingStatusCounts() {
  const row = await queryOne<{ total: string; past_due: string; pending: string }>(
    `SELECT
       count(*) AS total,
       count(*) FILTER (WHERE status = 'failed')  AS past_due,
       count(*) FILTER (WHERE status = 'pending') AS pending
     FROM platform_billing_records`
  );
  return {
    total: Number(row?.total ?? 0),
    pastDue: Number(row?.past_due ?? 0),
    pending: Number(row?.pending ?? 0),
  };
}

export async function createCustomBillingRecord(data: InvoiceFormData): Promise<string> {
  const row = await queryOne<{ id: string }>(
    `INSERT INTO platform_billing_records
       (subscription_id, gym_id, amount_egp, period_start, period_end,
        status, paid_at, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [
      data.subscription_id,
      data.gym_id,
      parseFloat(data.amount_egp),
      data.period_start,
      data.period_end,
      data.status,
      data.paid_at || null,
      data.notes || null,
    ]
  );
  return row!.id;
}

export async function updateBillingRecord(id: string, data: InvoiceFormData): Promise<void> {
  await query(
    `UPDATE platform_billing_records SET
       amount_egp = $2, period_start = $3, period_end = $4,
       status = $5, paid_at = $6, notes = $7
     WHERE id = $1`,
    [
      id,
      parseFloat(data.amount_egp),
      data.period_start,
      data.period_end,
      data.status,
      data.paid_at || null,
      data.notes || null,
    ]
  );
}

export async function markBillingRecordPaid(id: string): Promise<void> {
  await query(
    `UPDATE platform_billing_records SET status = 'paid', paid_at = now() WHERE id = $1`,
    [id]
  );
}

export async function deleteBillingRecord(id: string): Promise<void> {
  await query(`DELETE FROM platform_billing_records WHERE id = $1`, [id]);
}

// ── Tenant assignment state ──────────────────────────────────────────────────
export interface TenantAssignmentState {
  hasActiveSubscription: boolean;
  openInvoiceCount: number;
}

export async function getTenantAssignmentState(
  tenantType: TenantType,
  tenantId: string
): Promise<TenantAssignmentState | null> {
  if (!tenantId) return null;
  const ownerColumn = tenantType === "gym" ? "gym_id" : "coach_id";

  const active = await queryOne<{ n: string }>(
    `SELECT count(*) AS n FROM platform_subscriptions
      WHERE ${ownerColumn} = $1 AND status = 'active'`,
    [tenantId]
  );
  const open = await queryOne<{ n: string }>(
    `SELECT count(*) AS n FROM platform_billing_records
      WHERE ${ownerColumn} = $1 AND status IN ('pending','failed')`,
    [tenantId]
  );
  return {
    hasActiveSubscription: Number(active?.n ?? 0) > 0,
    openInvoiceCount: Number(open?.n ?? 0),
  };
}

// ── Assign plan (transactional) ──────────────────────────────────────────────
export async function assignPlanToTenant(
  data: AssignPlanFormData,
  installments: InstallmentRow[]
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const plan = await queryOne<{
    id: string;
    name: string;
    description: string | null;
    price_egp: number | null;
    duration_days: number;
    member_limit: number | null;
    coach_limit: number | null;
    type: string;
    features: string[];
  }>(
    `SELECT id, name, description, price_egp, duration_days, member_limit, coach_limit, type, features
       FROM subscription_plans WHERE id = $1`,
    [data.plan_id]
  );
  if (!plan) return { ok: false, error: "Plan not found" };

  const isGym = data.tenant_type === "gym";
  const ownerGymId = isGym ? data.gym_id || null : null;
  const ownerCoachId = !isGym ? data.coach_id || null : null;

  const tenantId = (isGym ? ownerGymId : ownerCoachId) ?? "";
  const state = await getTenantAssignmentState(data.tenant_type, tenantId);
  if (state && (state.hasActiveSubscription || state.openInvoiceCount > 0)) {
    return { ok: false, error: "This tenant already has an active subscription or unpaid invoices" };
  }

  const isContactPlan = plan.price_egp === null;
  let unitPrice = plan.price_egp ?? 0;
  let memberLimit = plan.member_limit;
  let coachLimit = plan.coach_limit;
  let durationDays = plan.duration_days;
  let features = plan.features;

  if (isContactPlan) {
    const custom = parseFloat(data.custom_price ?? "");
    if (!custom || custom <= 0) return { ok: false, error: "Enter a negotiated price for this custom plan" };
    unitPrice = custom;
    const ml = data.custom_member_limit ?? "";
    memberLimit = ml === "" ? null : parseInt(ml) || null;
    const cl = data.custom_coach_limit ?? "";
    coachLimit = plan.type === "gym" ? (cl === "" ? null : parseInt(cl) || null) : null;
    durationDays = parseInt(data.custom_duration_days ?? "") || plan.duration_days;
    features = data.custom_features ?? [];
  }

  const qty = Math.max(1, parseInt(data.quantity) || 1);
  const totalDays = durationDays * qty;
  const started = new Date(data.started_at);
  const ended = new Date(started);
  ended.setDate(ended.getDate() + totalDays);
  const periodEnd = ended.toISOString().slice(0, 10);

  try {
    const subId = await withTransaction(async (client) => {
      let planId = plan.id;

      if (isContactPlan) {
        const priv = await client.query<{ id: string }>(
          `INSERT INTO subscription_plans
             (name, description, price_egp, billing_cycle, duration_days, member_limit,
              coach_limit, type, features, is_active, is_private, owner_gym_id, owner_coach_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,true,$10,$11) RETURNING id`,
          [
            plan.name, plan.description, unitPrice, data.billing_cycle, durationDays,
            memberLimit, coachLimit, plan.type, features, ownerGymId, ownerCoachId,
          ]
        );
        planId = priv.rows[0].id;
      }

      const sub = await client.query<{ id: string }>(
        `INSERT INTO platform_subscriptions
           (gym_id, coach_id, plan_id, price_egp, status, started_at, notes)
         VALUES ($1,$2,$3,$4,'active',$5,$6) RETURNING id`,
        [ownerGymId, ownerCoachId, planId, unitPrice, data.started_at, data.notes || ""]
      );
      const subscriptionId = sub.rows[0].id;

      for (const inst of installments) {
        await client.query(
          `INSERT INTO platform_billing_records
             (subscription_id, gym_id, coach_id, amount_egp,
              period_start, period_end, status, notes)
           VALUES ($1,$2,$3,$4,$5,$6,'pending',$7)`,
          [
            subscriptionId, ownerGymId, ownerCoachId, parseFloat(inst.amount),
            data.started_at, periodEnd, inst.label || null,
          ]
        );
      }
      return subscriptionId;
    });

    return { ok: true, id: subId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to assign plan" };
  }
}

export async function getActiveSubscriptionIdForGym(gymId: string): Promise<{ id: string } | null> {
  return queryOne<{ id: string }>(
    `SELECT id FROM platform_subscriptions
      WHERE gym_id = $1 AND status = 'active'
      ORDER BY created_at DESC LIMIT 1`,
    [gymId]
  );
}

export async function listCoachSelectOptions() {
  const { rows } = await query<{ id: string; full_name: string }>(
    `SELECT id, full_name FROM online_coach_list ORDER BY full_name`
  );
  return rows.map((c) => ({ key: c.id, label: c.full_name }));
}
