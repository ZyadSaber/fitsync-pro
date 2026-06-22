-- ============================================================
-- MIGRATION: custom JWT auth (decouple from Supabase auth.users)
--
-- The app now manages its own credentials and issues its own JWTs, so
-- `profiles` (and the tables that pointed at auth.users) must no longer
-- depend on Supabase Auth. Safe to re-run — every step is guarded.
-- Run as the postgres / service role:  bun run db:migrate
-- ============================================================

-- ── 1. Stop Supabase Auth from driving profile creation ─────────────────────
DROP TRIGGER  IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- ── 2. Make profiles standalone (id no longer references auth.users) ────────
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Allow the 'client' user_type used by the app's role routing.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_user_type_check
  CHECK (user_type IN ('member', 'gym', 'coach', 'client'));

-- is_super_admin already added by super_admin.sql; guard for fresh DBs.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- ── 3. Repoint gyms.owner_id at profiles(id) instead of auth.users ──────────
ALTER TABLE gyms DROP CONSTRAINT IF EXISTS gyms_owner_id_fkey;
ALTER TABLE gyms
  ADD CONSTRAINT gyms_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- ── 4. Repoint platform_activity_log.actor_id (if the table exists) ─────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'platform_activity_log'
  ) THEN
    EXECUTE 'ALTER TABLE platform_activity_log DROP CONSTRAINT IF EXISTS platform_activity_log_actor_id_fkey';
    EXECUTE 'ALTER TABLE platform_activity_log
             ADD CONSTRAINT platform_activity_log_actor_id_fkey
             FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE SET NULL';
  END IF;
END $$;

-- ── 5. Credentials table — one row per login-capable profile ────────────────
CREATE TABLE IF NOT EXISTS user_credentials (
  profile_id    UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_credentials_email_lower_idx
  ON user_credentials (lower(email));
