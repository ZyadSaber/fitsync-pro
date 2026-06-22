-- ============================================================
-- Private (tenant-specific) subscription plans
-- ------------------------------------------------------------
-- When a super admin assigns a contact-pricing ("Custom") plan
-- to a single gym or coach, the template is cloned into a
-- PRIVATE plan that carries the negotiated price but inherits
-- the template's features, member cap and duration.
--
-- Private plans are owned by exactly one tenant and are hidden
-- from the shared plan catalog (subscription_plan_stats) so the
-- grid does not fill up with one card per negotiated deal.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Ownership columns on subscription_plans
-- ------------------------------------------------------------
ALTER TABLE subscription_plans
  ADD COLUMN IF NOT EXISTS is_private     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS owner_gym_id   UUID REFERENCES gyms(id)    ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS owner_coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE;

-- A catalog plan has no owner; a private plan has exactly one.
ALTER TABLE subscription_plans
  DROP CONSTRAINT IF EXISTS chk_private_plan_owner;
ALTER TABLE subscription_plans
  ADD CONSTRAINT chk_private_plan_owner CHECK (
    (is_private = false AND owner_gym_id IS NULL AND owner_coach_id IS NULL)
    OR
    (is_private = true  AND num_nonnulls(owner_gym_id, owner_coach_id) = 1)
  );

CREATE INDEX IF NOT EXISTS idx_subscription_plans_owner_gym
  ON subscription_plans (owner_gym_id) WHERE owner_gym_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscription_plans_owner_coach
  ON subscription_plans (owner_coach_id) WHERE owner_coach_id IS NOT NULL;

-- ------------------------------------------------------------
-- 2. RLS — private plans must not leak across tenants
--    The old public-read policy exposed every active plan to any
--    authenticated user. Restrict it to catalog (non-private) plans
--    and let each owner read only their own private plan.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "authenticated reads active subscription_plans" ON subscription_plans;
CREATE POLICY "authenticated reads active catalog plans" ON subscription_plans
  FOR SELECT
  USING (is_active = true AND is_private = false AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "coach reads own private plan" ON subscription_plans;
CREATE POLICY "coach reads own private plan" ON subscription_plans
  FOR SELECT
  USING (
    is_private = true
    AND owner_coach_id IN (SELECT id FROM coaches WHERE profile_id = auth.uid())
  );
-- (Super admins keep full access via the existing
--  "super admin manages subscription_plans" FOR ALL policy.)

-- ------------------------------------------------------------
-- 3. Recreate subscription_plan_stats to exclude private plans
--    so the catalog grid stays clean. Identical to the original
--    view except for the WHERE clause.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW subscription_plan_stats
WITH (security_invoker = true) AS
SELECT
  sp.id,
  sp.name,
  sp.description,
  sp.price_egp,
  sp.billing_cycle,
  sp.duration_days,
  sp.member_limit,
  sp.coach_limit,
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
WHERE sp.is_private = false
GROUP BY sp.id
ORDER BY sp.price_egp ASC NULLS LAST;
