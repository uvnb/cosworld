-- Migration to add specialized Cosplay fields to listings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'character_name'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN character_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'includes'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN includes TEXT[];
  END IF;
END $$;
