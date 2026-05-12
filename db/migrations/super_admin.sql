-- ============================================================
-- Super Admin Migration
-- Adds is_super_admin flag, platform_subscriptions table,
-- platform_activity_log table, and RLS policies for each.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Add is_super_admin to profiles
-- ------------------------------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- Super admins can read every profile row.
-- Regular users cannot see or query this column through RLS
-- because the existing policies already scope them to their own
-- row / gym, and we never expose is_super_admin in those policies.
CREATE POLICY "super admin reads all profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.is_super_admin = true
    )
  );

-- ------------------------------------------------------------
-- 2. platform_subscriptions — one row per gym per billing period
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id          UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  plan_name       TEXT NOT NULL
                  CHECK (plan_name IN ('starter', 'pro', 'enterprise')),
  price_egp       NUMERIC NOT NULL,
  billing_cycle   TEXT NOT NULL
                  CHECK (billing_cycle IN ('monthly', 'yearly')),
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'suspended', 'cancelled')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_billing_at TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE platform_subscriptions ENABLE ROW LEVEL SECURITY;

-- Only super admins can read subscription rows
CREATE POLICY "super admin reads platform_subscriptions" ON platform_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.is_super_admin = true
    )
  );

-- Only super admins can insert / update / delete subscription rows
CREATE POLICY "super admin writes platform_subscriptions" ON platform_subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.is_super_admin = true
    )
  );

-- ------------------------------------------------------------
-- 3. platform_activity_log — immutable audit trail
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id      UUID REFERENCES gyms(id) ON DELETE SET NULL,
  event_type  TEXT NOT NULL,   -- 'login' | 'member_add' | 'checkin' | 'plan_change' | …
  actor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE platform_activity_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can read the activity log
CREATE POLICY "super admin reads platform_activity_log" ON platform_activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.is_super_admin = true
    )
  );

-- Anyone authenticated can insert their own activity (append-only from app code).
-- Deletes and updates are blocked by omission — no policy covers them for non-super-admins.
CREATE POLICY "authenticated inserts activity" ON platform_activity_log
  FOR INSERT
  WITH CHECK (actor_id = auth.uid());

-- Super admins can write (manage) all log rows
CREATE POLICY "super admin writes platform_activity_log" ON platform_activity_log
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.is_super_admin = true
    )
  );

-- ------------------------------------------------------------
-- 4. RLS: super admin bypass on gyms table
-- The existing "gym admin access" policy uses owner_id = auth.uid(),
-- so super admins cannot see gyms they don't own. Add a read policy.
-- ------------------------------------------------------------
CREATE POLICY "super admin reads all gyms" ON gyms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.is_super_admin = true
    )
  );

-- ------------------------------------------------------------
-- 5. Helpful index for dashboard queries
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_gym_id
  ON platform_subscriptions (gym_id);

CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_status
  ON platform_subscriptions (status);

CREATE INDEX IF NOT EXISTS idx_platform_activity_log_gym_id
  ON platform_activity_log (gym_id);

CREATE INDEX IF NOT EXISTS idx_platform_activity_log_created_at
  ON platform_activity_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_activity_log_event_type
  ON platform_activity_log (event_type);
