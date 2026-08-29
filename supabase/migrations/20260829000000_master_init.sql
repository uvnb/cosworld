-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
-- Enable btree_gist extension for UUID exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ===== CORE USERS =====
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  -- Thông tin liên hệ PUBLIC (hiển thị dạng masked trên UI, dùng cho deep link chat)
  phone TEXT,           -- Zalo phone: hiển thị dạng '098***4321' trên UI
  zalo_link TEXT,       -- https://zalo.me/{phone} — public
  facebook_url TEXT,    -- https://m.me/{username} — public
  messenger_url TEXT,   -- alias của facebook_url cho rõ ràng
  reputation_score NUMERIC(3,1) DEFAULT 5.0, -- Điểm uy tín (1.0 - 5.0)
  total_reviews INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_owner BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')), -- phân quyền admin
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== FOLLOW SYSTEM =====
CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- ===== TAG SYSTEM (Multi-tier) =====
CREATE TABLE tag_categories ( -- Tier 1: Anime, Game, Phụ kiện...
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE tags ( -- Tier 2: Nhân vật, Danh mục
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES tag_categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_tag_id INT REFERENCES tags(id) -- Tier 3 nesting
);

-- ===== LISTINGS =====
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  -- Phân loại Thuê vs Bán pass
  listing_type TEXT DEFAULT 'rent' CHECK (listing_type IN ('rent', 'sale', 'both')),
  size TEXT CHECK (size IN ('XS','S','M','L','XL','XXL','One-size')),
  price_per_day NUMERIC(12,0),      -- NULL nếu listing_type = 'sale'
  sale_price NUMERIC(12,0),         -- NULL nếu listing_type = 'rent'
  deposit_amount NUMERIC(12,0) DEFAULT 0,
  buffer_days INT DEFAULT 1 CHECK (buffer_days BETWEEN 1 AND 3),
  min_rental_days INT DEFAULT 1,
  max_rental_days INT DEFAULT 30,
  -- Location (privacy-aware)
  exact_location GEOGRAPHY(POINT, 4326), -- private, không expose qua RLS
  fuzzy_location GEOGRAPHY(POINT, 4326), -- public (±500m offset)
  district TEXT,
  city TEXT,
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','inactive','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE listing_images (
  id SERIAL PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  r2_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_cover BOOLEAN DEFAULT FALSE
);

CREATE TABLE listing_tags (
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  tag_id INT REFERENCES tags(id),
  PRIMARY KEY (listing_id, tag_id)
);

-- ===== BOOKINGS =====
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  renter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  buffer_end_date DATE NOT NULL,
  total_rental_fee NUMERIC(12,0) NOT NULL,
  deposit_amount NUMERIC(12,0) NOT NULL,
  total_amount NUMERIC(12,0) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending','confirmed','active','completed','cancelled','expired','disputed'
  )),
  -- Soft lock: chỉ giữ lịch 60 phút
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '60 minutes'),
  addon_services JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== CALENDAR LOCK (Anti-double booking) =====
CREATE TABLE calendar_locks (
  id SERIAL PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL, -- includes buffer
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  lock_type TEXT CHECK (lock_type IN ('booking','buffer','manual_block')),
  EXCLUDE USING GIST (
    listing_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  ) -- PostgreSQL exclusion constraint = chống trùng lịch tuyệt đối
);

-- Trigger: Giải phóng calendar_lock ngay khi booking cancelled/expired
CREATE OR REPLACE FUNCTION release_calendar_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('cancelled', 'expired') AND OLD.status NOT IN ('cancelled', 'expired') THEN
    DELETE FROM calendar_locks WHERE booking_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_release_calendar
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW EXECUTE FUNCTION release_calendar_on_cancel();

