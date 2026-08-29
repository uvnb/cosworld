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
