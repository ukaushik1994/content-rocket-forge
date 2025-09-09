-- Fix the AI service providers table and policies
-- Create or update the ai_service_providers table structure
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own AI providers" ON public.ai_service_providers;
DROP POLICY IF EXISTS "Users can insert their own AI providers" ON public.ai_service_providers;  
DROP POLICY IF EXISTS "Users can update their own AI providers" ON public.ai_service_providers;
DROP POLICY IF EXISTS "Users can delete their own AI providers" ON public.ai_service_providers;

-- Create new policies
CREATE POLICY "Users can view their own AI providers" 
ON public.ai_service_providers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI providers" 
ON public.ai_service_providers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI providers" 
ON public.ai_service_providers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI providers" 
ON public.ai_service_providers 
FOR DELETE 
USING (auth.uid() = user_id);

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
END;
$$;