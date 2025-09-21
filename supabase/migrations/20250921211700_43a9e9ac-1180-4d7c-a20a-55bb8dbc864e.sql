-- Update the existing content item to link it to the AI strategy proposal
UPDATE public.content_items 
SET 
  metadata = jsonb_set(
    metadata,
    '{proposal_id}',
    '"ac0f0728-8c30-460a-9900-ccc7fcff1861"'::jsonb
  ),
  updated_at = now()
WHERE id = 'c8c7f609-956d-43f6-9c4b-57ce30d28f3c';