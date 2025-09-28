-- Create historical SERP tracking tables

-- Table to store daily SERP snapshots for keywords
CREATE TABLE public.serp_tracking_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword_id UUID,
    keyword TEXT NOT NULL,
    search_date DATE NOT NULL DEFAULT CURRENT_DATE,
    location TEXT DEFAULT 'United States',
    search_volume INTEGER,
    keyword_difficulty INTEGER,
    competition_score DECIMAL(3,2),
    cpc DECIMAL(10,2),
    total_results BIGINT,
    serp_features JSONB DEFAULT '{}',
    top_10_results JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(keyword, search_date, location)
);

-- Table to track individual URL position changes over time
CREATE TABLE public.keyword_position_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_id UUID REFERENCES public.serp_tracking_history(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    title TEXT,
    snippet TEXT,
    position INTEGER NOT NULL,
    previous_position INTEGER,
    position_change INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to store SERP monitoring alerts
CREATE TABLE public.serp_monitoring_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    keyword TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('position_change', 'new_competitor', 'serp_feature_change', 'volume_change')),
    threshold_value INTEGER,
    is_active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.serp_tracking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_position_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serp_monitoring_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for serp_tracking_history (public read, authenticated users can insert)
CREATE POLICY "Serp tracking history is viewable by everyone" 
ON public.serp_tracking_history 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert serp tracking history" 
ON public.serp_tracking_history 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS policies for keyword_position_history (inherit from tracking table)
CREATE POLICY "Position history is viewable by everyone" 
ON public.keyword_position_history 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert position history" 
ON public.keyword_position_history 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS policies for serp_monitoring_alerts (user-specific)
CREATE POLICY "Users can view their own SERP monitoring alerts" 
ON public.serp_monitoring_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SERP monitoring alerts" 
ON public.serp_monitoring_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SERP monitoring alerts" 
ON public.serp_monitoring_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SERP monitoring alerts" 
ON public.serp_monitoring_alerts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_serp_tracking_keyword_date ON public.serp_tracking_history(keyword, search_date);
CREATE INDEX idx_serp_tracking_location ON public.serp_tracking_history(location);
CREATE INDEX idx_position_history_tracking_id ON public.keyword_position_history(tracking_id);
CREATE INDEX idx_position_history_url ON public.keyword_position_history(url);
CREATE INDEX idx_monitoring_alerts_user_keyword ON public.serp_monitoring_alerts(user_id, keyword);

-- Create function to calculate position changes
CREATE OR REPLACE FUNCTION public.calculate_position_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate position change from previous entry for the same URL and keyword
  NEW.position_change := NEW.position - COALESCE(NEW.previous_position, NEW.position);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic position change calculation
CREATE TRIGGER calculate_position_change_trigger
BEFORE INSERT ON public.keyword_position_history
FOR EACH ROW
EXECUTE FUNCTION public.calculate_position_change();

-- Create function to update timestamps
CREATE TRIGGER update_serp_tracking_history_updated_at
BEFORE UPDATE ON public.serp_tracking_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_serp_monitoring_alerts_updated_at
BEFORE UPDATE ON public.serp_monitoring_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();