-- Create table for user LLM keys
CREATE TABLE IF NOT EXISTS public.user_llm_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openrouter', 'openai', 'anthropic', 'gemini', 'mistral')),
  api_key TEXT NOT NULL,
  model TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Create table for LLM usage logs
CREATE TABLE IF NOT EXISTS public.llm_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost_estimate DECIMAL(10, 6),
  request_duration_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_llm_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user_llm_keys
CREATE POLICY "Users can view their own LLM keys" 
ON public.user_llm_keys 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own LLM keys" 
ON public.user_llm_keys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LLM keys" 
ON public.user_llm_keys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LLM keys" 
ON public.user_llm_keys 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for llm_usage_logs
CREATE POLICY "Users can view their own LLM usage logs" 
ON public.llm_usage_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own LLM usage logs" 
ON public.llm_usage_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_user_llm_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_llm_keys_updated_at
BEFORE UPDATE ON public.user_llm_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_user_llm_keys_updated_at();