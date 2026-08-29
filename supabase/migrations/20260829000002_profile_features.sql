-- Add bio and city to profiles if not exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Function to safely delete own account (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete from dependent tables (manual cascade)
  DELETE FROM public.messages WHERE sender_id = v_uid OR receiver_id = v_uid;
  DELETE FROM public.reviews WHERE reviewer_id = v_uid OR reviewee_id = v_uid;
  DELETE FROM public.bookings WHERE renter_id = v_uid;
  
  -- Listings images are tied to listings, so delete them first
  DELETE FROM public.listing_images WHERE listing_id IN (SELECT id FROM public.listings WHERE owner_id = v_uid);
  DELETE FROM public.listings WHERE owner_id = v_uid;
  
  -- Finally delete profile and user
  DELETE FROM public.profiles WHERE id = v_uid;
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

-- Setup storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for avatars
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
