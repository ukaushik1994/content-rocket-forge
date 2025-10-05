-- Fix/Add Gemini provider record
INSERT INTO ai_service_providers (user_id, provider, status, priority, preferred_model, api_key, capabilities, available_models)
SELECT 
  ak.user_id,
  'gemini' as provider,
  'active' as status,
  1 as priority,
  'gemini-2.0-flash-exp' as preferred_model,
  ak.encrypted_key as api_key,
  '["chat", "completion"]'::jsonb as capabilities,
  '["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash"]'::jsonb as available_models
FROM api_keys ak
WHERE ak.service = 'gemini' AND ak.is_active = true
ON CONFLICT (user_id, provider) 
DO UPDATE SET
  status = 'active',
  preferred_model = 'gemini-2.0-flash-exp',
  priority = 1,
  error_message = NULL,
  updated_at = NOW();

-- Fix OpenRouter (set to inactive)
UPDATE ai_service_providers 
SET 
  status = 'inactive',
  preferred_model = 'openai/gpt-4o-mini',
  error_message = NULL,
  updated_at = NOW()
WHERE provider = 'openrouter';

-- Fix OpenAI (ensure proper model is set)
UPDATE ai_service_providers 
SET 
  preferred_model = 'gpt-4o-mini',
  priority = 2,
  error_message = NULL,
  updated_at = NOW()
WHERE provider = 'openai';