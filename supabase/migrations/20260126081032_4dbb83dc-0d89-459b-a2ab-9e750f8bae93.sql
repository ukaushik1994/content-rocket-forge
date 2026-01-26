
-- Update existing campaigns to populate contentBriefs from contentMix.specificTopics
-- This fixes campaigns that were created before contentBriefs persistence was implemented

UPDATE campaigns c
SET selected_strategy = selected_strategy || jsonb_build_object(
  'contentBriefs',
  (
    SELECT jsonb_agg(brief_obj ORDER BY global_index)
    FROM (
      SELECT 
        (ROW_NUMBER() OVER (ORDER BY format_item_index, topic_index)) - 1 AS global_index,
        jsonb_build_object(
          'formatId', format_item->>'formatId',
          'pieceIndex', (ROW_NUMBER() OVER (ORDER BY format_item_index, topic_index)) - 1,
          'title', topic->>'title',
          'description', topic->>'description',
          'keywords', COALESCE(topic->'keywords', '["general"]'::jsonb),
          'metaTitle', topic->>'metaTitle',
          'metaDescription', topic->>'metaDescription',
          'targetWordCount', COALESCE((topic->>'targetWordCount')::int, 1000),
          'difficulty', COALESCE(topic->>'difficulty', 'medium'),
          'serpOpportunity', COALESCE((topic->>'serpOpportunity')::int, 50),
          'ctaText', '',
          'publishDate', '',
          'utmParams', '{}'::jsonb
        ) AS brief_obj
      FROM jsonb_array_elements(c.selected_strategy->'contentMix') WITH ORDINALITY AS f(format_item, format_item_index),
        jsonb_array_elements(format_item->'specificTopics') WITH ORDINALITY AS t(topic, topic_index)
    ) AS numbered_briefs
  )
)
WHERE selected_strategy IS NOT NULL
  AND (
    selected_strategy->'contentBriefs' IS NULL 
    OR jsonb_array_length(COALESCE(selected_strategy->'contentBriefs', '[]'::jsonb)) = 0
  )
  AND selected_strategy->'contentMix' IS NOT NULL
  AND jsonb_array_length(selected_strategy->'contentMix') > 0;

-- Create index for faster campaign content queries
CREATE INDEX IF NOT EXISTS idx_content_items_campaign_created 
ON content_items(campaign_id, created_at DESC) 
WHERE campaign_id IS NOT NULL;

-- Create index for queue processing performance
CREATE INDEX IF NOT EXISTS idx_content_generation_queue_processing
ON content_generation_queue(status, priority DESC, created_at)
WHERE status IN ('pending', 'processing');
