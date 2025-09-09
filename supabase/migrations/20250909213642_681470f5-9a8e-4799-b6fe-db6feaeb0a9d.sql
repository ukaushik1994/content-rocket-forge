-- Phase 2: Database consolidation
-- Sync OpenRouter key from user_llm_keys to ai_service_providers
INSERT INTO public.ai_service_providers (
  user_id,
  provider,
  api_key,
  status,
  priority,
  capabilities,
  available_models,
  description,
  icon_name,
  category,
  setup_url,
  is_required
)
SELECT 
  user_id,
  'openrouter' as provider,
  api_key,
  'active' as status,
  0 as priority,
  '["chat", "completion", "multimodal"]'::jsonb as capabilities,
  '["gpt-5-2025-08-07", "gpt-5-mini-2025-08-07", "gpt-4.1-2025-04-14", "claude-opus-4-20250514", "claude-sonnet-4-20250514"]'::jsonb as available_models,
  'Access multiple AI models through a single API gateway' as description,
  'brain' as icon_name,
  'AI Services' as category,
  'https://openrouter.ai/keys' as setup_url,
  false as is_required
FROM user_llm_keys 
WHERE provider = 'openrouter' AND is_active = true
ON CONFLICT (user_id, provider) DO UPDATE SET
  api_key = EXCLUDED.api_key,
  status = 'active',
  updated_at = now();

-- Activate OpenAI provider (user has valid key but it's inactive)
UPDATE public.ai_service_providers 
SET 
  status = 'active',
  error_message = NULL,
  last_verified = now(),
  updated_at = now()
WHERE provider = 'openai' AND status = 'inactive';