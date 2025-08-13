-- Create unified keywords table for centralized keyword management
CREATE TABLE public.unified_keywords (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  keyword text NOT NULL,
  search_volume integer,
  difficulty integer,
  source_type text NOT NULL CHECK (source_type IN ('manual', 'serp', 'glossary', 'strategy')),
  source_id uuid,
  first_discovered_at timestamp with time zone NOT NULL DEFAULT now(),
  last_updated_at timestamp with time zone NOT NULL DEFAULT now(),
  usage_count integer NOT NULL DEFAULT 0,
  content_usage jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(user_id, keyword, source_type, source_id)
);

-- Create keyword usage tracking table
CREATE TABLE public.keyword_usage_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unified_keyword_id uuid NOT NULL REFERENCES public.unified_keywords(id) ON DELETE CASCADE,
  content_id uuid,
  content_type text NOT NULL CHECK (content_type IN ('content_item', 'glossary_term', 'strategy', 'cluster')),
  usage_type text NOT NULL CHECK (usage_type IN ('primary', 'secondary', 'serp_extracted', 'manual')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.unified_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_usage_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for unified_keywords
CREATE POLICY "Users can view their own unified keywords"
ON public.unified_keywords FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own unified keywords"
ON public.unified_keywords FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own unified keywords"
ON public.unified_keywords FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own unified keywords"
ON public.unified_keywords FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for keyword_usage_log
CREATE POLICY "Users can view usage logs for their keywords"
ON public.keyword_usage_log FOR SELECT
USING (unified_keyword_id IN (
  SELECT id FROM public.unified_keywords WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert usage logs for their keywords"
ON public.keyword_usage_log FOR INSERT
WITH CHECK (unified_keyword_id IN (
  SELECT id FROM public.unified_keywords WHERE user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_unified_keywords_user_id ON public.unified_keywords(user_id);
CREATE INDEX idx_unified_keywords_keyword ON public.unified_keywords(keyword);
CREATE INDEX idx_unified_keywords_source ON public.unified_keywords(source_type, source_id);
CREATE INDEX idx_keyword_usage_log_keyword_id ON public.keyword_usage_log(unified_keyword_id);
CREATE INDEX idx_keyword_usage_log_content ON public.keyword_usage_log(content_id, content_type);

-- Create trigger for updating last_updated_at
CREATE TRIGGER update_unified_keywords_updated_at
  BEFORE UPDATE ON public.unified_keywords
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();