-- Update the content to associate it with SQL Connect solution
UPDATE content_items 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'),
  '{selectedSolution}',
  '"9d426f57-10cb-403d-ac50-7abee4de6ef5"'
)
WHERE id = '7e026b18-e2c4-4273-a3b7-02e05ccb4eeb';