-- Phase 1: Fix existing calendar items by linking them to proposals based on title matching
-- This will match calendar items to proposals and update the proposal_id field

-- Step 1: Update calendar items with matching proposal IDs based on exact title match first
UPDATE content_calendar 
SET proposal_id = p.id,
    updated_at = now()
FROM ai_strategy_proposals p
WHERE content_calendar.proposal_id IS NULL
AND LOWER(content_calendar.title) = LOWER(p.title);

-- Step 2: Match by primary keyword for remaining unmatched items
UPDATE content_calendar 
SET proposal_id = p.id,
    updated_at = now()
FROM ai_strategy_proposals p
WHERE content_calendar.proposal_id IS NULL
AND LOWER(content_calendar.title) LIKE '%' || LOWER(p.primary_keyword) || '%'
AND LENGTH(p.primary_keyword) > 3;

-- Step 3: Update proposal status to 'scheduled' for linked proposals
UPDATE ai_strategy_proposals 
SET status = 'scheduled',
    scheduled_at = now(),
    updated_at = now()
WHERE id IN (
  SELECT DISTINCT proposal_id 
  FROM content_calendar 
  WHERE proposal_id IS NOT NULL
);

-- Step 4: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_calendar_proposal_id ON content_calendar(proposal_id);
CREATE INDEX IF NOT EXISTS idx_ai_strategy_proposals_status ON ai_strategy_proposals(status);
CREATE INDEX IF NOT EXISTS idx_ai_strategy_proposals_user_status ON ai_strategy_proposals(user_id, status);