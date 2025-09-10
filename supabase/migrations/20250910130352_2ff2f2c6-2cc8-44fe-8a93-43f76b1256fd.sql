-- Create AI training logs table for tracking custom model training
CREATE TABLE IF NOT EXISTS public.ai_training_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    model_type TEXT NOT NULL,
    training_data JSONB,
    status TEXT NOT NULL CHECK (status IN ('initiated', 'training', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Enable Row Level Security
ALTER TABLE public.ai_training_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_training_logs
CREATE POLICY "Users can view their own training logs" 
ON public.ai_training_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own training logs" 
ON public.ai_training_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training logs" 
ON public.ai_training_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_training_logs_updated_at
BEFORE UPDATE ON public.ai_training_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_ai_training_logs_user_id ON public.ai_training_logs(user_id);
CREATE INDEX idx_ai_training_logs_status ON public.ai_training_logs(status);
CREATE INDEX idx_ai_training_logs_created_at ON public.ai_training_logs(created_at);