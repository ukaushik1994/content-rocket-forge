-- Create strategy generation progress tracking table
CREATE TABLE public.strategy_generation_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  step INTEGER NOT NULL DEFAULT 0,
  step_name TEXT NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, error
  step_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.strategy_generation_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own progress" 
ON public.strategy_generation_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON public.strategy_generation_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.strategy_generation_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for timestamps
CREATE TRIGGER update_strategy_generation_progress_updated_at
BEFORE UPDATE ON public.strategy_generation_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_strategy_generation_progress_session ON public.strategy_generation_progress(session_id);
CREATE INDEX idx_strategy_generation_progress_user_session ON public.strategy_generation_progress(user_id, session_id);