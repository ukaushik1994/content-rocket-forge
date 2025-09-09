-- Reset AI service providers status and clear errors
UPDATE public.ai_service_providers 
SET 
  status = 'active',
  error_message = NULL,
  last_verified = now(),
  updated_at = now()
WHERE provider IN ('openai', 'anthropic', 'gemini') AND status = 'error';