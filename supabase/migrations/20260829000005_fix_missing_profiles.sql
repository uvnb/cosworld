-- Fix missing profiles that cause foreign key constraint violation on listings
-- This script creates a trigger to automatically create a profile for new users
-- and backfills any existing users who are missing a profile.

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username', 
      SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTR(NEW.id::text, 1, 6)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      'https://ui-avatars.com/api/?name=' || COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1))
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill existing auth.users who don't have a profile yet
INSERT INTO public.profiles (id, username, full_name, avatar_url)
SELECT 
  id,
  COALESCE(
    raw_user_meta_data->>'username', 
    SPLIT_PART(email, '@', 1) || '_' || SUBSTR(id::text, 1, 6)
  ),
  COALESCE(
    raw_user_meta_data->>'full_name',
    SPLIT_PART(email, '@', 1)
  ),
  COALESCE(
    raw_user_meta_data->>'avatar_url',
    'https://ui-avatars.com/api/?name=' || COALESCE(raw_user_meta_data->>'full_name', SPLIT_PART(email, '@', 1))
  )
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
