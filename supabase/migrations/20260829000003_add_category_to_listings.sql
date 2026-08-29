-- Add category to listings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN category TEXT DEFAULT 'costume';
  END IF;
END $$;

-- Fix broken R2 URLs from earlier testing
UPDATE public.listing_images 
SET r2_url = REPLACE(r2_url, 'https://pub-c2a417088b9042b49df67d165f3f0194.r2.dev/', '/api/image?key=')
WHERE r2_url LIKE 'https://pub-c2a417088b9042b49df67d165f3f0194.r2.dev/%';
