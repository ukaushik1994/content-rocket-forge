-- Create AI context state table for persistent context
CREATE TABLE public.ai_context_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  context JSONB DEFAULT '{}',
  workflow_state JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create AI context snapshots table for conversation history
CREATE TABLE public.ai_context_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  messages JSONB DEFAULT '[]',
  workflow_state JSONB DEFAULT '{}',
  conversation_type TEXT DEFAULT 'regular',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_context_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_context_snapshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_context_state
CREATE POLICY "Users can manage their own context state"
ON public.ai_context_state
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for ai_context_snapshots  
CREATE POLICY "Users can manage their own context snapshots"
ON public.ai_context_snapshots
FOR ALL
USING (auth.uid() = user_id);

-- Create updated_at trigger for ai_context_state
CREATE TRIGGER update_ai_context_state_updated_at
BEFORE UPDATE ON public.ai_context_state
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();