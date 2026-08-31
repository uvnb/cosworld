CREATE TABLE public.saved_events (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id)
);

ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved events" ON saved_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own saved events" ON saved_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved events" ON saved_events
  FOR DELETE USING (auth.uid() = user_id);
