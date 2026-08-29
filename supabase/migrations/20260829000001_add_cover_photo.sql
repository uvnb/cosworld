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

-- 4. Update the trigger function: unique slug + reputation_score = 0
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  v_base_username TEXT;
  v_phone_suffix TEXT;
  v_unique_slug TEXT;
BEGIN
  -- Base username from signup form or email
  v_base_username := LOWER(COALESCE(
    NEW.raw_user_meta_data->>'username', 
    SPLIT_PART(NEW.email, '@', 1)
  ));
  
  -- Get last 4 digits of phone (if provided) or short UUID hash
  v_phone_suffix := COALESCE(
    RIGHT(REGEXP_REPLACE(NEW.raw_user_meta_data->>'phone', '[^0-9]', '', 'g'), 4),
    SUBSTR(REPLACE(NEW.id::text, '-', ''), 1, 4)
  );
  
  -- Combine: username-xxxx (e.g. uvnb-0903 or uvnb-a3f2)
  v_unique_slug := v_base_username || '-' || v_phone_suffix;

  INSERT INTO public.profiles (id, username, full_name, avatar_url, phone, facebook_url, reputation_score)
  VALUES (
    NEW.id,
    v_unique_slug,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      'https://ui-avatars.com/api/?name=' || COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1))
    ),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'facebook_url',
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
