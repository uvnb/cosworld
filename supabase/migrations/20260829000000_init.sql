-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
-- Enable btree_gist extension for UUID exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ===== CORE USERS =====
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
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
  follower_id UUID REFERENCES profiles(id),
  following_id UUID REFERENCES profiles(id),
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
  owner_id UUID REFERENCES profiles(id) NOT NULL,
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
  listing_id UUID REFERENCES listings(id) NOT NULL,
  renter_id UUID REFERENCES profiles(id) NOT NULL,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
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
  booking_id UUID REFERENCES bookings(id),
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
  booking_id UUID REFERENCES bookings(id) UNIQUE,
  reviewer_id UUID REFERENCES profiles(id),
  reviewee_id UUID REFERENCES profiles(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  reviewer_role TEXT CHECK (reviewer_role IN ('renter','owner')),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== REPORTS (Báo cáo bùng cọc / vi phạm) =====
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) NOT NULL,
  reported_user_id UUID REFERENCES profiles(id) NOT NULL,
  booking_id UUID REFERENCES bookings(id),
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
  submitted_by UUID REFERENCES profiles(id), -- NULL = auto-crawled
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  source_type TEXT DEFAULT 'manual' CHECK (source_type IN ('manual', 'crowdsourced', 'crawled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== ADD-ON SERVICES =====
CREATE TABLE addon_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id),
  service_type TEXT CHECK (service_type IN ('makeup','photographer','staff')),
  title TEXT NOT NULL,
  price_per_session NUMERIC(12,0),
  city TEXT,
  contact_info JSONB -- {zalo, facebook, phone}
);

-- ===== NOTIFICATIONS =====
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
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
