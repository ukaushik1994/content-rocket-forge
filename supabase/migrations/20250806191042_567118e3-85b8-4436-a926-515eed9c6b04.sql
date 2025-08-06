-- Create function to get SERP usage count
CREATE OR REPLACE FUNCTION public.get_serp_usage_count(
  p_user_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE
) RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.raw_serp_data
    WHERE user_id = p_user_id
    AND cached_at >= p_start_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;