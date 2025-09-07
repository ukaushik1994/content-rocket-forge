-- First, safely clean up any existing mock/demo data from the content calendar
DELETE FROM content_calendar 
WHERE title LIKE '%Demo%' 
   OR title LIKE '%Sample%' 
   OR title LIKE '%Test%'
   OR title LIKE '%Example%'
   OR content_type = 'demo';

-- Clean up any notes that aren't valid JSON
UPDATE content_calendar 
SET notes = NULL 
WHERE notes IS NOT NULL 
  AND notes !~ '^[\s]*\{.*\}[\s]*$' 
  AND notes !~ '^[\s]*\[.*\][\s]*$';

-- Add index for better performance on proposal restoration queries  
CREATE INDEX IF NOT EXISTS idx_content_calendar_proposal_search 
ON content_calendar (title, content_type, status, scheduled_date);

-- Add a simple index for notes field (text-based instead of JSONB)
CREATE INDEX IF NOT EXISTS idx_content_calendar_notes 
ON content_calendar (notes) 
WHERE notes IS NOT NULL;