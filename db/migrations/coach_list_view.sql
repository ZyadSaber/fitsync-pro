-- ============================================================
-- Migration: extend platform billing tables to support coaches
-- + online_coach_list view
--
-- Changes:
--   platform_subscriptions  — gym_id nullable, coach_id added
--   platform_billing_records — gym_id nullable, coach_id added
--   Exactly one of (gym_id, coach_id) must be set on each table.
-- ============================================================

-- ------------------------------------------------------------
-- 1. RLS: super admin must be able to read coaches / coach_clients
-- ------------------------------------------------------------
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super admin reads all coaches" ON coaches
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = true
    )
  );

ALTER TABLE coach_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super admin reads all coach_clients" ON coach_clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = true
    )
  );

-- ------------------------------------------------------------
-- 2. platform_subscriptions — support coaches
-- ------------------------------------------------------------
ALTER TABLE platform_subscriptions
  ALTER COLUMN gym_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE;

ALTER TABLE platform_subscriptions
  DROP CONSTRAINT IF EXISTS chk_subscription_owner,
  ADD CONSTRAINT chk_subscription_owner
    CHECK (num_nonnulls(gym_id, coach_id) = 1);

CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_coach_id
  ON platform_subscriptions (coach_id);

-- RLS: coaches can read their own subscription
CREATE POLICY "coach reads own subscription" ON platform_subscriptions
  FOR SELECT
  USING (
    coach_id IN (
      SELECT id FROM coaches WHERE profile_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 3. platform_billing_records — support coaches
-- ------------------------------------------------------------
ALTER TABLE platform_billing_records
  ALTER COLUMN gym_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE;

ALTER TABLE platform_billing_records
  DROP CONSTRAINT IF EXISTS chk_billing_record_owner,
  ADD CONSTRAINT chk_billing_record_owner
    CHECK (num_nonnulls(gym_id, coach_id) = 1);

CREATE INDEX IF NOT EXISTS idx_pbr_coach_id
  ON platform_billing_records (coach_id);

-- RLS: coaches can read their own billing records
CREATE POLICY "coach reads own billing records" ON platform_billing_records
  FOR SELECT
  USING (
    coach_id IN (
      SELECT id FROM coaches WHERE profile_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 4. View: online_coach_list
--    Solo online coaches (gym_id IS NULL) with billing and plan info
--    sourced from the shared platform billing tables.
-- ------------------------------------------------------------
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
  (sub.status = 'active')                   AS is_billing_active,
  sub.started_at                            AS last_billing_at,

  -- plan
  sp.name                                   AS plan_name,
  sp.member_limit

FROM coaches c
JOIN  profiles p  ON p.id = c.profile_id
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

