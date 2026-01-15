-- Add generated_images column to content_items for storing AI-generated images
ALTER TABLE public.content_items 
ADD COLUMN IF NOT EXISTS generated_images JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.content_items.generated_images IS 'Stores AI-generated images attached to this content item as JSON array';

-- Create index for better query performance on generated_images
CREATE INDEX IF NOT EXISTS idx_content_items_generated_images 
ON public.content_items USING GIN (generated_images);