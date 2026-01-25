-- Add generated_videos column for storing video assets
ALTER TABLE public.content_items 
ADD COLUMN IF NOT EXISTS generated_videos JSONB DEFAULT '[]'::jsonb;

-- Add GIN index for efficient querying of video metadata
CREATE INDEX IF NOT EXISTS idx_content_items_generated_videos 
ON public.content_items USING gin(generated_videos);

-- Add comment for documentation
COMMENT ON COLUMN public.content_items.generated_videos IS 'Array of generated video assets with URLs, prompts, provider info, and metadata';