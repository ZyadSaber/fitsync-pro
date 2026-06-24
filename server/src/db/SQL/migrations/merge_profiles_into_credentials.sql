-- ============================================================
-- MIGRATION: merge `profiles` into `user_credentials`
--
-- Collapses the two-table identity model (profiles + user_credentials)
-- into a single `user_credentials` table that holds everything: identity,
-- role, and login credentials. `profiles` is removed.
--
-- Lossless: profiles is the superset (one row per user, incl. logins-less
-- members/clients), so we add the credential columns onto profiles, backfill
-- them from user_credentials, drop the old credentials table, then rename
-- profiles -> user_credentials. All foreign keys that referenced profiles(id)
-- and all views that referenced profiles follow the rename automatically.
--
-- Safe to re-run — the whole body is guarded on `profiles` still existing.
-- Run as the postgres / service role:  bun run db:migrate
-- ============================================================

DO $$
BEGIN
  -- Only the pre-merge state has a `profiles` table; once renamed this is a no-op.
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN

    -- ── 1. Add the credential columns onto profiles (nullable: not every
    --        user is login-capable). ──────────────────────────────────────
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email         TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ NOT NULL DEFAULT now();

    -- ── 2. Backfill login data from user_credentials, then drop it. ───────
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'user_credentials'
    ) THEN
      UPDATE profiles p
         SET email         = c.email,
             password_hash = c.password_hash,
             updated_at    = c.updated_at
        FROM user_credentials c
       WHERE c.profile_id = p.id;

      DROP TABLE user_credentials;
    END IF;

    -- ── 3. profiles is now the single identity+credentials table. ─────────
    ALTER TABLE profiles RENAME TO user_credentials;

    -- ── 4. Re-create the case-insensitive unique email constraint
    --        (only across rows that actually have an email). ──────────────
    CREATE UNIQUE INDEX IF NOT EXISTS user_credentials_email_lower_idx
      ON user_credentials (lower(email)) WHERE email IS NOT NULL;

  END IF;
END $$;
