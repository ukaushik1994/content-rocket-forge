-- Add provider metadata columns to ai_service_providers table
ALTER TABLE public.ai_service_providers 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS setup_url text,
ADD COLUMN IF NOT EXISTS icon_name text DEFAULT 'zap',
ADD COLUMN IF NOT EXISTS category text DEFAULT 'AI Services',
ADD COLUMN IF NOT EXISTS capabilities jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS available_models jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_required boolean DEFAULT false;