-- ===== REVIEWS =====
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  reviewer_role TEXT CHECK (reviewer_role IN ('renter','owner')),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== REPORTS (Báo cáo bùng cọc / vi phạm) =====
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  reason TEXT NOT NULL, -- 'no_show', 'damaged_item', 'wrong_item', 'scam', 'other'
  description TEXT,
  evidence_urls TEXT[], -- mảng URL ảnh bằng chứng trên R2
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== EVENTS =====
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  venue TEXT,
  city TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  poster_url TEXT,
  source_url TEXT,
  -- Crowdsourcing: BTC / cộng đồng tự đăng, admin chỉ duyệt
  submitted_by UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL = auto-crawled
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  source_type TEXT DEFAULT 'manual' CHECK (source_type IN ('manual', 'crowdsourced', 'crawled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== ADD-ON SERVICES =====
CREATE TABLE addon_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  service_type TEXT CHECK (service_type IN ('makeup','photographer','staff')),
  title TEXT NOT NULL,
  price_per_session NUMERIC(12,0),
  city TEXT,
  contact_info JSONB -- {zalo, facebook, phone}
);

-- ===== NOTIFICATIONS =====
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'booking_confirmed', 'new_review', 'booking_reminder'...
  title TEXT NOT NULL,
  body TEXT,
  reference_id TEXT, -- booking_id or listing_id
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- RLS POLICIES
-- =========================================================================

-- Listings
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active listings" ON listings
  FOR SELECT USING (status = 'active');
CREATE POLICY "Owner manages own listings" ON listings
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admin can manage all" ON listings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner sees own full profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin sees all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Owner manages own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- View công khai: ẩn phone thật
CREATE OR REPLACE VIEW public_profiles AS
  SELECT
    id, username, full_name, avatar_url, bio,
    CONCAT(LEFT(phone, 3), '***', RIGHT(phone, 3)) AS masked_phone,
    zalo_link,    -- an toàn, không lộ phone gốc
    facebook_url,
    reputation_score, total_reviews, is_verified, is_owner, created_at
  FROM profiles;

-- Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants only" ON bookings
  FOR SELECT USING (
    auth.uid() = renter_id OR auth.uid() = owner_id
  );
CREATE POLICY "Renter can create booking" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = renter_id);
CREATE POLICY "Owner can update booking status" ON bookings
  FOR UPDATE USING (auth.uid() = owner_id);

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published reviews" ON reviews
  FOR SELECT USING (is_published = TRUE OR reviewer_id = auth.uid());
CREATE POLICY "Only review completed bookings" ON reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_id AND status = 'completed'
      AND (renter_id = auth.uid() OR owner_id = auth.uid())
    )
  );

-- Reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reporter or admin" ON reports
  FOR SELECT USING (
    auth.uid() = reporter_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================================================================
-- BOOKING RPC
-- =========================================================================
CREATE OR REPLACE FUNCTION create_booking(
  p_listing_id UUID,
  p_renter_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS bookings AS $$
DECLARE
  v_listing listings%ROWTYPE;
  v_booking bookings%ROWTYPE;
  v_buffer_end DATE;
  v_pending_count INT;
BEGIN
  -- Chống spam: tối đa 3 pending booking / tài khoản
  SELECT COUNT(*) INTO v_pending_count
  FROM bookings WHERE renter_id = p_renter_id AND status = 'pending';
  IF v_pending_count >= 3 THEN
    RAISE EXCEPTION 'MAX_PENDING_REACHED';
  END IF;

  SELECT * INTO v_listing FROM listings WHERE id = p_listing_id FOR UPDATE;

  -- Chỉ check lock còn hiệu lực
  IF EXISTS (
    SELECT 1 FROM calendar_locks cl
    JOIN bookings b ON b.id = cl.booking_id
    WHERE cl.listing_id = p_listing_id
    AND b.status NOT IN ('cancelled', 'expired')
    AND daterange(cl.start_date, cl.end_date, '[]') && daterange(p_start_date, p_end_date, '[]')
  ) THEN
    RAISE EXCEPTION 'DATES_UNAVAILABLE';
  END IF;

  v_buffer_end := p_end_date + v_listing.buffer_days;

  -- Insert booking với soft-lock 60 phút
  INSERT INTO bookings (listing_id, renter_id, owner_id, start_date, end_date,
    buffer_end_date, total_rental_fee, deposit_amount, total_amount, expires_at)
  VALUES (p_listing_id, p_renter_id, v_listing.owner_id, p_start_date, p_end_date,
    v_buffer_end, 0, 0, 0, NOW() + INTERVAL '60 minutes')
  RETURNING * INTO v_booking;

  INSERT INTO calendar_locks (listing_id, start_date, end_date, booking_id, lock_type)
  VALUES (p_listing_id, p_start_date, v_buffer_end, v_booking.id, 'booking');

  RETURN v_booking;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION search_listings(
    lat double precision,
    lng double precision,
    radius_meters double precision,
    search_query text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    title text,
    price_per_day integer,
    sale_price integer,
    city text,
    listing_type text,
    size text,
    created_at timestamptz,
    owner_id uuid,
    distance double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id, l.title, l.price_per_day, l.sale_price, l.city, l.listing_type, l.size, l.created_at, l.owner_id,
        ST_Distance(l.location::geography, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) as distance
    FROM listings l
    WHERE l.status = 'active'
      AND (l.location IS NOT NULL)
      AND ST_DWithin(l.location::geography, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_meters)
      AND (search_query IS NULL OR l.title ILIKE '%' || search_query || '%')
    ORDER BY distance ASC;
END;
$$;
-- 1. Favorites Table (Heart/Like listings)
CREATE TABLE favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

-- 2. Followers Table
CREATE TABLE followers (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- 3. Reputation Score Trigger
-- Tính trung bình rating từ bảng reviews và cập nhật vào profiles.reputation_score
CREATE OR REPLACE FUNCTION update_reputation_score()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_rating NUMERIC;
BEGIN
  -- Lấy trung bình số sao của người được đánh giá
  SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0) INTO v_avg_rating
  FROM reviews
  WHERE reviewee_id = NEW.reviewee_id AND is_published = TRUE;

  -- Cập nhật vào profiles
  UPDATE profiles
  SET reputation_score = v_avg_rating
  WHERE id = NEW.reviewee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reputation
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_reputation_score();
-- Fix for infinite recursion detected in policy for relation "profiles"
-- Using plpgsql instead of sql to prevent query inlining which loses SECURITY DEFINER context

-- Drop the old recursive policies
DROP POLICY IF EXISTS "Admin sees all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can manage all" ON listings;
DROP POLICY IF EXISTS "Reporter or admin" ON reports;

-- Create a secure helper function that bypasses RLS to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS
SET search_path = public
AS $$
DECLARE
  _is_admin boolean;
BEGIN
  SELECT role = 'admin' INTO _is_admin FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(_is_admin, false);
END;
$$;

-- 1. Create the new non-recursive policy for profiles
CREATE POLICY "Admin sees all profiles" ON profiles
  FOR SELECT USING (
    public.is_admin()
  );

-- 2. Update the admin policy on listings
CREATE POLICY "Admin can manage all" ON listings
  FOR ALL USING (
    public.is_admin()
  );

-- 3. Update the admin policy on reports (from line 269 in init.sql)
CREATE POLICY "Reporter or admin" ON reports
  FOR SELECT USING (
    auth.uid() = reporter_id OR public.is_admin()
  );

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
-- Fix missing profiles that cause foreign key constraint violation on listings
-- This script creates a trigger to automatically create a profile for new users
-- and backfills any existing users who are missing a profile.

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, phone, facebook_url)
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
    ),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'facebook_url'
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


-- ===== ACCOUNT MANAGEMENT =====
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

  -- With ON DELETE CASCADE applied to all tables, we just need to delete from auth.users
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

-- ===== REPUTATION SYSTEM =====
-- Create reputation_votes table to track who voted for whom
CREATE TABLE IF NOT EXISTS public.reputation_votes (
  id SERIAL PRIMARY KEY,
  voter_id UUID REFERENCES auth.users(id) NOT NULL,
  profile_id UUID REFERENCES auth.users(id) NOT NULL,
  vote_value INT NOT NULL CHECK (vote_value IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(voter_id, profile_id)
);

-- Trigger to update reputation_score automatically
CREATE OR REPLACE FUNCTION public.update_reputation_score()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET reputation_score = COALESCE(reputation_score, 0) + NEW.vote_value 
    WHERE id = NEW.profile_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.profiles 
    SET reputation_score = COALESCE(reputation_score, 0) - OLD.vote_value + NEW.vote_value 
    WHERE id = NEW.profile_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET reputation_score = COALESCE(reputation_score, 0) - OLD.vote_value 
    WHERE id = OLD.profile_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_reputation_vote ON public.reputation_votes;
CREATE TRIGGER on_reputation_vote
AFTER INSERT OR UPDATE OR DELETE ON public.reputation_votes
FOR EACH ROW EXECUTE FUNCTION public.update_reputation_score();

-- Reset all existing reputation scores to 0 (as requested)
UPDATE public.profiles SET reputation_score = 0;

-- Set up RLS for reputation_votes
ALTER TABLE public.reputation_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read reputation votes" ON public.reputation_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote once" ON public.reputation_votes FOR INSERT WITH CHECK (auth.uid() = voter_id);
CREATE POLICY "Users can change their vote" ON public.reputation_votes FOR UPDATE USING (auth.uid() = voter_id);
CREATE POLICY "Users can remove their vote" ON public.reputation_votes FOR DELETE USING (auth.uid() = voter_id);
