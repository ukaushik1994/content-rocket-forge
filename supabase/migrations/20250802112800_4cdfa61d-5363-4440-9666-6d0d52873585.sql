-- Add content_type enum and update content_items table
CREATE TYPE public.content_type_enum AS ENUM ('article', 'blog', 'glossary', 'social_post', 'email', 'landing_page');

-- Add content_type column to content_items
ALTER TABLE public.content_items 
ADD COLUMN content_type public.content_type_enum DEFAULT 'article'::public.content_type_enum;

-- Add glossary_id column for linking content to glossaries
ALTER TABLE public.content_items 
ADD COLUMN glossary_id uuid REFERENCES public.glossaries(id) ON DELETE SET NULL;

-- Update existing content to have article type
UPDATE public.content_items SET content_type = 'article' WHERE content_type IS NULL;

-- Add index for better performance
CREATE INDEX idx_content_items_content_type ON public.content_items(content_type);
CREATE INDEX idx_content_items_glossary_id ON public.content_items(glossary_id);