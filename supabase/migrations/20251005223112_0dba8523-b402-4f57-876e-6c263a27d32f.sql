-- Phase 1: Fix Database State - Activate Gemini and LM Studio providers

-- Update ai_service_providers table to set both providers to active
UPDATE ai_service_providers 
SET status = 'active',
    updated_at = now()
WHERE provider IN ('gemini', 'lmstudio') 
AND status = 'inactive';

-- Update api_keys table to set both providers as active
UPDATE api_keys 
SET is_active = true,
    updated_at = now()
WHERE service IN ('gemini', 'lmstudio')
AND is_active = false;