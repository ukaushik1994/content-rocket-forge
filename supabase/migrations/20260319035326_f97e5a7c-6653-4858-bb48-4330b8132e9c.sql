-- User Intelligence Profile: persistent per-user preferences learned over time
CREATE TABLE public.user_intelligence_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_length text DEFAULT 'medium',
  preferred_tone text[] DEFAULT '{}',
  preferred_formats text[] DEFAULT '{}',
  editing_patterns jsonb DEFAULT '{}',
  top_topics text[] DEFAULT '{}',
  top_solutions text[] DEFAULT '{}',
  prefers_negotiation boolean DEFAULT true,
  avg_response_detail text DEFAULT 'medium',
  profile_version integer DEFAULT 1,
  last_aggregated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_intelligence_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.user_intelligence_profile
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_intelligence_profile
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_intelligence_profile
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON public.user_intelligence_profile
  FOR ALL TO service_role USING (true);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_intelligence_profile
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();