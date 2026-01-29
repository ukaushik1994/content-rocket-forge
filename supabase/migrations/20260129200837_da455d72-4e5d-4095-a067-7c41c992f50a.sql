-- Add missing columns for AI optimization suggestions
ALTER TABLE content_optimization_history 
ADD COLUMN IF NOT EXISTS suggestion_type TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS suggested_content TEXT,
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_content_optimization_status 
ON content_optimization_history(content_id, status);

-- Add comment for clarity
COMMENT ON COLUMN content_optimization_history.suggestion_type IS 'Type of suggestion: headline, cta, seo, meta_description, content_structure, content_depth';
COMMENT ON COLUMN content_optimization_history.reason IS 'Plain-language explanation of why this change is suggested';
COMMENT ON COLUMN content_optimization_history.suggested_content IS 'The AI-suggested replacement content';
COMMENT ON COLUMN content_optimization_history.metadata IS 'Additional data like priority, performance metrics snapshot';