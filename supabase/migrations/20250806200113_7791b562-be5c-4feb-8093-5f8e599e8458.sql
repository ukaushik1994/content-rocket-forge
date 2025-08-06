-- Create enhanced AI service providers table
CREATE TABLE IF NOT EXISTS public.ai_service_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'openrouter', 'anthropic', 'gemini', 'mistral')),
  api_key TEXT NOT NULL,
  preferred_model TEXT,
  priority INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  last_verified TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.ai_service_providers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own AI providers" 
ON public.ai_service_providers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI providers" 
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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_service_providers_updated_at
BEFORE UPDATE ON public.ai_service_providers
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();