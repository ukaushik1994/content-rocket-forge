-- Add image_url and source_proposal_id to content_pipeline table
ALTER TABLE public.content_pipeline 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS source_proposal_id TEXT,
ADD COLUMN IF NOT EXISTS proposal_data JSONB DEFAULT '{}'::jsonb;