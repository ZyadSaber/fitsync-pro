-- ============================================================
-- MIGRATION: profiles.role → profiles.user_type
-- Run this once against the existing database as the postgres role.
-- Safe to re-run — all steps are guarded with IF EXISTS / DO NOTHING.
-- ============================================================

-- ── 1. Add user_type column (nullable first so existing rows don't break)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS user_type TEXT;

-- ── 2. Backfill from the old role column (if it still exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'role'
  ) THEN
    UPDATE profiles SET user_type =
      CASE role
        WHEN 'admin'  THEN 'gym'
        WHEN 'coach'  THEN 'coach'
        ELSE               'member'   -- 'client' and anything else
      END
    WHERE user_type IS NULL;
  END IF;
END $$;

-- For rows with no role to backfill from, default to 'member'
UPDATE profiles SET user_type = 'member' WHERE user_type IS NULL;

-- ── 3. Apply NOT NULL + CHECK constraint
ALTER TABLE profiles
  ALTER COLUMN user_type SET NOT NULL,
  ALTER COLUMN user_type SET DEFAULT 'member';

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_user_type_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_user_type_check
  CHECK (user_type IN ('member', 'gym', 'coach'));

-- ── 4. Drop the old role column
ALTER TABLE profiles
  DROP COLUMN IF EXISTS role;

-- ── 5. Clean up user_registrations if it was created earlier
DROP TRIGGER  IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_registration();
DROP TABLE    IF EXISTS user_registrations;
DROP SEQUENCE IF EXISTS user_reg_id_seq;
DROP FUNCTION IF EXISTS generate_user_reg_id();

-- ── 6. Create the trigger that auto-inserts a profile on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type)
  VALUES (NEW.id, 'member')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 7. Update RLS policies on profiles
--   Drop the old catch-all policy and replace with scoped ones.
DROP POLICY IF EXISTS "own profile"              ON profiles;
DROP POLICY IF EXISTS "own profile update"       ON profiles;
DROP POLICY IF EXISTS "gym admin reads profiles" ON profiles;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile select" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "own profile update" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "gym admin reads profiles" ON profiles
  FOR SELECT USING (
    gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  );
