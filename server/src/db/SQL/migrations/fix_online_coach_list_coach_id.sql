-- ============================================================
-- online_coach_list — corrected + extended
-- ------------------------------------------------------------
-- Fix history:
-- The lateral subquery originally filtered on `cc.coach_id` (the
-- coach_clients alias) instead of platform_subscriptions.coach_id.
-- This was baked into the stored view because it was first created
-- BEFORE platform_subscriptions had a coach_id column — so the
-- unqualified `coach_id` bound to the only table that had it
-- (coach_clients). Consequences:
--   * subscriptions were never matched by coach, and
--   * a coach with no clients yet (cc.coach_id IS NULL) got a
--     false WHERE, so billing_status AND plan_name came back NULL.
-- Fix: the column is now explicitly qualified (ps.coach_id).
--
-- Extension (mirrors gym_list):
--   * price_egp        — plan catalogue price, falling back to the
--                        price snapshotted on the subscription row.
--   * last_activity_at — most recent platform activity by the coach.
--                        platform_activity_log has no coach_id column,
--                        so a solo online coach is matched on actor_id
--                        (= the coach's profile_id / auth user id).
--   * is_billing_active — now means the coach has an ACTIVE plan AND
--                        has PAID the fee for the current billing
--                        period, instead of only checking sub.status.
-- ============================================================

CREATE OR REPLACE VIEW online_coach_list
WITH (security_invoker = true)
AS
SELECT
  c.id,
  c.profile_id,
  c.bio,
  c.specialties,
  c.created_at,

  -- profile
  p.full_name,
  p.phone,
  p.avatar_url,

  -- active client count
  COUNT(cc.id) FILTER (WHERE cc.is_active)  AS client_count,

  -- latest subscription
  sub.status                                AS billing_status,
  sub.started_at                            AS last_billing_at,

  -- price: plan catalogue price, fallback to the subscription snapshot
  COALESCE(sp.price_egp, sub.price_egp)     AS price_egp,

  -- most recent platform activity performed by this coach
  MAX(pal.created_at)                       AS last_activity_at,

  -- "active" = has an active plan AND has paid the fee for the current
  -- billing period (latest billing record is paid and now() falls
  -- within its period window).
  (
    sub.status = 'active'
    AND br.status = 'paid'
    AND now() >= br.period_start
    AND now() <  br.period_end
  )                                         AS is_billing_active,

  -- plan
  sp.name                                   AS plan_name,
  sp.member_limit

FROM coaches c
JOIN  user_credentials p  ON p.id = c.profile_id
LEFT JOIN coach_clients cc ON cc.coach_id = c.id
LEFT JOIN platform_activity_log pal ON pal.actor_id = c.profile_id
LEFT JOIN LATERAL (
  SELECT ps.id, ps.status, ps.started_at, ps.plan_id, ps.price_egp
  FROM platform_subscriptions ps
  WHERE ps.coach_id = c.id
  ORDER BY ps.created_at DESC
  LIMIT 1
) sub ON true
LEFT JOIN subscription_plans sp ON sp.id = sub.plan_id
LEFT JOIN LATERAL (
  SELECT pbr.status, pbr.period_start, pbr.period_end
  FROM platform_billing_records pbr
  WHERE pbr.subscription_id = sub.id
  ORDER BY pbr.period_start DESC
  LIMIT 1
) br ON true
WHERE c.gym_id IS NULL
GROUP BY
  c.id, p.id,
  sub.status, sub.started_at, sub.price_egp,
  sp.id,
  br.status, br.period_start, br.period_end;

-- Reload the PostgREST schema cache so the REST API picks up the
-- corrected view immediately.
NOTIFY pgrst, 'reload schema';
