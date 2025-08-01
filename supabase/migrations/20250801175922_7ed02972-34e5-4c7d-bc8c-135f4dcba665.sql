
-- Create table for AI chat contexts (storing user solutions, preferences, etc.)
CREATE TABLE public.ai_chat_contexts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  context_type TEXT NOT NULL, -- 'solutions', 'analytics', 'preferences'
  context_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for workflow states to maintain complex conversation flows
CREATE TABLE public.ai_workflow_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  conversation_id UUID REFERENCES public.ai_conversations(id),
  workflow_type TEXT NOT NULL, -- 'keyword-optimization', 'content-creation', etc.
  current_step TEXT NOT NULL,
  workflow_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.ai_chat_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_workflow_states ENABLE ROW LEVEL SECURITY;

-- Context policies
CREATE POLICY "Users can view their own AI chat contexts" 
  ON public.ai_chat_contexts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI chat contexts" 
  ON public.ai_chat_contexts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI chat contexts" 
  ON public.ai_chat_contexts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI chat contexts" 
  ON public.ai_chat_contexts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Workflow state policies
CREATE POLICY "Users can view their own AI workflow states" 
  ON public.ai_workflow_states 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI workflow states" 
  ON public.ai_workflow_states 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI workflow states" 
  ON public.ai_workflow_states 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI workflow states" 
  ON public.ai_workflow_states 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER trigger_ai_chat_contexts_updated_at
  BEFORE UPDATE ON public.ai_chat_contexts
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trigger_ai_workflow_states_updated_at
  BEFORE UPDATE ON public.ai_workflow_states
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
