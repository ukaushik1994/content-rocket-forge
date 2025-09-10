-- Add new columns to ai_conversations for enhanced management
ALTER TABLE ai_conversations 
ADD COLUMN pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN archived BOOLEAN DEFAULT FALSE,
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create action analytics table for tracking AI action performance
CREATE TABLE public.action_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_label TEXT NOT NULL,
  user_id UUID NOT NULL,
  conversation_id UUID,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  interaction_data JSONB DEFAULT '{}',
  effectiveness_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create action patterns table for learning user behavior
CREATE TABLE public.action_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_sequence TEXT[] NOT NULL,
  outcome TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on action analytics
ALTER TABLE public.action_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for action analytics
CREATE POLICY "Users can create their own action analytics" 
ON public.action_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own action analytics" 
ON public.action_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own action analytics" 
ON public.action_analytics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Enable RLS on action patterns
ALTER TABLE public.action_patterns ENABLE ROW LEVEL SECURITY;

-- Create policies for action patterns
CREATE POLICY "Users can create their own action patterns" 
ON public.action_patterns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own action patterns" 
ON public.action_patterns 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_action_analytics_user_id ON public.action_analytics(user_id);
CREATE INDEX idx_action_analytics_action_id ON public.action_analytics(action_id);
CREATE INDEX idx_action_analytics_triggered_at ON public.action_analytics(triggered_at);
CREATE INDEX idx_action_patterns_user_id ON public.action_patterns(user_id);

-- Add trigger for updating timestamps
CREATE TRIGGER update_action_analytics_updated_at
BEFORE UPDATE ON public.action_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();