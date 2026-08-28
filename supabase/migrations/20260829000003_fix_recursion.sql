-- Fix for infinite recursion detected in policy for relation "profiles"

-- Drop the old recursive policy
DROP POLICY IF EXISTS "Admin sees all profiles" ON profiles;

-- Create a secure helper function that bypasses RLS to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER -- Bypasses RLS
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Create the new non-recursive policy using the helper function
CREATE POLICY "Admin sees all profiles" ON profiles
  FOR SELECT USING (
    public.is_admin()
  );

-- Update the admin policy on listings to also use the helper function for consistency
DROP POLICY IF EXISTS "Admin can manage all" ON listings;
CREATE POLICY "Admin can manage all" ON listings
  FOR ALL USING (
    public.is_admin()
  );
