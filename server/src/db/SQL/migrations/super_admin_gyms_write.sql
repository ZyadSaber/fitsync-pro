-- Super admin write policies for gyms.
-- The base "gym admin access" policy is USING (owner_id = auth.uid()), which
-- also acts as the INSERT/UPDATE check — so a super admin creating or editing a
-- gym on behalf of another owner is rejected ("new row violates row-level
-- security policy for table gyms"). Add a FOR ALL policy scoped to super admins.
-- Uses public.is_super_admin() (SECURITY DEFINER) to avoid recursion.

DROP POLICY IF EXISTS "super admin writes all gyms" ON gyms;

CREATE POLICY "super admin writes all gyms" ON gyms
  FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
