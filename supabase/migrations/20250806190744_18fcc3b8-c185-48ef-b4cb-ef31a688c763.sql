-- Create serp_usage_logs table for tracking SERP API usage
CREATE TABLE IF NOT EXISTS public.serp_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  operation TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.serp_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for serp_usage_logs
CREATE POLICY "Users can insert their own SERP usage logs" 
ON public.serp_usage_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own SERP usage logs" 
ON public.serp_usage_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_serp_usage_logs_user_created ON public.serp_usage_logs(user_id, created_at DESC);
CREATE INDEX idx_serp_usage_logs_provider ON public.serp_usage_logs(provider, created_at DESC);