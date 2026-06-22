-- ============================================================
-- Fix infinite recursion in super admin RLS policies.
-- The original policies queried `profiles` from within a
-- `profiles` policy, causing infinite recursion (code 42P17).
--
-- Solution: a SECURITY DEFINER function reads `profiles` as
-- the function owner (bypasses RLS), breaking the cycle.
-- All super admin policies are rewritten to call it.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- profiles
DROP POLICY IF EXISTS "super admin reads all profiles" ON profiles;
CREATE POLICY "super admin reads all profiles" ON profiles
  FOR SELECT
  USING (public.is_super_admin());

-- platform_subscriptions
DROP POLICY IF EXISTS "super admin reads platform_subscriptions" ON platform_subscriptions;
DROP POLICY IF EXISTS "super admin writes platform_subscriptions" ON platform_subscriptions;

CREATE POLICY "super admin reads platform_subscriptions" ON platform_subscriptions
  FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "super admin writes platform_subscriptions" ON platform_subscriptions
  FOR ALL
  USING (public.is_super_admin());

-- platform_activity_log
DROP POLICY IF EXISTS "super admin reads platform_activity_log" ON platform_activity_log;
DROP POLICY IF EXISTS "super admin writes platform_activity_log" ON platform_activity_log;

CREATE POLICY "super admin reads platform_activity_log" ON platform_activity_log
  FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "super admin writes platform_activity_log" ON platform_activity_log
  FOR ALL
  USING (public.is_super_admin());

-- gyms
DROP POLICY IF EXISTS "super admin reads all gyms" ON gyms;
CREATE POLICY "super admin reads all gyms" ON gyms
  FOR SELECT
  USING (public.is_super_admin());
