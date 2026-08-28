-- Fix sequence permission denied for listing_images and any other tables
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Ensure table permissions are granted properly just in case
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- For profiles, the frontend uses foreign key joins to get avatar and username.
-- We must allow public read for profiles so those joins don't fail or return null.
-- We will add a policy to allow public read on profiles.
DROP POLICY IF EXISTS "Public can read profiles" ON profiles;
CREATE POLICY "Public can read profiles" ON profiles
  FOR SELECT USING (true);
