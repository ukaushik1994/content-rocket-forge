-- Create page_performance_metrics table for PageSpeed Insights data
CREATE TABLE IF NOT EXISTS public.page_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE,
  published_url TEXT NOT NULL,
  performance_score INTEGER,
  accessibility_score INTEGER,
  best_practices_score INTEGER,
  seo_score INTEGER,
  core_web_vitals JSONB,
  opportunities JSONB,
  diagnostics JSONB,
  strategy TEXT DEFAULT 'mobile',
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_page_performance_content_id ON public.page_performance_metrics(content_id);
CREATE INDEX IF NOT EXISTS idx_page_performance_measured_at ON public.page_performance_metrics(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_performance_url ON public.page_performance_metrics(published_url);

-- Enable RLS
ALTER TABLE public.page_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only see metrics for their own content
CREATE POLICY "Users can view performance metrics for their content" 
ON public.page_performance_metrics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.content_items ci 
    WHERE ci.id = page_performance_metrics.content_id 
    AND ci.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert performance metrics" 
ON public.page_performance_metrics 
FOR INSERT 
WITH CHECK (true);

-- Create content_optimization_history table for AI optimization tracking
CREATE TABLE IF NOT EXISTS public.content_optimization_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE,
  original_content TEXT,
  optimized_content TEXT,
  changes JSONB,
  performance_data JSONB,
  predicted_impact JSONB,
  status TEXT DEFAULT 'pending_review',
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for optimization history
CREATE INDEX IF NOT EXISTS idx_optimization_history_content_id ON public.content_optimization_history(content_id);
CREATE INDEX IF NOT EXISTS idx_optimization_history_status ON public.content_optimization_history(status);

-- Enable RLS
ALTER TABLE public.content_optimization_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for optimization history
CREATE POLICY "Users can view optimization history for their content" 
ON public.content_optimization_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.content_items ci 
    WHERE ci.id = content_optimization_history.content_id 
    AND ci.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update optimization history for their content" 
ON public.content_optimization_history 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.content_items ci 
    WHERE ci.id = content_optimization_history.content_id 
    AND ci.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert optimization history" 
ON public.content_optimization_history 
FOR INSERT 
WITH CHECK (true);

-- Create heatmap_data table for Clarity/Hotjar integration
CREATE TABLE IF NOT EXISTS public.heatmap_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE,
  published_url TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'clarity',
  scroll_depth DECIMAL,
  avg_time_on_page INTEGER,
  dead_clicks JSONB,
  rage_clicks JSONB,
  top_interactions JSONB,
  insights JSONB,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for heatmap data
CREATE INDEX IF NOT EXISTS idx_heatmap_content_id ON public.heatmap_data(content_id);
CREATE INDEX IF NOT EXISTS idx_heatmap_fetched_at ON public.heatmap_data(fetched_at DESC);

-- Enable RLS
ALTER TABLE public.heatmap_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for heatmap data
CREATE POLICY "Users can view heatmap data for their content" 
ON public.heatmap_data 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.content_items ci 
    WHERE ci.id = heatmap_data.content_id 
    AND ci.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert heatmap data" 
ON public.heatmap_data 
FOR INSERT 
WITH CHECK (true);