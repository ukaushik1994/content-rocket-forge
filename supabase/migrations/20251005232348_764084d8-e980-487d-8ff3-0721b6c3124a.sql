-- PHASE 4: Activate all providers with valid API keys that are currently inactive or in error state
UPDATE ai_service_providers
SET 
  status = 'active',
  error_message = NULL,
  updated_at = NOW()
WHERE 
  api_key IS NOT NULL 
  AND api_key != '' 
  AND status IN ('inactive', 'error');