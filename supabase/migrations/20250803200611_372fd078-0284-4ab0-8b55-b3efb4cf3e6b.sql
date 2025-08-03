
-- Create content_opportunities table to store detected opportunities
CREATE TABLE public.content_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  strategy_id UUID REFERENCES public.content_strategies(id),
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  keyword_difficulty INTEGER,
  competition_score NUMERIC,
  opportunity_score INTEGER,
  relevance_score NUMERIC DEFAULT 0,
  content_format TEXT DEFAULT 'blog',
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT DEFAULT 'serp_analysis',
  serp_data JSONB DEFAULT '{}',
  content_gaps JSONB DEFAULT '[]',
  suggested_title TEXT,
  suggested_outline JSONB DEFAULT '[]',
  internal_link_opportunities JSONB DEFAULT '[]',
  is_aio_friendly BOOLEAN DEFAULT false,
  trend_direction TEXT DEFAULT 'stable',
  priority TEXT NOT NULL DEFAULT 'medium',
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID,
  notes TEXT
);

-- Create opportunity_notifications table to track notification states
CREATE TABLE public.opportunity_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  opportunity_id UUID REFERENCES public.content_opportunities(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'in_app',
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create opportunity_briefs table to store auto-generated content briefs
CREATE TABLE public.opportunity_briefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  opportunity_id UUID REFERENCES public.content_opportunities(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT DEFAULT 'blog',
  introduction TEXT,
  outline JSONB DEFAULT '[]',
  faq_section JSONB DEFAULT '[]',
  internal_links JSONB DEFAULT '[]',
  meta_title TEXT,
  meta_description TEXT,
  target_word_count INTEGER,
  content_brief TEXT,
  format TEXT NOT NULL DEFAULT 'markdown',
  ai_model_used TEXT,
  generation_prompt TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_opportunity_settings table for user preferences
CREATE TABLE public.user_opportunity_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  scan_frequency TEXT NOT NULL DEFAULT 'daily',
  min_search_volume INTEGER DEFAULT 100,
  max_keyword_difficulty INTEGER DEFAULT 50,
  notification_channels JSONB DEFAULT '["in_app"]',
  excluded_keywords JSONB DEFAULT '[]',
  preferred_content_formats JSONB DEFAULT '["blog", "guide", "faq"]',
  auto_generate_briefs BOOLEAN DEFAULT true,
  aio_friendly_only BOOLEAN DEFAULT false,
  trend_threshold NUMERIC DEFAULT 0.2,
  relevance_threshold NUMERIC DEFAULT 0.6,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for content_opportunities
ALTER TABLE public.content_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own opportunities" 
  ON public.content_opportunities 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own opportunities" 
  ON public.content_opportunities 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own opportunities" 
  ON public.content_opportunities 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own opportunities" 
  ON public.content_opportunities 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for opportunity_notifications
ALTER TABLE public.opportunity_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
  ON public.opportunity_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications" 
  ON public.opportunity_notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.opportunity_notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
  ON public.opportunity_notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for opportunity_briefs
ALTER TABLE public.opportunity_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own briefs" 
  ON public.opportunity_briefs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own briefs" 
  ON public.opportunity_briefs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own briefs" 
  ON public.opportunity_briefs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own briefs" 
  ON public.opportunity_briefs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for user_opportunity_settings
ALTER TABLE public.user_opportunity_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" 
  ON public.user_opportunity_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" 
  ON public.user_opportunity_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON public.user_opportunity_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" 
  ON public.user_opportunity_settings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_content_opportunities_user_id ON public.content_opportunities(user_id);
CREATE INDEX idx_content_opportunities_status ON public.content_opportunities(status);
CREATE INDEX idx_content_opportunities_keyword ON public.content_opportunities(keyword);
CREATE INDEX idx_content_opportunities_detected_at ON public.content_opportunities(detected_at DESC);
CREATE INDEX idx_opportunity_notifications_user_id ON public.opportunity_notifications(user_id);
CREATE INDEX idx_opportunity_notifications_status ON public.opportunity_notifications(status);
CREATE INDEX idx_opportunity_briefs_user_id ON public.opportunity_briefs(user_id);

-- Add updated_at trigger for content_opportunities
CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON public.content_opportunities 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Add updated_at trigger for opportunity_briefs  
CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON public.opportunity_briefs 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Add updated_at trigger for user_opportunity_settings
CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON public.user_opportunity_settings 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
