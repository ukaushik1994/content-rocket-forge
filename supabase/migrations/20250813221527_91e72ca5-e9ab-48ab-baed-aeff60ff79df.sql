-- Create AI strategies table
CREATE TABLE public.ai_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  proposals JSONB NOT NULL DEFAULT '[]'::jsonb,
  serp_data JSONB DEFAULT '{}'::jsonb,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  session_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_strategies ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own AI strategies" 
ON public.ai_strategies 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI strategies" 
ON public.ai_strategies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI strategies" 
ON public.ai_strategies 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI strategies" 
ON public.ai_strategies 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_strategies_updated_at
BEFORE UPDATE ON public.ai_strategies
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();