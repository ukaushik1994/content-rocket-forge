-- Phase 1: Fix existing calendar items by linking them to proposals based on title matching
-- This will match calendar items to proposals and update the proposal_id field

-- Step 1: Update calendar items with matching proposal IDs based on title similarity
WITH matched_proposals AS (
  SELECT DISTINCT ON (cc.id) 
    cc.id as calendar_id,
    p.id as proposal_id,
    cc.title as calendar_title,
    p.title as proposal_title
  FROM content_calendar cc
  LEFT JOIN ai_strategy_proposals p ON (
    LOWER(cc.title) = LOWER(p.title) OR 
    LOWER(cc.title) LIKE '%' || LOWER(p.primary_keyword) || '%' OR
    LOWER(p.title) LIKE '%' || LOWER(COALESCE(NULLIF(regexp_replace(cc.title, '[^a-zA-Z0-9\s]', '', 'g'), ''), cc.title)) || '%'
  )
  WHERE cc.proposal_id IS NULL
  AND p.id IS NOT NULL
  ORDER BY cc.id, similarity(LOWER(cc.title), LOWER(p.title)) DESC
)
UPDATE content_calendar 
SET proposal_id = matched_proposals.proposal_id,
    updated_at = now()
FROM matched_proposals 
WHERE content_calendar.id = matched_proposals.calendar_id;

-- Step 2: Update proposal status to 'scheduled' for linked proposals
UPDATE ai_strategy_proposals 
SET status = 'scheduled',
    scheduled_at = now(),
    updated_at = now()
WHERE id IN (
  SELECT DISTINCT proposal_id 
  FROM content_calendar 
  WHERE proposal_id IS NOT NULL
);

-- Step 3: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_calendar_proposal_id ON content_calendar(proposal_id);
CREATE INDEX IF NOT EXISTS idx_ai_strategy_proposals_status ON ai_strategy_proposals(status);
CREATE INDEX IF NOT EXISTS idx_ai_strategy_proposals_user_status ON ai_strategy_proposals(user_id, status);