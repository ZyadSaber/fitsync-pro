-- ============================================================
-- gym_list view — super admin gym management table
-- Joins gyms with their latest subscription, member count,
-- and most recent platform activity in a single query.
-- security_invoker = true so the caller's RLS policies apply.
-- ============================================================
CREATE
OR REPLACE VIEW gym_list
WITH
  (security_invoker = true) AS
SELECT
  g.id,
  g.name,
  g.address,
  g.phone,
  g.logo_url,
  g.created_at,
  sp.id AS plan_id,
  sp.slug AS plan_name,
  COALESCE(sp.price_egp, sub.price_egp) AS price_egp,
  sub.status AS subscription_status,
  COUNT(DISTINCT c.id) AS member_count,
  MAX(pal.created_at) AS last_activity_at,
  sp.member_limit AS member_limit
FROM
  gyms g
  LEFT JOIN LATERAL (
    SELECT
      plan_id,
      price_egp,
      status
    FROM
      platform_subscriptions
    WHERE
      gym_id = g.id
    ORDER BY
      created_at DESC
    LIMIT
      1
  ) sub ON true
  LEFT JOIN subscription_plans sp ON sp.id = sub.plan_id
  LEFT JOIN clients c ON c.gym_id = g.id
  LEFT JOIN platform_activity_log pal ON pal.gym_id = g.id
GROUP BY
  g.id,
  g.name,
  g.address,
  g.phone,
  g.logo_url,
  g.created_at,
  sp.slug,
  sp.price_egp,
  sub.price_egp,
  sub.status,
  sp.member_limit,
  sp.id
ORDER BY
  g.created_at DESC;