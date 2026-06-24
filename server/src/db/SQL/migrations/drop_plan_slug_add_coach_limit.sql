-- ============================================================
-- Drop subscription_plans.slug + add coach_limit
-- ------------------------------------------------------------
-- 1. `slug` is removed entirely. Plans are now identified by
--    `name` (the display label) everywhere — views expose
--    `sp.name AS plan_name` and the app filters/colors by name.
-- 2. `coach_limit` is added for GYM plans: how many gym coaches
--    can access the platform (NULL = unlimited).
-- 3. The 'both' plan type is dropped; existing 'both' rows are
--    migrated to 'gym'.
--
-- Order matters: every view that reads sp.slug must be dropped
-- before the column can be dropped, then recreated without it.
-- ============================================================

-- ------------------------------------------------------------
-- 1. New column + plan_type cleanup
-- ------------------------------------------------------------
ALTER TABLE subscription_plans
  ADD COLUMN IF NOT EXISTS coach_limit INT;   -- gym plans only; NULL = unlimited

ALTER TABLE subscription_plans
  DROP CONSTRAINT IF EXISTS subscription_plans_type_check;
UPDATE subscription_plans SET type = 'gym' WHERE type = 'both';
ALTER TABLE subscription_plans
  ADD CONSTRAINT subscription_plans_type_check CHECK (type IN ('gym', 'online_coach'));

-- ------------------------------------------------------------
-- 2. Drop every view that references sp.slug
-- ------------------------------------------------------------
DROP VIEW IF EXISTS subscription_plan_stats;
DROP VIEW IF EXISTS gym_list;
DROP VIEW IF EXISTS online_coach_list;
DROP VIEW IF EXISTS platform_subscription_details;

-- ------------------------------------------------------------
-- 3. Drop the slug column (and its index)
-- ------------------------------------------------------------
DROP INDEX IF EXISTS idx_subscription_plans_slug;
ALTER TABLE subscription_plans DROP COLUMN IF EXISTS slug;

-- ------------------------------------------------------------
-- 4. Recreate subscription_plan_stats (no slug, + coach_limit)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- 5. Recreate gym_list (plan_name now = sp.name)
-- ------------------------------------------------------------
CREATE VIEW gym_list
WITH (security_invoker = true) AS
SELECT
  g.id,
  g.name,
  g.address,
  g.phone,
  g.logo_url,
  g.created_at,
  sp.id AS plan_id,
  sp.name AS plan_name,
  COALESCE(sp.price_egp, sub.price_egp) AS price_egp,
  sub.status AS subscription_status,
  COUNT(DISTINCT c.id) AS member_count,
  MAX(pal.created_at) AS last_activity_at,
  sp.member_limit AS member_limit
FROM gyms g
  LEFT JOIN LATERAL (
    SELECT plan_id, price_egp, status
    FROM platform_subscriptions
    WHERE gym_id = g.id
    ORDER BY created_at DESC
    LIMIT 1
  ) sub ON true
  LEFT JOIN subscription_plans sp ON sp.id = sub.plan_id
  LEFT JOIN clients c ON c.gym_id = g.id
  LEFT JOIN platform_activity_log pal ON pal.gym_id = g.id
GROUP BY
  g.id, g.name, g.address, g.phone, g.logo_url, g.created_at,
  sp.name, sp.price_egp, sub.price_egp, sub.status, sp.member_limit, sp.id
ORDER BY g.created_at DESC;

-- ------------------------------------------------------------
-- 6. Recreate online_coach_list (plan_slug column removed)
-- ------------------------------------------------------------
CREATE VIEW online_coach_list
WITH (security_invoker = true) AS
SELECT
  c.id,
  c.profile_id,
  c.bio,
  c.specialties,
  c.created_at,
  p.full_name,
  p.phone,
  p.avatar_url,
  COUNT(cc.id) FILTER (WHERE cc.is_active)  AS client_count,
  sub.status                                AS billing_status,
  (sub.status = 'active')                   AS is_billing_active,
  sub.started_at                            AS last_billing_at,
  sp.name                                   AS plan_name,
  sp.member_limit
FROM coaches c
JOIN  user_credentials p  ON p.id = c.profile_id
LEFT JOIN coach_clients cc ON cc.coach_id = c.id
LEFT JOIN LATERAL (
  SELECT ps.status, ps.started_at, ps.plan_id
  FROM platform_subscriptions ps
  WHERE ps.coach_id = c.id
  ORDER BY ps.created_at DESC
  LIMIT 1
) sub ON true
LEFT JOIN subscription_plans sp ON sp.id = sub.plan_id
WHERE c.gym_id IS NULL
GROUP BY c.id, p.id, sub.status, sub.started_at, sub.plan_id, sp.id;

-- ------------------------------------------------------------
-- 7. Recreate platform_subscription_details
--    (plan_slug removed, plan_name = sp.name, + coach_limit)
-- ------------------------------------------------------------
CREATE VIEW platform_subscription_details
WITH (security_invoker = true) AS
SELECT
  ps.id,
  ps.gym_id,
  ps.plan_id,
  ps.price_egp,
  ps.status,
  ps.started_at,
  ps.notes,
  ps.created_at,
  sp.name                               AS plan_name,
  COALESCE(sp.billing_cycle, 'monthly') AS billing_cycle,
  sp.duration_days,
  sp.member_limit,
  sp.coach_limit,
  sp.features,
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
