-- Create serp_cache table
CREATE TABLE IF NOT EXISTS public.serp_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  geo TEXT NOT NULL DEFAULT 'United States',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add expires_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'serp_cache' AND column_name = 'expires_at') THEN
    ALTER TABLE public.serp_cache ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours');
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_serp_cache_keyword_geo ON public.serp_cache(keyword, geo);
CREATE INDEX IF NOT EXISTS idx_serp_cache_expires_at ON public.serp_cache(expires_at);

-- Create serp_usage_logs table
CREATE TABLE IF NOT EXISTS public.serp_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  operation TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on serp_cache
ALTER TABLE public.serp_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read SERP cache data" ON public.serp_cache;
DROP POLICY IF EXISTS "Authenticated users can manage SERP cache" ON public.serp_cache;

-- Create new policies
CREATE POLICY "Anyone can read SERP cache data" 
ON public.serp_cache 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage SERP cache" 
ON public.serp_cache 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Enable RLS on serp_usage_logs
ALTER TABLE public.serp_usage_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own SERP usage logs" ON public.serp_usage_logs;
DROP POLICY IF EXISTS "Users can create their own SERP usage logs" ON public.serp_usage_logs;

-- Create new policies
CREATE POLICY "Users can view their own SERP usage logs" 
ON public.serp_usage_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SERP usage logs" 
ON public.serp_usage_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);