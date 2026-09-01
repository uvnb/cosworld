-- 1. Fix the reviews trigger conflict
-- Renaming the function used by reviews so it doesn't conflict with reputation_votes
CREATE OR REPLACE FUNCTION public.update_review_score()
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

DROP TRIGGER IF EXISTS trigger_update_reputation ON reviews;

CREATE TRIGGER trigger_update_reputation
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_review_score();

-- 2. Fix the user deletion error (foreign key constraints)
-- Add ON DELETE CASCADE to events.submitted_by if it's missing
ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_submitted_by_fkey,
  ADD CONSTRAINT events_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES auth.users(id) ON DELETE CASCADE;
