-- Insert default AI providers for users who don't have any configured
-- This will set up OpenAI as the default provider

-- First, let's ensure the ai_service_providers table has the right structure
-- (This is safe to run even if the table already exists)
CREATE TABLE IF NOT EXISTS public.ai_service_providers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    provider TEXT NOT NULL,
    api_key TEXT,
    status TEXT NOT NULL DEFAULT 'inactive',
    priority INTEGER NOT NULL DEFAULT 0,
    settings JSONB DEFAULT '{}',
    capabilities TEXT[] DEFAULT '{}',
    available_models TEXT[] DEFAULT '{}',
    last_verified TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.ai_service_providers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "Users can view their own AI providers" 
ON public.ai_service_providers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own AI providers" 
ON public.ai_service_providers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own AI providers" 
ON public.ai_service_providers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own AI providers" 
ON public.ai_service_providers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_ai_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ai_providers_updated_at ON public.ai_service_providers;
CREATE TRIGGER update_ai_providers_updated_at
  BEFORE UPDATE ON public.ai_service_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_providers_updated_at();

-- Function to initialize default AI providers for a user
CREATE OR REPLACE FUNCTION public.initialize_default_ai_providers(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert OpenAI provider if it doesn't exist
  INSERT INTO public.ai_service_providers (
    user_id,
    provider,
    status,
    priority,
    capabilities,
    available_models,
    settings
  ) VALUES (
    target_user_id,
    'openai',
    'active',
    1,
    ARRAY['chat', 'completion', 'embedding'],
    ARRAY['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    '{"default_model": "gpt-4", "temperature": 0.7, "max_tokens": 1000}'::jsonb
  ) ON CONFLICT (user_id, provider) DO UPDATE SET
    status = 'active',
    priority = 1,
    capabilities = ARRAY['chat', 'completion', 'embedding'],
    available_models = ARRAY['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    settings = '{"default_model": "gpt-4", "temperature": 0.7, "max_tokens": 1000}'::jsonb,
    updated_at = now();

  -- Insert Anthropic provider if it doesn't exist  
  INSERT INTO public.ai_service_providers (
    user_id,
    provider,
    status,
    priority,
    capabilities,
    available_models,
    settings
  ) VALUES (
    target_user_id,
    'anthropic',
    'inactive',
    2,
    ARRAY['chat', 'completion'],
    ARRAY['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    '{"default_model": "claude-3-sonnet-20240229", "temperature": 0.7, "max_tokens": 1000}'::jsonb
  ) ON CONFLICT (user_id, provider) DO NOTHING;

  -- Insert Gemini provider if it doesn't exist
  INSERT INTO public.ai_service_providers (
    user_id,
    provider,
    status,
    priority,
    capabilities,
    available_models,
    settings
  ) VALUES (
    target_user_id,
    'gemini',
    'inactive',
    3,
    ARRAY['chat', 'completion'],
    ARRAY['gemini-pro', 'gemini-pro-vision'],
    '{"default_model": "gemini-pro", "temperature": 0.7, "max_tokens": 1000}'::jsonb
  ) ON CONFLICT (user_id, provider) DO NOTHING;
END;
$$;