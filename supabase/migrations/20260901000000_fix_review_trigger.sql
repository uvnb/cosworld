CREATE OR REPLACE FUNCTION public.update_review_score()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_rating NUMERIC;
BEGIN
  -- We don't update reputation_score based on review anymore, to avoid conflict with reputation_votes.
  -- Or if we want to, we could store it in a separate column like 'avg_rating'.
  -- For now, we just do nothing to avoid breaking the +1/-1 reputation system.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_reputation ON reviews;

CREATE TRIGGER trigger_update_reputation
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_review_score();
