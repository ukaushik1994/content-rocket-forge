-- Create workflow states table for SERP workflow persistence
CREATE TABLE public.serp_workflow_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workflow_type TEXT NOT NULL,
  workflow_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  progress JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  results JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SERP conversation context table
CREATE TABLE public.serp_conversation_context (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id UUID,
  context_type TEXT NOT NULL,
  context_data JSONB NOT NULL DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  last_serp_analysis JSONB DEFAULT '{}',
  workflow_state JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.serp_workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serp_conversation_context ENABLE ROW LEVEL SECURITY;

-- Create policies for serp_workflow_states
CREATE POLICY "Users can manage their own workflow states"
ON public.serp_workflow_states
FOR ALL
USING (auth.uid() = user_id);

-- Create policies for serp_conversation_context
CREATE POLICY "Users can manage their own conversation context"
ON public.serp_conversation_context
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_serp_workflow_states_user_id ON public.serp_workflow_states(user_id);
CREATE INDEX idx_serp_workflow_states_status ON public.serp_workflow_states(status);
CREATE INDEX idx_serp_workflow_states_workflow_type ON public.serp_workflow_states(workflow_type);
CREATE INDEX idx_serp_conversation_context_user_id ON public.serp_conversation_context(user_id);
CREATE INDEX idx_serp_conversation_context_conversation_id ON public.serp_conversation_context(conversation_id);

-- Add updated_at trigger for workflow states
CREATE TRIGGER update_serp_workflow_states_updated_at
  BEFORE UPDATE ON public.serp_workflow_states
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for conversation context
CREATE TRIGGER update_serp_conversation_context_updated_at
  BEFORE UPDATE ON public.serp_conversation_context
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();