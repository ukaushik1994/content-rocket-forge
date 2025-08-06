-- Create function to log SERP usage (workaround for type limitations)
CREATE OR REPLACE FUNCTION public.log_serp_usage(
  p_user_id UUID,
  p_provider TEXT,
  p_operation TEXT,
  p_success BOOLEAN,
  p_metadata JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.serp_usage_logs (user_id, provider, operation, success, metadata)
  VALUES (p_user_id, p_provider, p_operation, p_success, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;