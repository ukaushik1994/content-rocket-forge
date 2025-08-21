-- Create the update timestamp function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create conversation management tables for multi-step AI strategy generation
CREATE TABLE public.ai_strategy_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  current_step INTEGER NOT NULL DEFAULT 1,
  total_steps INTEGER NOT NULL DEFAULT 6,
  goals JSONB NOT NULL DEFAULT '{}',
  company_context JSONB DEFAULT '{}',
  solutions_context JSONB DEFAULT '{}',
  final_strategy_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE public.conversation_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  ai_input JSONB NOT NULL DEFAULT '{}',
  ai_output JSONB NOT NULL DEFAULT '{}',
  user_feedback JSONB NULL,
  processing_time_ms INTEGER NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE NULL
);

-- Enable RLS on conversation tables
ALTER TABLE public.ai_strategy_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_steps ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_strategy_conversations
CREATE POLICY "Users can create their own strategy conversations"
ON public.ai_strategy_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own strategy conversations"
ON public.ai_strategy_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategy conversations"
ON public.ai_strategy_conversations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategy conversations"
ON public.ai_strategy_conversations
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for conversation_steps
CREATE POLICY "Users can create steps for their conversations"
ON public.conversation_steps
FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM public.ai_strategy_conversations
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view steps from their conversations"
ON public.conversation_steps
FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM public.ai_strategy_conversations
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update steps from their conversations"
ON public.conversation_steps
FOR UPDATE
USING (
  conversation_id IN (
    SELECT id FROM public.ai_strategy_conversations
    WHERE user_id = auth.uid()
  )
);

-- Foreign key constraints
ALTER TABLE public.conversation_steps
ADD CONSTRAINT fk_conversation_steps_conversation_id
FOREIGN KEY (conversation_id) REFERENCES public.ai_strategy_conversations(id)
ON DELETE CASCADE;

-- Add trigger for updating timestamps
CREATE TRIGGER update_ai_strategy_conversations_updated_at
BEFORE UPDATE ON public.ai_strategy_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_ai_strategy_conversations_user_id ON public.ai_strategy_conversations(user_id);
CREATE INDEX idx_ai_strategy_conversations_status ON public.ai_strategy_conversations(status);
CREATE INDEX idx_conversation_steps_conversation_id ON public.conversation_steps(conversation_id);
CREATE INDEX idx_conversation_steps_step_number ON public.conversation_steps(step_number);