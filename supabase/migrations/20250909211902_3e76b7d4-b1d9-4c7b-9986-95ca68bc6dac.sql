-- Migrate data from user_llm_keys to ai_service_providers for consistency
-- and ensure all providers are properly set up

-- First, let's migrate existing OpenRouter key from user_llm_keys
INSERT INTO public.ai_service_providers (
  user_id,
  provider,
  api_key,
  preferred_model,
  priority,
  status,
  capabilities,
  available_models,
  category,
  description,
  icon_name,
  setup_url,
  is_required,
  created_at,
  updated_at
)
SELECT 
  user_id,
  'openrouter' as provider,
  api_key,
  COALESCE(default_model, 'meta-llama/llama-3.2-3b-instruct:free') as preferred_model,
  2 as priority,
  CASE WHEN is_active THEN 'active'::text ELSE 'inactive'::text END as status,
  '["chat", "completion", "multimodal"]'::jsonb as capabilities,
  '["gpt-5-2025-08-07", "gpt-5-mini-2025-08-07", "gpt-4.1-2025-04-14", "claude-opus-4-20250514", "claude-sonnet-4-20250514"]'::jsonb as available_models,
  'AI Services' as category,
  'Access multiple AI models through a single API gateway' as description,
  'brain' as icon_name,
  'https://openrouter.ai/keys' as setup_url,
  false as is_required,
  created_at,
  updated_at
FROM public.user_llm_keys 
WHERE provider = 'openrouter'
ON CONFLICT (user_id, provider) DO UPDATE SET
  api_key = EXCLUDED.api_key,
  preferred_model = EXCLUDED.preferred_model,
  status = EXCLUDED.status,
  updated_at = now();

-- Update the OpenAI provider to reset its error status for fresh testing
UPDATE public.ai_service_providers 
SET 
  status = 'inactive',
  error_message = NULL,
  last_verified = NULL
WHERE provider = 'openai';

-- Ensure we have proper metadata for all providers using proper jsonb format
UPDATE public.ai_service_providers 
SET 
  capabilities = CASE provider
    WHEN 'openai' THEN '["chat", "completion", "vision", "embedding"]'::jsonb
    WHEN 'anthropic' THEN '["chat", "completion", "vision", "analysis"]'::jsonb
    WHEN 'gemini' THEN '["chat", "completion", "vision", "multimodal"]'::jsonb
    WHEN 'openrouter' THEN '["chat", "completion", "multimodal"]'::jsonb
    WHEN 'mistral' THEN '["chat", "completion", "embedding"]'::jsonb
    WHEN 'lmstudio' THEN '["chat", "completion", "local"]'::jsonb
    ELSE capabilities
  END,
  available_models = CASE provider
    WHEN 'openai' THEN '["gpt-5-2025-08-07", "gpt-5-mini-2025-08-07", "gpt-5-nano-2025-08-07", "gpt-4.1-2025-04-14", "o3-2025-04-16", "o4-mini-2025-04-16"]'::jsonb
    WHEN 'anthropic' THEN '["claude-opus-4-20250514", "claude-sonnet-4-20250514", "claude-3-5-haiku-20241022"]'::jsonb
    WHEN 'gemini' THEN '["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro-vision"]'::jsonb
    WHEN 'openrouter' THEN '["gpt-5-2025-08-07", "gpt-5-mini-2025-08-07", "gpt-4.1-2025-04-14", "claude-opus-4-20250514", "claude-sonnet-4-20250514"]'::jsonb
    WHEN 'mistral' THEN '["mistral-large", "mistral-medium", "mistral-small"]'::jsonb
    WHEN 'lmstudio' THEN '["llama-3.2", "phi-3", "codellama"]'::jsonb
    ELSE available_models
  END,
  category = COALESCE(category, 'AI Services'),
  description = CASE provider
    WHEN 'openai' THEN 'Advanced AI models for content generation and analysis'
    WHEN 'anthropic' THEN 'Constitutional AI for safe and helpful content creation'
    WHEN 'gemini' THEN 'Google''s multimodal AI for diverse content tasks'
    WHEN 'openrouter' THEN 'Access multiple AI models through a single API gateway'
    WHEN 'mistral' THEN 'European AI provider with advanced language models'
    WHEN 'lmstudio' THEN 'Local AI models running on your machine'
    ELSE description
  END,
  icon_name = COALESCE(icon_name, 'brain'),
  setup_url = CASE provider
    WHEN 'openai' THEN 'https://platform.openai.com/api-keys'
    WHEN 'anthropic' THEN 'https://console.anthropic.com/account/keys'
    WHEN 'gemini' THEN 'https://aistudio.google.com/app/apikey'
    WHEN 'openrouter' THEN 'https://openrouter.ai/keys'
    WHEN 'mistral' THEN 'https://console.mistral.ai/api-keys/'
    WHEN 'lmstudio' THEN 'https://lmstudio.ai/'
    ELSE setup_url
  END,
  is_required = COALESCE(is_required, false),
  updated_at = now()
WHERE provider IN ('openai', 'anthropic', 'gemini', 'openrouter', 'mistral', 'lmstudio');