-- Create additional tables for the complete OpportunityHunter system

-- Create opportunity_seeds table for storing seed keywords and topics
CREATE TABLE public.opportunity_seeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  strategy_id UUID REFERENCES public.content_strategies(id),
  keyword TEXT NOT NULL,
  topic_cluster TEXT,
  search_volume INTEGER,
  is_active BOOLEAN DEFAULT true,
  last_scanned TIMESTAMP WITH TIME ZONE,
  scan_frequency TEXT DEFAULT 'daily',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create raw_serp_data table for storing SERP responses
CREATE TABLE public.raw_serp_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  search_engine TEXT DEFAULT 'google',
  location TEXT DEFAULT 'United States',
  language TEXT DEFAULT 'en',
  serp_response JSONB NOT NULL,
  organic_results JSONB DEFAULT '[]',
  people_also_ask JSONB DEFAULT '[]',
  related_searches JSONB DEFAULT '[]',
  featured_snippet JSONB DEFAULT '{}',
  total_results INTEGER,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours')
);

-- Create content_briefs table for AI-generated briefs
CREATE TABLE public.content_briefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  opportunity_id UUID REFERENCES public.content_opportunities(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL DEFAULT 'blog',
  title TEXT NOT NULL,
  suggested_headings JSONB DEFAULT '[]',
  introduction TEXT,
  outline JSONB DEFAULT '[]',
  faq_section JSONB DEFAULT '[]',
  internal_links JSONB DEFAULT '[]',
  external_links JSONB DEFAULT '[]',
  meta_title TEXT,
  meta_description TEXT,
  cta_suggestions JSONB DEFAULT '[]',
  target_word_count INTEGER DEFAULT 1500,
  ai_model_used TEXT DEFAULT 'gpt-4o-mini',
  generation_prompt TEXT,
  brief_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  quality_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create opportunity_assignments table for team management
CREATE TABLE public.opportunity_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID REFERENCES public.content_opportunities(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users NOT NULL,
  assigned_by UUID REFERENCES auth.users NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'assigned',
  notes TEXT,
  priority TEXT DEFAULT 'medium'
);

-- Create opportunity_metrics table for tracking performance
CREATE TABLE public.opportunity_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID REFERENCES public.content_opportunities(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.content_items(id),
  published_url TEXT,
  initial_rank INTEGER,
  current_rank INTEGER,
  click_through_rate NUMERIC,
  impressions INTEGER,
  clicks INTEGER,
  conversions INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for opportunity_seeds
ALTER TABLE public.opportunity_seeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own opportunity seeds" 
  ON public.opportunity_seeds 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own opportunity seeds" 
  ON public.opportunity_seeds 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own opportunity seeds" 
  ON public.opportunity_seeds 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own opportunity seeds" 
  ON public.opportunity_seeds 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for raw_serp_data (service role access for caching)
ALTER TABLE public.raw_serp_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage SERP data" 
  ON public.raw_serp_data 
  FOR ALL 
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Users can read SERP data" 
  ON public.raw_serp_data 
  FOR SELECT 
  USING (true);

-- Add RLS policies for content_briefs
ALTER TABLE public.content_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own content briefs" 
  ON public.content_briefs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content briefs" 
  ON public.content_briefs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content briefs" 
  ON public.content_briefs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content briefs" 
  ON public.content_briefs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for opportunity_assignments
ALTER TABLE public.opportunity_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assignments they're involved in" 
  ON public.opportunity_assignments 
  FOR SELECT 
  USING (auth.uid() = assigned_to OR auth.uid() = assigned_by);

CREATE POLICY "Users can create assignments" 
  ON public.opportunity_assignments 
  FOR INSERT 
  WITH CHECK (auth.uid() = assigned_by);

CREATE POLICY "Users can update assignments they're involved in" 
  ON public.opportunity_assignments 
  FOR UPDATE 
  USING (auth.uid() = assigned_to OR auth.uid() = assigned_by);

-- Add RLS policies for opportunity_metrics
ALTER TABLE public.opportunity_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view metrics for their opportunities" 
  ON public.opportunity_metrics 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.content_opportunities 
    WHERE id = opportunity_metrics.opportunity_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create metrics for their opportunities" 
  ON public.opportunity_metrics 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.content_opportunities 
    WHERE id = opportunity_metrics.opportunity_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update metrics for their opportunities" 
  ON public.opportunity_metrics 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.content_opportunities 
    WHERE id = opportunity_metrics.opportunity_id 
    AND user_id = auth.uid()
  ));

-- Add indexes for performance
CREATE INDEX idx_opportunity_seeds_user_id ON public.opportunity_seeds(user_id);
CREATE INDEX idx_opportunity_seeds_active ON public.opportunity_seeds(is_active);
CREATE INDEX idx_raw_serp_data_keyword ON public.raw_serp_data(keyword);
CREATE INDEX idx_raw_serp_data_expires ON public.raw_serp_data(expires_at);
CREATE INDEX idx_content_briefs_user_id ON public.content_briefs(user_id);
CREATE INDEX idx_content_briefs_opportunity_id ON public.content_briefs(opportunity_id);
CREATE INDEX idx_opportunity_assignments_assigned_to ON public.opportunity_assignments(assigned_to);
CREATE INDEX idx_opportunity_metrics_opportunity_id ON public.opportunity_metrics(opportunity_id);

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON public.opportunity_seeds 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON public.content_briefs 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Add function to clean expired SERP cache
CREATE OR REPLACE FUNCTION public.clean_expired_serp_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.raw_serp_data WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;