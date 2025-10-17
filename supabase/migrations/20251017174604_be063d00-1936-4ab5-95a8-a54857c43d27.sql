-- Add meta_title and meta_description columns to content_items
ALTER TABLE public.content_items 
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Migrate existing data
-- 1. Move current title to meta_title
UPDATE public.content_items 
SET meta_title = title
WHERE meta_title IS NULL;

-- 2. Extract first line from content as the blog title (remove ** markdown)
UPDATE public.content_items
SET title = TRIM(BOTH '**' FROM SPLIT_PART(content, E'\n', 1))
WHERE content IS NOT NULL 
  AND content != ''
  AND SPLIT_PART(content, E'\n', 1) LIKE '**%**';

-- 3. Move metaDescription from metadata to meta_description column
UPDATE public.content_items
SET meta_description = metadata->>'metaDescription'
WHERE metadata ? 'metaDescription' 
  AND meta_description IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.content_items.meta_title IS 'SEO meta title for search engines';
COMMENT ON COLUMN public.content_items.meta_description IS 'SEO meta description for search engines';