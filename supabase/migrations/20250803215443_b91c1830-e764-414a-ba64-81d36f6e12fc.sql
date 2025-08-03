-- Create content activity log table to track all user content actions
CREATE TABLE public.content_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID,
  content_type TEXT NOT NULL CHECK (content_type IN ('blog', 'glossary', 'article', 'strategy', 'brief')),
  action TEXT NOT NULL CHECK (action IN ('created', 'published', 'updated', 'repurposed', 'deleted')),
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create performance metrics table for content performance tracking
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('blog', 'glossary', 'article')),
  traffic_last_7d INTEGER DEFAULT 0,
  traffic_last_30d INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2),
  avg_time_on_page INTEGER,
  cluster_id UUID,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content goals table for monthly targets
CREATE TABLE public.content_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month DATE NOT NULL, -- Month-year anchor (e.g., 2025-08-01)
  goal_glossary INTEGER DEFAULT 0,
  goal_blog INTEGER DEFAULT 0,
  goal_article INTEGER DEFAULT 0,
  goal_strategy INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month)
);

-- Create dashboard alerts table for user notifications
CREATE TABLE public.dashboard_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('info', 'warning', 'success', 'error')) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  action_label TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for content_activity_log
CREATE POLICY "Users can view their own activity log" 
ON public.content_activity_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity log entries" 
ON public.content_activity_log 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for performance_metrics
CREATE POLICY "Users can view performance metrics for their content" 
ON public.performance_metrics 
FOR SELECT 
USING (content_id IN (
  SELECT id FROM content_items WHERE user_id = auth.uid()
  UNION
  SELECT id FROM glossary_terms WHERE user_id = auth.uid()
  UNION
  SELECT id FROM content_briefs WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create performance metrics for their content" 
ON public.performance_metrics 
FOR INSERT 
WITH CHECK (content_id IN (
  SELECT id FROM content_items WHERE user_id = auth.uid()
  UNION
  SELECT id FROM glossary_terms WHERE user_id = auth.uid()
  UNION
  SELECT id FROM content_briefs WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update performance metrics for their content" 
ON public.performance_metrics 
FOR UPDATE 
USING (content_id IN (
  SELECT id FROM content_items WHERE user_id = auth.uid()
  UNION
  SELECT id FROM glossary_terms WHERE user_id = auth.uid()
  UNION
  SELECT id FROM content_briefs WHERE user_id = auth.uid()
));

-- Create RLS policies for content_goals
CREATE POLICY "Users can view their own content goals" 
ON public.content_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content goals" 
ON public.content_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content goals" 
ON public.content_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for dashboard_alerts
CREATE POLICY "Users can view their own dashboard alerts" 
ON public.dashboard_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dashboard alerts" 
ON public.dashboard_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard alerts" 
ON public.dashboard_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard alerts" 
ON public.dashboard_alerts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updating timestamps
CREATE TRIGGER update_performance_metrics_updated_at
  BEFORE UPDATE ON public.performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER update_content_goals_updated_at
  BEFORE UPDATE ON public.content_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_content_activity_log_user_id ON public.content_activity_log(user_id);
CREATE INDEX idx_content_activity_log_timestamp ON public.content_activity_log(timestamp DESC);
CREATE INDEX idx_content_activity_log_content_type ON public.content_activity_log(content_type);

CREATE INDEX idx_performance_metrics_content_id ON public.performance_metrics(content_id);
CREATE INDEX idx_performance_metrics_updated_at ON public.performance_metrics(updated_at DESC);

CREATE INDEX idx_content_goals_user_month ON public.content_goals(user_id, month);

CREATE INDEX idx_dashboard_alerts_user_id ON public.dashboard_alerts(user_id);
CREATE INDEX idx_dashboard_alerts_read ON public.dashboard_alerts(is_read);
CREATE INDEX idx_dashboard_alerts_created_at ON public.dashboard_alerts(created_at DESC);