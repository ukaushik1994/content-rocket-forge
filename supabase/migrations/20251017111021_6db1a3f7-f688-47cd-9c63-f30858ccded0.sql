-- Create function to refresh keyword usage counts
CREATE OR REPLACE FUNCTION public.refresh_keyword_usage_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update usage_count for all keywords based on keyword_usage_log
  UPDATE public.unified_keywords uk
  SET usage_count = (
    SELECT COUNT(*)
    FROM public.keyword_usage_log kul
    WHERE kul.unified_keyword_id = uk.id
  );
  
  -- Log completion
  RAISE NOTICE 'Keyword usage counts refreshed successfully';
END;
$$;