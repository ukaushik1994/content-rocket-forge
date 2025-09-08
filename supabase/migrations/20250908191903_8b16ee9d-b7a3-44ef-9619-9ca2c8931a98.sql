-- Create content optimization logs table for tracking all optimization activities
CREATE TABLE public.content_optimization_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID,
  session_id TEXT NOT NULL,
  original_content_length INTEGER NOT NULL,
  optimized_content_length INTEGER,
  suggestions_analyzed JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggestions_applied JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggestions_rejected JSONB NOT NULL DEFAULT '[]'::jsonb,
  optimization_results JSONB,
  feedback_score INTEGER CHECK (feedback_score >= 1 AND feedback_score <= 5),
  user_feedback TEXT,
  reasoning JSONB NOT NULL DEFAULT '{}'::jsonb,
  success BOOLEAN DEFAULT false,
  error_details TEXT,
  optimization_settings JSONB DEFAULT '{}'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_optimization_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own optimization logs" 
ON public.content_optimization_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own optimization logs" 
ON public.content_optimization_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own optimization logs" 
ON public.content_optimization_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_content_optimization_logs_user_id ON public.content_optimization_logs(user_id);
CREATE INDEX idx_content_optimization_logs_session_id ON public.content_optimization_logs(session_id);
CREATE INDEX idx_content_optimization_logs_content_id ON public.content_optimization_logs(content_id);
CREATE INDEX idx_content_optimization_logs_created_at ON public.content_optimization_logs(created_at);
CREATE INDEX idx_content_optimization_logs_success ON public.content_optimization_logs(success);

-- Create trigger for updating timestamps
CREATE TRIGGER update_content_optimization_logs_updated_at
BEFORE UPDATE ON public.content_optimization_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to log optimization activity
CREATE OR REPLACE FUNCTION public.log_optimization_activity(
  p_user_id UUID,
  p_content_id UUID,
  p_session_id TEXT,
  p_original_length INTEGER,
  p_optimized_length INTEGER DEFAULT NULL,
  p_suggestions_analyzed JSONB DEFAULT '[]'::jsonb,
  p_suggestions_applied JSONB DEFAULT '[]'::jsonb,
  p_suggestions_rejected JSONB DEFAULT '[]'::jsonb,
  p_reasoning JSONB DEFAULT '{}'::jsonb,
  p_success BOOLEAN DEFAULT false,
  p_optimization_settings JSONB DEFAULT '{}'::jsonb,
  p_performance_metrics JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.content_optimization_logs (
    user_id,
    content_id,
    session_id,
    original_content_length,
    optimized_content_length,
    suggestions_analyzed,
    suggestions_applied,
    suggestions_rejected,
    reasoning,
    success,
    optimization_settings,
    performance_metrics
  ) VALUES (
    p_user_id,
    p_content_id,
    p_session_id,
    p_original_length,
    p_optimized_length,
    p_suggestions_analyzed,
    p_suggestions_applied,
    p_suggestions_rejected,
    p_reasoning,
    p_success,
    p_optimization_settings,
    p_performance_metrics
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create function to update optimization feedback
CREATE OR REPLACE FUNCTION public.update_optimization_feedback(
  p_log_id UUID,
  p_feedback_score INTEGER,
  p_user_feedback TEXT,
  p_optimization_results JSONB DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.content_optimization_logs 
  SET 
    feedback_score = p_feedback_score,
    user_feedback = p_user_feedback,
    optimization_results = COALESCE(p_optimization_results, optimization_results),
    updated_at = now()
  WHERE id = p_log_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;