-- Migrate existing AI strategy proposals from ai_strategies.proposals to ai_strategy_proposals table
-- This will populate the historical proposals section with existing data

INSERT INTO ai_strategy_proposals (
  user_id,
  title,
  description,
  primary_keyword,
  related_keywords,
  content_suggestions,
  estimated_impressions,
  priority_tag,
  content_type,
  serp_data,
  proposal_data,
  strategy_session_id,
  created_at,
  updated_at
)
SELECT 
  s.user_id,
  proposal->>'title' as title,
  proposal->>'description' as description,
  COALESCE(
    proposal->>'primary_keyword',
    proposal->'keywords'->0->>'keyword'
  ) as primary_keyword,
  CASE 
    WHEN proposal->'keywords' IS NOT NULL 
    THEN ARRAY(SELECT jsonb_array_elements_text(proposal->'keywords' #> '{}'))
    ELSE ARRAY[]::text[]
  END as related_keywords,
  ARRAY[]::text[] as content_suggestions,
  COALESCE((proposal->>'estimated_impressions')::integer, 0) as estimated_impressions,
  COALESCE(proposal->>'priority', 'evergreen') as priority_tag,
  COALESCE(proposal->>'content_type', 'blog') as content_type,
  COALESCE(proposal->'serp_data', '{}'::jsonb) as serp_data,
  proposal as proposal_data,
  s.id as strategy_session_id,
  s.created_at,
  s.updated_at
FROM ai_strategies s,
LATERAL jsonb_array_elements(s.proposals) as proposal
WHERE s.proposals IS NOT NULL AND jsonb_array_length(s.proposals) > 0;