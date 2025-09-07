-- Enhanced notifications schema with new fields for comprehensive system
ALTER TABLE public.dashboard_alerts 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS notification_type TEXT DEFAULT 'info' CHECK (notification_type IN ('success', 'info', 'warning', 'error', 'achievement')),
ADD COLUMN IF NOT EXISTS grouped_id TEXT,
ADD COLUMN IF NOT EXISTS action_buttons JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS preview_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS interaction_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMP WITH TIME ZONE;

-- Create notification settings table for user preferences
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  frequency TEXT DEFAULT 'instant' CHECK (frequency IN ('instant', 'hourly', 'daily', 'weekly')),
  channels JSONB DEFAULT '["in_app"]'::jsonb,
  priority_threshold TEXT DEFAULT 'low' CHECK (priority_threshold IN ('low', 'medium', 'high', 'urgent')),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  auto_dismiss_after_days INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, category)
);

-- Enable RLS on notification_settings
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for notification_settings
CREATE POLICY "Users can view their own notification settings" 
ON public.notification_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notification settings" 
ON public.notification_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" 
ON public.notification_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification settings" 
ON public.notification_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create notification categories table
CREATE TABLE IF NOT EXISTS public.notification_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  default_enabled BOOLEAN DEFAULT true,
  default_frequency TEXT DEFAULT 'instant',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default notification categories
INSERT INTO public.notification_categories (id, name, description, icon, default_enabled, default_frequency) VALUES
('content_workflow', 'Content Workflow', 'Notifications about content creation, approval, and publishing', 'FileText', true, 'instant'),
('research_analysis', 'Research & Analysis', 'Notifications about keyword research, topic analysis, and insights', 'Search', true, 'instant'),
('ai_automation', 'AI & Automation', 'Notifications about AI processing, content generation, and smart actions', 'Zap', true, 'instant'),
('system_performance', 'System & Performance', 'Notifications about system updates, exports, and performance', 'Monitor', true, 'daily'),
('collaboration', 'Collaboration', 'Notifications about team activities, comments, and mentions', 'Users', true, 'instant')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_priority ON public.dashboard_alerts(priority);
CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_notification_type ON public.dashboard_alerts(notification_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_grouped_id ON public.dashboard_alerts(grouped_id) WHERE grouped_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_expires_at ON public.dashboard_alerts(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_category ON public.notification_settings(user_id, category);

-- Create trigger for notification_settings updated_at
CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.dashboard_alerts 
  WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$;

-- Function to group related notifications
CREATE OR REPLACE FUNCTION public.group_notifications(
  p_user_id UUID,
  p_module TEXT,
  p_severity TEXT,
  p_timeframe INTERVAL DEFAULT '1 hour'::interval
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  group_id TEXT;
BEGIN
  -- Generate a group ID based on user, module, severity, and time window
  group_id := concat(
    p_user_id::text, '_',
    p_module, '_',
    p_severity, '_',
    extract(epoch from date_trunc('hour', now()))::text
  );
  
  RETURN group_id;
END;
$$;