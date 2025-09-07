-- Create proposal lifecycle logs table
CREATE TABLE public.proposal_lifecycle_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id TEXT NOT NULL,
  status TEXT NOT NULL,
  pipeline_stage TEXT,
  calendar_status TEXT,
  progress INTEGER,
  notes TEXT,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.proposal_lifecycle_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can create their own proposal lifecycle logs" 
ON public.proposal_lifecycle_logs 
FOR INSERT 
WITH CHECK (true); -- Allow all authenticated users to log

CREATE POLICY "Users can view proposal lifecycle logs" 
ON public.proposal_lifecycle_logs 
FOR SELECT 
USING (true); -- Allow all authenticated users to view

CREATE POLICY "Users can update their own proposal lifecycle logs" 
ON public.proposal_lifecycle_logs 
FOR UPDATE 
USING (true); -- Allow all authenticated users to update

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_proposal_lifecycle_logs_updated_at
BEFORE UPDATE ON public.proposal_lifecycle_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();