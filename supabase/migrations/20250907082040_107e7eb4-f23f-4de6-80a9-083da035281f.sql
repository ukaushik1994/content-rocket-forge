-- Clean up any existing mock/demo data from the content calendar
DELETE FROM content_calendar 
WHERE title LIKE '%Demo%' 
   OR title LIKE '%Sample%' 
   OR title LIKE '%Test%'
   OR title LIKE '%Example%'
   OR content_type = 'demo'
   OR notes LIKE '%mock%'
   OR notes LIKE '%demo%';

-- Add index for better performance on proposal restoration queries
CREATE INDEX IF NOT EXISTS idx_content_calendar_proposal_data 
ON content_calendar 
USING gin((notes::jsonb)) 
WHERE notes IS NOT NULL;