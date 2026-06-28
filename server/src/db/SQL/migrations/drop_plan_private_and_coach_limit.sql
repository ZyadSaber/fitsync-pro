-- ============================================================
-- Drop private-plan + coach_limit support from subscription_plans
-- ------------------------------------------------------------
-- Removes four columns: owner_coach_id, owner_gym_id, coach_limit, is_private.
--
-- These columns are referenced by other database objects, so a bare
-- `ALTER TABLE ... DROP COLUMN` fails. This migration clears every
-- dependency first, drops the columns, then rebuilds the views without them:
--
--   * views      — subscription_plan_stats selects sp.coach_limit AND filters
--                  on sp.is_private; platform_subscription_details selects
--                  sp.coach_limit. Both must be dropped before the columns and
--                  recreated without them.
--   * RLS        — the legacy "authenticated reads active catalog plans" and
--                  "coach reads own private plan" policies reference is_private /
--                  owner_coach_id; a policy blocks DROP COLUMN. Dropped IF EXISTS
--                  (no-op on a DB provisioned from full_schema, which has no RLS).
--   * constraint — chk_private_plan_owner references all three of owner_gym_id,
--                  owner_coach_id, is_private.
--   * indexes    — the partial indexes on the owner_* columns.
--
-- DROP COLUMN would cascade the constraint and indexes automatically; they are
-- dropped explicitly first to record intent and keep the step order obvious.
--
-- NOTE (catalog visibility): with is_private gone, the WHERE filter is removed
-- from subscription_plan_stats, so any previously-private plan rows now appear
-- in the catalog grid.
-- ============================================================

-- ── 1. Drop the dependent views ─────────────────────────────────────────────
DROP VIEW IF EXISTS subscription_plan_stats;
DROP VIEW IF EXISTS platform_subscription_details;

-- ── 2. Drop RLS policies that reference is_private / owner_coach_id ──────────
DROP POLICY IF EXISTS "authenticated reads active catalog plans" ON subscription_plans;
DROP POLICY IF EXISTS "coach reads own private plan"             ON subscription_plans;

-- ── 3. Drop the constraint + partial indexes on the owner_* columns ─────────
ALTER TABLE subscription_plans
  DROP CONSTRAINT IF EXISTS chk_private_plan_owner;
DROP INDEX IF EXISTS idx_subscription_plans_owner_gym;
DROP INDEX IF EXISTS idx_subscription_plans_owner_coach;

-- ── 4. Drop the columns ─────────────────────────────────────────────────────
ALTER TABLE subscription_plans
  DROP COLUMN IF EXISTS owner_coach_id,
  DROP COLUMN IF EXISTS owner_gym_id,
  DROP COLUMN IF EXISTS coach_limit,
  DROP COLUMN IF EXISTS is_private;

-- ── 5. Recreate subscription_plan_stats (no coach_limit, no is_private filter)
CREATE VIEW subscription_plan_stats
WITH (security_invoker = true) AS
SELECT
  sp.id,
  sp.name,
  sp.description,
  sp.price_egp,
  sp.billing_cycle,
  sp.duration_days,
  sp.member_limit,
  sp.type,
  sp.features,
  sp.is_active,
  sp.created_at,
  sp.updated_at,
  COUNT(DISTINCT ps.gym_id) FILTER (WHERE ps.status = 'active')  AS active_tenant_count,
  COUNT(DISTINCT ps.gym_id)                                        AS total_tenant_count,
  COALESCE(
    SUM(COALESCE(sp.price_egp, ps.price_egp, 0)) FILTER (WHERE ps.status = 'active'),
    0
  )                                                                AS mrr_egp
FROM subscription_plans sp
LEFT JOIN platform_subscriptions ps ON ps.plan_id = sp.id
GROUP BY sp.id
ORDER BY sp.price_egp ASC NULLS LAST;

-- ── 6. Recreate platform_subscription_details (no coach_limit) ──────────────
CREATE VIEW platform_subscription_details
WITH (security_invoker = true) AS
SELECT
  ps.id,
  ps.gym_id,
  ps.coach_id,
  ps.plan_id,
  ps.price_egp,
  ps.status,
  ps.started_at,
  ps.notes,
  ps.created_at,

  -- derived from subscription_plans
  sp.name                               AS plan_name,
  COALESCE(sp.billing_cycle, 'monthly') AS billing_cycle,
  sp.duration_days,
  sp.member_limit,
  sp.features,

  -- derived from latest billing record
  br.id                                 AS latest_billing_record_id,
  br.period_start                       AS current_period_start,
  br.period_end                         AS current_period_end,
  br.status                             AS billing_status,
  br.amount_egp                         AS billed_amount_egp,
  br.paid_at
FROM platform_subscriptions ps
LEFT JOIN subscription_plans sp ON sp.id = ps.plan_id
LEFT JOIN LATERAL (
  SELECT id, period_start, period_end, status, amount_egp, paid_at
  FROM platform_billing_records
  WHERE subscription_id = ps.id
  ORDER BY period_start DESC
  LIMIT 1
) br ON true;
