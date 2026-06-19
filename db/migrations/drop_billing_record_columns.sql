-- ============================================================
-- Migration: drop plan_id, billing_cycle, next_billing_at from
--            platform_billing_records
--
-- WARNING — DESTRUCTIVE. billing_cycle and next_billing_at are
-- still read/written by application code (services/management/
-- subscriptions.ts) and next_billing_at is exposed by the
-- platform_subscription_details view. Update that code in the
-- same deploy or those paths will error.
--
-- Run order matters: the dependent view must be dropped before
-- the columns it references can be removed.
-- ============================================================

-- ------------------------------------------------------------
-- 1. DROP the dependent view.
--    platform_subscription_details selects br.next_billing_at,
--    so Postgres blocks DROP COLUMN until the view is gone.
--    Recreated without that field in step 4.
-- ------------------------------------------------------------
DROP VIEW IF EXISTS platform_subscription_details;

-- ------------------------------------------------------------
-- 2. DROP indexes that reference the columns being removed.
--    (DROP COLUMN drops dependent indexes automatically, but we
--    drop them explicitly so the intent is recorded.)
-- ------------------------------------------------------------
DROP INDEX IF EXISTS idx_pbr_plan_id;
DROP INDEX IF EXISTS idx_pbr_pending;   -- partial index ON (next_billing_at)

-- ------------------------------------------------------------
-- 3. DROP the three columns.
-- ------------------------------------------------------------
ALTER TABLE platform_billing_records
  DROP COLUMN IF EXISTS plan_id,
  DROP COLUMN IF EXISTS billing_cycle,
  DROP COLUMN IF EXISTS next_billing_at;

-- ------------------------------------------------------------
-- 4. RECREATE platform_subscription_details without
--    br.next_billing_at. billing_cycle in this view already comes
--    from subscription_plans, so it is unaffected by the column
--    drop above and is preserved as-is.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW platform_subscription_details
WITH (security_invoker = true)
AS
SELECT
  ps.id,
  ps.gym_id,
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
  sp.coach_limit,
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

-- ------------------------------------------------------------
-- 5. Force PostgREST to reload its schema cache so the dropped
--    columns disappear from the REST API immediately.
-- ------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
