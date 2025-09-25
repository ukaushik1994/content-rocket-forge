-- Create workflow schedules table for scheduling functionality
CREATE TABLE public.workflow_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workflow_id UUID NOT NULL,
  schedule_expression TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own workflow schedules" 
ON public.workflow_schedules 
FOR ALL 
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_workflow_schedules_updated_at
BEFORE UPDATE ON public.workflow_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();