-- Reset all provider error states and clear error messages
UPDATE ai_service_providers 
SET 
  status = 'active',
  error_message = NULL,
  last_verified = NULL,
  updated_at = now()
WHERE status = 'error' OR error_message IS NOT NULL;

-- Update any providers that haven't been verified recently
UPDATE ai_service_providers 
SET last_verified = NULL
WHERE last_verified < (now() - interval '1 hour');