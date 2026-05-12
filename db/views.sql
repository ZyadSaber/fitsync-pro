-- ============================================================
-- ADMIN DASHBOARD METRICS VIEW
-- One row per gym. Queried via the anon/user-scoped client so
-- RLS on gyms, clients, and gym_checkins applies automatically.
-- Each metric includes the current value, the prior-period
-- baseline, and a signed delta for trend display.
-- ============================================================

CREATE OR REPLACE VIEW admin_dashboard_metrics AS
WITH
  -- Active members right now
  active_now AS (
    SELECT gym_id, COUNT(*) AS cnt
    FROM   clients
    WHERE  membership_status = 'active'
    GROUP  BY gym_id
  ),

  -- Members who were active 30 days ago (start_date ≤ then ≤ end_date)
  active_last_month AS (
    SELECT gym_id, COUNT(*) AS cnt
    FROM   clients
    WHERE  start_date <= (CURRENT_DATE - INTERVAL '30 days')
      AND  end_date   >= (CURRENT_DATE - INTERVAL '30 days')
    GROUP  BY gym_id
  ),

  -- Gym door check-ins today
  today_checkins AS (
    SELECT gym_id, COUNT(*) AS cnt
    FROM   gym_checkins
    WHERE  checked_in_at >= CURRENT_DATE
      AND  checked_in_at <  CURRENT_DATE + INTERVAL '1 day'
    GROUP  BY gym_id
  ),

  -- Gym door check-ins yesterday (comparison baseline)
  yesterday_checkins AS (
    SELECT gym_id, COUNT(*) AS cnt
    FROM   gym_checkins
    WHERE  checked_in_at >= CURRENT_DATE - INTERVAL '1 day'
      AND  checked_in_at <  CURRENT_DATE
    GROUP  BY gym_id
  ),

  -- Memberships expiring in the next 7 days
  expiring_7d AS (
    SELECT gym_id, COUNT(*) AS cnt
    FROM   clients
    WHERE  membership_status = 'active'
      AND  end_date >= CURRENT_DATE
      AND  end_date <  CURRENT_DATE + INTERVAL '7 days'
    GROUP  BY gym_id
  ),

  -- Memberships that expired in the *previous* 7-day window (for trend)
  expired_prev_7d AS (
    SELECT gym_id, COUNT(*) AS cnt
    FROM   clients
    WHERE  end_date >= CURRENT_DATE - INTERVAL '14 days'
      AND  end_date <  CURRENT_DATE - INTERVAL '7 days'
    GROUP  BY gym_id
  ),

  -- Monthly recurring revenue: sum plan prices for all active members
  revenue_now AS (
    SELECT c.gym_id, COALESCE(SUM(p.price_egp), 0) AS total
    FROM   clients c
    LEFT JOIN gym_plans p
           ON p.gym_id = c.gym_id AND p.name = c.membership_type
    WHERE  c.membership_status = 'active'
    GROUP  BY c.gym_id
  ),

  -- Same revenue calculation but for members who were active 30 days ago
  revenue_last_month AS (
    SELECT c.gym_id, COALESCE(SUM(p.price_egp), 0) AS total
    FROM   clients c
    LEFT JOIN gym_plans p
           ON p.gym_id = c.gym_id AND p.name = c.membership_type
    WHERE  c.start_date <= (CURRENT_DATE - INTERVAL '30 days')
      AND  c.end_date   >= (CURRENT_DATE - INTERVAL '30 days')
    GROUP  BY c.gym_id
  )

SELECT
  g.id AS gym_id,

  -- Active members (vs 30 days ago)
  COALESCE(an.cnt,  0)::INT                                       AS active_members,
  COALESCE(alm.cnt, 0)::INT                                       AS active_members_last_month,
  (COALESCE(an.cnt, 0) - COALESCE(alm.cnt, 0))::INT              AS active_members_delta,

  -- Check-ins today (vs yesterday)
  COALESCE(tc.cnt, 0)::INT                                        AS active_today,
  COALESCE(yc.cnt, 0)::INT                                        AS active_yesterday,
  (COALESCE(tc.cnt, 0) - COALESCE(yc.cnt, 0))::INT               AS active_today_delta,

  -- Expiring this week (vs prior 7-day window)
  COALESCE(e7.cnt, 0)::INT                                        AS expiring_count,
  COALESCE(ep.cnt, 0)::INT                                        AS expiring_prev_week,
  (COALESCE(e7.cnt, 0) - COALESCE(ep.cnt, 0))::INT               AS expiring_delta,

  -- Revenue (vs 30 days ago)
  COALESCE(rn.total,  0)::NUMERIC                                 AS revenue,
  COALESCE(rlm.total, 0)::NUMERIC                                 AS revenue_last_month,
  (COALESCE(rn.total, 0) - COALESCE(rlm.total, 0))::NUMERIC      AS revenue_delta

FROM       gyms g
LEFT JOIN  active_now         an  ON an.gym_id  = g.id
LEFT JOIN  active_last_month  alm ON alm.gym_id = g.id
LEFT JOIN  today_checkins     tc  ON tc.gym_id  = g.id
LEFT JOIN  yesterday_checkins yc  ON yc.gym_id  = g.id
LEFT JOIN  expiring_7d        e7  ON e7.gym_id  = g.id
LEFT JOIN  expired_prev_7d    ep  ON ep.gym_id  = g.id
LEFT JOIN  revenue_now        rn  ON rn.gym_id  = g.id
LEFT JOIN  revenue_last_month rlm ON rlm.gym_id = g.id;

-- NOTE: RLS on gym_checkins is not yet defined in full_schema.sql.
-- Add the policy below to enforce row-level isolation on check-in data:
--
-- ALTER TABLE gym_checkins ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "admin sees gym checkins" ON gym_checkins
--   USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));
