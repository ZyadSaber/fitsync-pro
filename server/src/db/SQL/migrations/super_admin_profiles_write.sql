-- Super admin write policies for profiles.
-- Uses public.is_super_admin() (SECURITY DEFINER) to avoid infinite
-- recursion — direct subqueries on profiles from within a profiles
-- policy cause error 42P17.

DROP POLICY IF EXISTS "super admin updates all profiles" ON profiles;
DROP POLICY IF EXISTS "super admin inserts profiles" ON profiles;

CREATE POLICY "super admin updates all profiles" ON profiles
  FOR UPDATE
  USING (public.is_super_admin());

CREATE POLICY "super admin inserts profiles" ON profiles
  FOR INSERT
  WITH CHECK (public.is_super_admin());
