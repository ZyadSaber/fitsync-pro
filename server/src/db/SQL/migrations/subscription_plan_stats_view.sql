-- ============================================================
-- subscription_plan_stats view — super admin subscriptions page
-- Aggregates tenant counts and MRR per subscription plan.
-- security_invoker = true so the caller's RLS policies apply.
-- ============================================================
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
GROUP BY sp.id
ORDER BY sp.price_egp ASC NULLS LAST;
