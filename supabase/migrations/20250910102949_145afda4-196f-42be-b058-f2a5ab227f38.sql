-- Create tables for Phase 3 implementation

-- Enhanced file analyses table
CREATE TABLE public.ai_file_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  analysis_type TEXT NOT NULL DEFAULT 'standard',
  content_preview TEXT,
  extracted_text TEXT,
  insights JSONB DEFAULT '[]'::jsonb,
  sentiment_score NUMERIC,
  key_topics TEXT[],
  entities JSONB DEFAULT '[]'::jsonb,
  optimization_suggestions JSONB DEFAULT '[]'::jsonb,
  competitive_analysis JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_file_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_file_analyses
CREATE POLICY "Users can create their own file analyses" 
ON public.ai_file_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own file analyses" 
ON public.ai_file_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own file analyses" 
ON public.ai_file_analyses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own file analyses" 
ON public.ai_file_analyses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Collaboration sessions table
CREATE TABLE public.collaboration_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_user_id UUID NOT NULL,
  session_name TEXT NOT NULL,
  conversation_id UUID,
  participants JSONB DEFAULT '[]'::jsonb,
  screen_sharing_active BOOLEAN DEFAULT false,
  screen_sharing_user_id UUID,
  session_data JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collaboration_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for collaboration_sessions
CREATE POLICY "Users can create collaboration sessions" 
ON public.collaboration_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Users can view sessions they host or participate in" 
ON public.collaboration_sessions 
FOR SELECT 
USING (
  auth.uid() = host_user_id OR 
  participants @> jsonb_build_array(jsonb_build_object('user_id', auth.uid()::text))
);

CREATE POLICY "Hosts can update their sessions" 
ON public.collaboration_sessions 
FOR UPDATE 
USING (auth.uid() = host_user_id);

-- Workflow automations table
CREATE TABLE public.workflow_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  automation_name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_conditions JSONB DEFAULT '{}'::jsonb,
  actions JSONB DEFAULT '[]'::jsonb,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_automations ENABLE ROW LEVEL SECURITY;

-- Create policies for workflow_automations
CREATE POLICY "Users can create their own automations" 
ON public.workflow_automations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own automations" 
ON public.workflow_automations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own automations" 
ON public.workflow_automations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own automations" 
ON public.workflow_automations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_ai_file_analyses_updated_at
BEFORE UPDATE ON public.ai_file_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collaboration_sessions_updated_at
BEFORE UPDATE ON public.collaboration_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_automations_updated_at
BEFORE UPDATE ON public.workflow_automations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();