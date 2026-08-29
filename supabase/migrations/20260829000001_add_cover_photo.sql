-- =====================================================
-- Migration: Fix reputation_score, add cover_photo_url, unique slug
-- Run this ENTIRE script in Supabase SQL Editor
-- =====================================================

-- 1. Add cover_photo_url column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'cover_photo_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN cover_photo_url TEXT;
  END IF;
END $$;

-- 2. Fix reputation_score default from 5.0 to 0.0
ALTER TABLE profiles ALTER COLUMN reputation_score SET DEFAULT 0.0;

-- 3. Reset all existing users' reputation_score to 0
UPDATE profiles SET reputation_score = 0 WHERE reputation_score = 5;

-- 4. Update the trigger function: reversed phone as slug + reputation_score = 0
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  v_phone TEXT;
  v_unique_slug TEXT;
  v_display_name TEXT;
BEGIN
  -- Extract phone numbers only
  v_phone := REGEXP_REPLACE(NEW.raw_user_meta_data->>'phone', '[^0-9]', '', 'g');
  
  -- Generate unique slug: Reversed 10-digit phone number
  IF v_phone IS NOT NULL AND LENGTH(v_phone) >= 9 THEN
    v_unique_slug := REVERSE(RIGHT(v_phone, 10));
  ELSE
    -- Fallback if no phone: reverse first 10 chars of UUID
    v_unique_slug := REVERSE(SUBSTR(REPLACE(NEW.id::text, '-', ''), 1, 10));
  END IF;

  -- Map the "username" they typed in signup form to their Display Name (full_name)
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name', 
    SPLIT_PART(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, username, full_name, avatar_url, phone, facebook_url, reputation_score)
  VALUES (
    NEW.id,
    v_unique_slug,
    v_display_name,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      'https://ui-avatars.com/api/?name=' || v_display_name
    ),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'facebook_url',
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
