-- Comprehensive fix for listings permission denied
-- Drops all existing policies on listings and recreates them cleanly

DROP POLICY IF EXISTS "Public read active listings" ON listings;
DROP POLICY IF EXISTS "Owner manages own listings" ON listings;
DROP POLICY IF EXISTS "Admin can manage all" ON listings;
DROP POLICY IF EXISTS "Owner insert listings" ON listings;
DROP POLICY IF EXISTS "Owner select listings" ON listings;
DROP POLICY IF EXISTS "Owner update listings" ON listings;
DROP POLICY IF EXISTS "Owner delete listings" ON listings;

-- Ensure role permissions
GRANT ALL ON listings TO authenticated;
GRANT ALL ON listings TO anon;
GRANT ALL ON listing_images TO authenticated;
GRANT ALL ON listing_images TO anon;

-- Recreate policies explicitly for each operation
CREATE POLICY "Public read active listings" ON listings
  FOR SELECT USING (status = 'active');

CREATE POLICY "Owner select own listings" ON listings
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owner insert own listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owner update own listings" ON listings
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owner delete own listings" ON listings
  FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Admin select listings" ON listings
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin update listings" ON listings
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin delete listings" ON listings
  FOR DELETE USING (public.is_admin());

-- Ensure listing_images also has proper explicit policies just in case
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read listing_images" ON listing_images;
DROP POLICY IF EXISTS "Owner manages listing_images" ON listing_images;

CREATE POLICY "Public read listing_images" ON listing_images
  FOR SELECT USING (true);

CREATE POLICY "Owner insert listing_images" ON listing_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = listing_id AND listings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner update listing_images" ON listing_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = listing_id AND listings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner delete listing_images" ON listing_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = listing_id AND listings.owner_id = auth.uid()
    )
  );
