-- Migration to transfer existing AI API keys to ai_service_providers table
-- This will move AI provider API keys from the legacy api_keys table to the new centralized system

-- Create a function to migrate existing AI API keys
CREATE OR REPLACE FUNCTION public.migrate_ai_api_keys()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  key_record RECORD;
  provider_priority INTEGER;
BEGIN
  -- Migrate existing AI API keys to the new ai_service_providers table
  FOR key_record IN 
    SELECT service, encrypted_key, user_id, created_at, updated_at
    FROM public.api_keys 
    WHERE service IN ('openai', 'anthropic', 'gemini', 'mistral', 'openrouter', 'lmstudio')
    AND is_active = true
  LOOP
    -- Set priority based on provider (OpenRouter = 1, Anthropic = 2, etc.)
    provider_priority := CASE 
      WHEN key_record.service = 'openrouter' THEN 1
      WHEN key_record.service = 'anthropic' THEN 2
      WHEN key_record.service = 'gemini' THEN 3
      WHEN key_record.service = 'mistral' THEN 4
      WHEN key_record.service = 'openai' THEN 5
      WHEN key_record.service = 'lmstudio' THEN 6
      ELSE 10
    END;
    
    -- Insert into ai_service_providers if not already exists
    INSERT INTO public.ai_service_providers (
      user_id,
      provider,
      api_key,
      status,
      priority,
      created_at,
      updated_at
    )
    VALUES (
      key_record.user_id,
      key_record.service::ai_provider_type,
      key_record.encrypted_key,
      'active',
      provider_priority,
      key_record.created_at,
      key_record.updated_at
    )
    ON CONFLICT (user_id, provider) DO UPDATE SET
      api_key = EXCLUDED.api_key,
      status = 'active',
      priority = EXCLUDED.priority,
      updated_at = now();
  END LOOP;
  
  -- Log the migration
  RAISE NOTICE 'AI API keys migration completed';
END;
$function$;

-- Execute the migration
SELECT public.migrate_ai_api_keys();