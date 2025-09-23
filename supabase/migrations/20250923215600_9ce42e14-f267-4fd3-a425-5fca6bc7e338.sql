-- Create SERP monitoring tables for real-time tracking
CREATE TABLE public.serp_monitoring_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  location TEXT DEFAULT 'us',
  language TEXT DEFAULT 'en',
  check_frequency INTEGER NOT NULL DEFAULT 3600, -- seconds
  is_active BOOLEAN NOT NULL DEFAULT true,
  alert_thresholds JSONB DEFAULT '{"position_change": 3, "new_competitors": true, "featured_snippet_loss": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.serp_monitoring_configs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own monitoring configs" 
ON public.serp_monitoring_configs 
FOR ALL 
USING (auth.uid() = user_id);

-- Create SERP monitoring history table
CREATE TABLE public.serp_monitoring_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID NOT NULL REFERENCES public.serp_monitoring_configs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  serp_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  position_changes JSONB DEFAULT '[]'::jsonb,
  new_competitors JSONB DEFAULT '[]'::jsonb,
  lost_competitors JSONB DEFAULT '[]'::jsonb,
  featured_snippet_changes JSONB DEFAULT '{}'::jsonb,
  check_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.serp_monitoring_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own monitoring history" 
ON public.serp_monitoring_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monitoring history" 
ON public.serp_monitoring_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create SERP alerts table
CREATE TABLE public.serp_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  config_id UUID NOT NULL REFERENCES public.serp_monitoring_configs(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'position_change', 'new_competitor', 'featured_snippet_loss', etc.
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.serp_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own SERP alerts" 
ON public.serp_alerts 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_serp_monitoring_configs_user_id ON public.serp_monitoring_configs(user_id);
CREATE INDEX idx_serp_monitoring_configs_active ON public.serp_monitoring_configs(is_active) WHERE is_active = true;
CREATE INDEX idx_serp_monitoring_history_config_id ON public.serp_monitoring_history(config_id);
CREATE INDEX idx_serp_monitoring_history_timestamp ON public.serp_monitoring_history(check_timestamp);
CREATE INDEX idx_serp_alerts_user_unread ON public.serp_alerts(user_id, is_read) WHERE is_read = false;

-- Create triggers for updated_at
CREATE TRIGGER update_serp_monitoring_configs_updated_at
  BEFORE UPDATE ON public.serp_monitoring_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_serp_alerts_updated_at
  BEFORE UPDATE ON public.serp_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to cleanup old monitoring history
CREATE OR REPLACE FUNCTION public.cleanup_old_serp_monitoring()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Keep only last 30 days of monitoring history
  DELETE FROM public.serp_monitoring_history 
  WHERE created_at < now() - INTERVAL '30 days';
  
  -- Mark expired alerts as read
  UPDATE public.serp_alerts 
  SET is_read = true 
  WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$;