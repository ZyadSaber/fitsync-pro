-- ============================================================
-- Add coach_id to platform_subscription_details
-- ------------------------------------------------------------
-- The view originally exposed only ps.gym_id, so the coach
-- management dialog had no way to look up an online coach's
-- subscription. platform_subscriptions already carries coach_id
-- (exactly one of gym_id / coach_id is set per row), so we just
-- surface it here. The coach Subscription tab then filters on
-- coach_id the same way the gym tab filters on gym_id.
--
-- CREATE OR REPLACE keeps the column list compatible — coach_id
-- is appended, every existing column keeps its position.
-- ============================================================

CREATE OR REPLACE VIEW platform_subscription_details
WITH (security_invoker = true)
AS
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

-- Reload the PostgREST schema cache so the new column is exposed
-- by the REST API immediately.
NOTIFY pgrst, 'reload schema';
