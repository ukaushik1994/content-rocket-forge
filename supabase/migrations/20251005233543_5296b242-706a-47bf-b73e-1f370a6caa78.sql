-- Clean up ai_service_providers to ensure only one provider is active at a time
-- This supports the "Single Active Provider Mode" implementation

-- First, deactivate all providers
UPDATE ai_service_providers SET status = 'inactive';

-- Then activate only the first configured provider (prioritizing OpenAI if it exists and is configured)
UPDATE ai_service_providers 
SET status = 'active'
WHERE id = (
  SELECT id 
  FROM ai_service_providers 
  WHERE api_key IS NOT NULL AND api_key != ''
  ORDER BY 
    CASE WHEN provider = 'openai' THEN 0 
         WHEN provider = 'gemini' THEN 1
         WHEN provider = 'anthropic' THEN 2
         ELSE 3 
    END
  LIMIT 1
);

-- Add index for faster active provider lookup
CREATE INDEX IF NOT EXISTS idx_ai_service_providers_status_user 
ON ai_service_providers(user_id, status) 
WHERE status = 'active';