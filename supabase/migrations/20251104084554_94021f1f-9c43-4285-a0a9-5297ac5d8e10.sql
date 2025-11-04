-- Add metadata column to competitor_solutions table
ALTER TABLE competitor_solutions 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;