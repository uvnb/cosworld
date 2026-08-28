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
