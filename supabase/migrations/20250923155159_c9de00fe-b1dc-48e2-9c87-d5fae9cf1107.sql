-- Create workflow states table for persistent workflow tracking
CREATE TABLE IF NOT EXISTS public.ai_workflow_states (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workflow_type TEXT NOT NULL,
    current_step TEXT NOT NULL,
    workflow_data JSONB DEFAULT '{}',
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, workflow_type)
);

-- Add constraint after table creation
ALTER TABLE public.ai_workflow_states 
ADD CONSTRAINT ai_workflow_states_status_check 
CHECK (status IN ('active', 'completed', 'paused', 'error'));

-- Enable RLS
ALTER TABLE public.ai_workflow_states ENABLE ROW LEVEL SECURITY;

-- Create policies for workflow states
CREATE POLICY "Users can view their own workflow states" 
ON public.ai_workflow_states 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow states" 
ON public.ai_workflow_states 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow states" 
ON public.ai_workflow_states 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow states" 
ON public.ai_workflow_states 
FOR DELETE 
USING (auth.uid() = user_id);