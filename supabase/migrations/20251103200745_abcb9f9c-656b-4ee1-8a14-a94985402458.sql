-- Create competitor_solutions table
CREATE TABLE public.competitor_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES public.company_competitors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Basic Info
  name TEXT NOT NULL,
  category TEXT,
  short_description TEXT,
  long_description TEXT,
  external_url TEXT,
  logo_url TEXT,
  
  -- Comprehensive Data (full solution profile)
  positioning TEXT,
  unique_value_propositions JSONB DEFAULT '[]'::jsonb,
  key_differentiators JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  use_cases JSONB DEFAULT '[]'::jsonb,
  pain_points JSONB DEFAULT '[]'::jsonb,
  target_audience JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  
  -- Pricing & Technical
  pricing JSONB,
  technical_specs JSONB,
  integrations JSONB DEFAULT '[]'::jsonb,
  
  -- Case Studies & Resources
  case_studies JSONB DEFAULT '[]'::jsonb,
  resources JSONB DEFAULT '[]'::jsonb,
  
  -- Market & SEO
  tags JSONB DEFAULT '[]'::jsonb,
  market_data JSONB,
  
  -- Metadata
  discovery_source TEXT,
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.competitor_solutions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their competitor solutions"
  ON public.competitor_solutions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their competitor solutions"
  ON public.competitor_solutions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their competitor solutions"
  ON public.competitor_solutions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their competitor solutions"
  ON public.competitor_solutions FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_competitor_solutions_competitor ON public.competitor_solutions(competitor_id);
CREATE INDEX idx_competitor_solutions_user ON public.competitor_solutions(user_id);
CREATE INDEX idx_competitor_solutions_created ON public.competitor_solutions(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_competitor_solutions_updated_at
  BEFORE UPDATE ON public.competitor_solutions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();