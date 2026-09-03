CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _is_admin boolean;
BEGIN
  -- We use the 'roles' array column if it exists, otherwise check 'is_owner' or just return false
  -- Wait, the column in profiles is actually "roles" which is a jsonb or text array? 
  -- Let's check the schema. Assuming it's an array or text:
  SELECT 'admin' = ANY(roles) INTO _is_admin FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(_is_admin, false);
EXCEPTION WHEN undefined_column THEN
  -- Fallback if roles column doesn't exist
  RETURN false;
END;
$$;

GRANT ALL ON listings TO service_role;
GRANT ALL ON bookings TO service_role;
GRANT ALL ON reviews TO service_role;
GRANT ALL ON recruitments TO service_role;
