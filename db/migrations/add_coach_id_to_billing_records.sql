-- Migration: ensure coach_id exists on platform_subscriptions and
-- platform_billing_records, and force a PostgREST schema-cache reload.
--
-- Symptom this fixes:
--   PGRST204: Could not find the 'coach_id' column of
--   'platform_billing_records' in the schema cache.
--
-- Safe to run multiple times.
-- ------------------------------------------------------------

-- 1. platform_subscriptions — coach_id (no-op if already present)
ALTER TABLE platform_subscriptions
  ALTER COLUMN gym_id DROP NOT NULL;

ALTER TABLE platform_subscriptions
  ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE;

ALTER TABLE platform_subscriptions
  DROP CONSTRAINT IF EXISTS chk_subscription_owner;

ALTER TABLE platform_subscriptions
  ADD CONSTRAINT chk_subscription_owner
    CHECK (num_nonnulls(gym_id, coach_id) = 1);

CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_coach_id
  ON platform_subscriptions (coach_id);

-- 2. platform_billing_records — coach_id (the missing piece)
ALTER TABLE platform_billing_records
  ALTER COLUMN gym_id DROP NOT NULL;

ALTER TABLE platform_billing_records
  ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE;

ALTER TABLE platform_billing_records
  DROP CONSTRAINT IF EXISTS chk_billing_record_owner;

ALTER TABLE platform_billing_records
  ADD CONSTRAINT chk_billing_record_owner
    CHECK (num_nonnulls(gym_id, coach_id) = 1);

CREATE INDEX IF NOT EXISTS idx_pbr_coach_id
  ON platform_billing_records (coach_id);

-- 3. RLS — coach can read own subscription + billing records
DROP POLICY IF EXISTS "coach reads own subscription" ON platform_subscriptions;
CREATE POLICY "coach reads own subscription" ON platform_subscriptions
  FOR SELECT
  USING (
    coach_id IN (
      SELECT id FROM coaches WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "coach reads own billing records" ON platform_billing_records;
CREATE POLICY "coach reads own billing records" ON platform_billing_records
  FOR SELECT
  USING (
    coach_id IN (
      SELECT id FROM coaches WHERE profile_id = auth.uid()
    )
  );

-- 4. Force PostgREST to reload its schema cache so the new column is
-- visible to the REST API immediately (otherwise PGRST204 persists).
NOTIFY pgrst, 'reload schema';
