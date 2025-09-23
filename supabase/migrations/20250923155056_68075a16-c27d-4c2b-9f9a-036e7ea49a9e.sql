-- Create workflow states table for persistent workflow tracking
CREATE TABLE IF NOT EXISTS public.ai_workflow_states (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workflow_type TEXT NOT NULL,
    current_step TEXT NOT NULL,
    workflow_data JSONB DEFAULT '{}',
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'error')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, workflow_type)
);

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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_workflow_states_updated_at
    BEFORE UPDATE ON public.ai_workflow_states
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_workflow_states_user_id ON public.ai_workflow_states(user_id);
CREATE INDEX idx_workflow_states_type ON public.ai_workflow_states(workflow_type);
CREATE INDEX idx_workflow_states_status ON public.ai_workflow_states(status);