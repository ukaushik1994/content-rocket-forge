
-- Create content strategies table to store user strategy goals and data
CREATE TABLE public.content_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL DEFAULT 'Content Strategy',
  monthly_traffic_goal INTEGER,
  content_pieces_per_month INTEGER,
  timeline TEXT NOT NULL DEFAULT '3 months',
  main_keyword TEXT,
  target_audience TEXT,
  brand_voice TEXT,
  content_pillars JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content calendar table for editorial calendar items
CREATE TABLE public.content_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  strategy_id UUID REFERENCES public.content_strategies(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content_items(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'blog', -- blog, social, video, email, etc.
  status TEXT NOT NULL DEFAULT 'planning', -- planning, writing, review, scheduled, published
  scheduled_date DATE NOT NULL,
  assigned_to UUID REFERENCES auth.users,
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
  estimated_hours INTEGER DEFAULT 2,
  tags JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content pipeline table for pipeline stage management
CREATE TABLE public.content_pipeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  strategy_id UUID REFERENCES public.content_strategies(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content_items(id) ON DELETE SET NULL,
  calendar_item_id UUID REFERENCES public.content_calendar(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'idea', -- idea, research, writing, editing, review, ready, published
  content_type TEXT NOT NULL DEFAULT 'blog',
  target_keyword TEXT,
  word_count INTEGER,
  seo_score INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  due_date DATE,
  assigned_to UUID REFERENCES auth.users,
  priority TEXT NOT NULL DEFAULT 'medium',
  blockers JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create strategy insights table to store SERP analysis results
CREATE TABLE public.strategy_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  strategy_id UUID REFERENCES public.content_strategies(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  keyword_difficulty INTEGER,
  competition_score DECIMAL(3,2),
  opportunity_score INTEGER,
  serp_data JSONB DEFAULT '{}'::jsonb,
  content_gaps JSONB DEFAULT '[]'::jsonb,
  top_competitors JSONB DEFAULT '[]'::jsonb,
  suggested_content JSONB DEFAULT '[]'::jsonb,
  last_analyzed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_content_strategies_user_id ON public.content_strategies(user_id);
CREATE INDEX idx_content_strategies_active ON public.content_strategies(user_id, is_active);
CREATE INDEX idx_content_calendar_user_id ON public.content_calendar(user_id);
CREATE INDEX idx_content_calendar_strategy ON public.content_calendar(strategy_id);
CREATE INDEX idx_content_calendar_date ON public.content_calendar(scheduled_date);
CREATE INDEX idx_content_pipeline_user_id ON public.content_pipeline(user_id);
CREATE INDEX idx_content_pipeline_strategy ON public.content_pipeline(strategy_id);
CREATE INDEX idx_content_pipeline_stage ON public.content_pipeline(stage);
CREATE INDEX idx_strategy_insights_user_id ON public.strategy_insights(user_id);
CREATE INDEX idx_strategy_insights_strategy ON public.strategy_insights(strategy_id);
CREATE INDEX idx_strategy_insights_keyword ON public.strategy_insights(keyword);

-- Enable Row Level Security
ALTER TABLE public.content_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_strategies
CREATE POLICY "Users can view their own strategies" ON public.content_strategies
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own strategies" ON public.content_strategies
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own strategies" ON public.content_strategies
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own strategies" ON public.content_strategies
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for content_calendar
CREATE POLICY "Users can view their own calendar items" ON public.content_calendar
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own calendar items" ON public.content_calendar
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own calendar items" ON public.content_calendar
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own calendar items" ON public.content_calendar
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for content_pipeline
CREATE POLICY "Users can view their own pipeline items" ON public.content_pipeline
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own pipeline items" ON public.content_pipeline
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pipeline items" ON public.content_pipeline
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pipeline items" ON public.content_pipeline
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for strategy_insights
CREATE POLICY "Users can view their own insights" ON public.strategy_insights
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own insights" ON public.strategy_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own insights" ON public.strategy_insights
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own insights" ON public.strategy_insights
  FOR DELETE USING (auth.uid() = user_id);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_content_strategies
  BEFORE UPDATE ON public.content_strategies
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_content_calendar
  BEFORE UPDATE ON public.content_calendar
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_content_pipeline
  BEFORE UPDATE ON public.content_pipeline
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
