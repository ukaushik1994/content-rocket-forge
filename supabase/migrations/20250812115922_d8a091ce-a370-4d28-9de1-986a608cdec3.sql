
-- Expand allowed providers in ai_service_providers

ALTER TABLE public.ai_service_providers
  DROP CONSTRAINT IF EXISTS ai_service_providers_provider_check;

ALTER TABLE public.ai_service_providers
  ADD CONSTRAINT ai_service_providers_provider_check
  CHECK (
    provider = ANY (
      ARRAY[
        'openai'::text,
        'openrouter'::text,
        'anthropic'::text,
        'gemini'::text,
        'mistral'::text,
        'lmstudio'::text,
        'serp'::text,
        'serpstack'::text
      ]
    )
  );
