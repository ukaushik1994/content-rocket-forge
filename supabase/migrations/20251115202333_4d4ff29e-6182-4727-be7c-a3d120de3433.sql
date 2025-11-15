-- Add missing campaign context fields
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS goal VARCHAR(50),
ADD COLUMN IF NOT EXISTS timeline VARCHAR(50);

-- Ensure status is not nullable with default
ALTER TABLE campaigns 
ALTER COLUMN status SET DEFAULT 'draft',
ALTER COLUMN status SET NOT NULL;

-- Update existing campaigns with null status
UPDATE campaigns 
SET status = CASE
  WHEN selected_strategy IS NOT NULL THEN 'planned'
  ELSE 'draft'
END
WHERE status IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_status ON campaigns(user_id, status);