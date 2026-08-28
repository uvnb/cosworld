-- Fix for infinite recursion detected in policy for relation "profiles"
-- Using plpgsql instead of sql to prevent query inlining which loses SECURITY DEFINER context

-- Drop the old recursive policies
DROP POLICY IF EXISTS "Admin sees all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can manage all" ON listings;
DROP POLICY IF EXISTS "Reporter or admin" ON reports;

-- Create a secure helper function that bypasses RLS to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS
SET search_path = public
AS $$
DECLARE
  _is_admin boolean;
BEGIN
  SELECT role = 'admin' INTO _is_admin FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(_is_admin, false);
END;
$$;

-- 1. Create the new non-recursive policy for profiles
CREATE POLICY "Admin sees all profiles" ON profiles
  FOR SELECT USING (
    public.is_admin()
  );

-- 2. Update the admin policy on listings
CREATE POLICY "Admin can manage all" ON listings
  FOR ALL USING (
    public.is_admin()
  );

-- 3. Update the admin policy on reports (from line 269 in init.sql)
CREATE POLICY "Reporter or admin" ON reports
  FOR SELECT USING (
    auth.uid() = reporter_id OR public.is_admin()
  );

