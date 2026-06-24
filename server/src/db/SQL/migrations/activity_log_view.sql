-- ============================================================
-- platform_activity_log_list view — super admin activity feed
-- Joins the immutable audit log with the gym OR online coach it
-- belongs to and the profile of the actor who triggered the event,
-- so the /management/activity page can render names without extra
-- JOINs. security_invoker = true so the caller's RLS policies apply
-- (only super admins can read platform_activity_log).
--
-- Tenant model (mirrors platform_billing_records): at most one of
-- (gym_id, coach_id) is set per row. gym_id => gym-module activity,
-- coach_id => online-coaching-module activity, neither => a
-- platform-level event with no tenant.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Add coach_id so online coaches get their own activity scope.
--    Previously online-coach activity could only be inferred from
--    actor_id; an explicit owner column lets a coach's *client*
--    actions be attributed to the coach too.
-- ------------------------------------------------------------
ALTER TABLE platform_activity_log
  ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_platform_activity_log_coach_id
  ON platform_activity_log (coach_id);

-- ------------------------------------------------------------
-- 2. View with gym + coach + actor names resolved.
-- ------------------------------------------------------------
CREATE
OR REPLACE VIEW platform_activity_log_list
WITH
  (security_invoker = true) AS
SELECT
  pal.id,
  pal.gym_id,
  g.name AS gym_name,
  pal.coach_id,
  coach_p.full_name AS coach_name,
  coach_p.avatar_url AS coach_avatar_url,
  -- tenant = whichever module owns the event
  CASE
    WHEN pal.gym_id IS NOT NULL THEN 'gym'
    WHEN pal.coach_id IS NOT NULL THEN 'online_coach'
    ELSE 'platform'
  END AS tenant_type,
  COALESCE(g.name, coach_p.full_name) AS tenant_name,
  pal.event_type,
  pal.actor_id,
  actor.full_name AS actor_name,
  actor.avatar_url AS actor_avatar_url,
  actor.user_type AS actor_type,
  pal.metadata,
  pal.created_at
FROM
  platform_activity_log pal
  LEFT JOIN gyms g ON g.id = pal.gym_id
  LEFT JOIN coaches co ON co.id = pal.coach_id
  LEFT JOIN user_credentials coach_p ON coach_p.id = co.profile_id
  LEFT JOIN user_credentials actor ON actor.id = pal.actor_id
ORDER BY
  pal.created_at DESC;

-- Reload the PostgREST schema cache so the REST API picks up the
-- new column / view immediately.
NOTIFY pgrst, 'reload schema';
