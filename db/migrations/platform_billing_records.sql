-- ============================================================
-- Migration: platform_billing_records + platform_subscriptions cleanup
-- Prerequisites: fix_super_admin_rls.sql must be applied first
--   (public.is_super_admin() function must exist)
-- Run steps in order — step 2 reads billing_cycle before step 3 drops it.
-- ============================================================

-- ------------------------------------------------------------
-- 1. CREATE platform_billing_records
--    Created first so the backfill in step 2 can insert into it.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_billing_records (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id  UUID        NOT NULL REFERENCES platform_subscriptions(id) ON DELETE CASCADE,
  gym_id           UUID        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  plan_id          UUID        REFERENCES subscription_plans(id) ON DELETE SET NULL,
  amount_egp       NUMERIC     NOT NULL,
  billing_cycle    TEXT        NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  period_start     TIMESTAMPTZ NOT NULL,
  period_end       TIMESTAMPTZ NOT NULL,
  next_billing_at  TIMESTAMPTZ,
  status           TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
  paid_at          TIMESTAMPTZ,
  notes            TEXT DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_period_end_after_start CHECK (period_end > period_start),
  CONSTRAINT chk_paid_at_only_when_paid CHECK (paid_at IS NULL OR status = 'paid')
);

ALTER TABLE platform_billing_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super admin reads platform_billing_records"
  ON platform_billing_records FOR SELECT USING (public.is_super_admin());

CREATE POLICY "super admin writes platform_billing_records"
  ON platform_billing_records FOR ALL USING (public.is_super_admin());

CREATE INDEX IF NOT EXISTS idx_pbr_subscription_period
  ON platform_billing_records (subscription_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_pbr_gym_id
  ON platform_billing_records (gym_id);
CREATE INDEX IF NOT EXISTS idx_pbr_plan_id
  ON platform_billing_records (plan_id);
CREATE INDEX IF NOT EXISTS idx_pbr_status
  ON platform_billing_records (status);
CREATE INDEX IF NOT EXISTS idx_pbr_pending
  ON platform_billing_records (next_billing_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_pbr_created
  ON platform_billing_records (created_at DESC);

-- ------------------------------------------------------------
-- 2. BACKFILL: preserve next_billing_at as the first billing record
--    Must run BEFORE step 3 drops billing_cycle from platform_subscriptions.
--    billing_cycle is sourced from subscription_plans if linked, else from
--    the legacy column that still exists at this point in the migration.
-- ------------------------------------------------------------
INSERT INTO platform_billing_records (
  subscription_id,
  gym_id,
  plan_id,
  amount_egp,
  billing_cycle,
  period_start,
  period_end,
  next_billing_at,
  status,
  notes
)
SELECT
  ps.id,
  ps.gym_id,
  ps.plan_id,
  ps.price_egp,
  COALESCE(sp.billing_cycle, ps.billing_cycle),
  ps.started_at,
  ps.next_billing_at,
  ps.next_billing_at,
  'pending',
  'Migrated from platform_subscriptions.next_billing_at'
FROM platform_subscriptions ps
LEFT JOIN subscription_plans sp ON sp.id = ps.plan_id
WHERE ps.next_billing_at IS NOT NULL
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 3. DROP dependent views before altering platform_subscriptions.
--    gym_list references plan_name via the LATERAL subquery;
--    Postgres blocks DROP COLUMN when any object depends on it.
--    Both views are recreated in steps 4 and 5 below.
-- ------------------------------------------------------------
DROP VIEW IF EXISTS platform_subscription_details;
DROP VIEW IF EXISTS gym_list;

-- ------------------------------------------------------------
-- 3b. DROP legacy columns from platform_subscriptions
--     Safe now that next_billing_at is preserved in billing_records
--     and the dependent views have been dropped above.
-- ------------------------------------------------------------
ALTER TABLE platform_subscriptions
  DROP COLUMN IF EXISTS plan_name,
  DROP COLUMN IF EXISTS billing_cycle,
  DROP COLUMN IF EXISTS next_billing_at;

-- ------------------------------------------------------------
-- 4. CREATE VIEW platform_subscription_details
--    Exposes the removed columns as derived fields from subscription_plans
--    and the latest billing record. App code queries this instead of the
--    bare table to get billing_cycle, plan_name, next_billing_at, etc.
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
  sp.slug                               AS plan_slug,
  sp.name                               AS plan_name,
  COALESCE(sp.billing_cycle, 'monthly') AS billing_cycle,
  sp.duration_days,
  sp.member_limit,
  sp.features,

  -- derived from latest billing record
  br.id                                 AS latest_billing_record_id,
  br.period_start                       AS current_period_start,
  br.period_end                         AS current_period_end,
  br.next_billing_at,
  br.status                             AS billing_status,
  br.amount_egp                         AS billed_amount_egp,
  br.paid_at
FROM platform_subscriptions ps
LEFT JOIN subscription_plans sp ON sp.id = ps.plan_id
LEFT JOIN LATERAL (
  SELECT id, period_start, period_end, next_billing_at, status, amount_egp, paid_at
  FROM platform_billing_records
  WHERE subscription_id = ps.id
  ORDER BY period_start DESC
  LIMIT 1
) br ON true;

-- ------------------------------------------------------------
-- 5. RECREATE gym_list view
--    plan_name now comes from subscription_plans.slug only —
--    the legacy fallback to sub.plan_name is removed.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW gym_list
WITH (security_invoker = true)
AS
SELECT
  g.id,
  g.name,
  g.address,
  g.created_at,
  sp.slug                                AS plan_name,
  COALESCE(sp.price_egp, sub.price_egp) AS price_egp,
  sub.status                             AS subscription_status,
  COUNT(DISTINCT c.id)                   AS member_count,
  MAX(pal.created_at)                    AS last_activity_at
FROM gyms g
LEFT JOIN LATERAL (
  SELECT plan_id, price_egp, status
  FROM platform_subscriptions
  WHERE gym_id = g.id
  ORDER BY created_at DESC
  LIMIT 1
) sub ON true
LEFT JOIN subscription_plans sp ON sp.id = sub.plan_id
LEFT JOIN clients c
  ON c.gym_id = g.id
LEFT JOIN platform_activity_log pal
  ON pal.gym_id = g.id
GROUP BY
  g.id, g.name, g.address, g.created_at,
  sp.slug, sp.price_egp, sub.price_egp, sub.status
ORDER BY g.created_at DESC;
