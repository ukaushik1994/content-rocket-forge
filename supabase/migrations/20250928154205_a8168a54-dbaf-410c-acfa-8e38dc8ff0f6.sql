-- Create strategy keyword integrations table
CREATE TABLE IF NOT EXISTS public.strategy_keyword_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  strategy_id UUID NOT NULL,
  keyword_id UUID NOT NULL REFERENCES public.unified_keywords(id),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  target_position INTEGER,
  content_gap_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(strategy_id, keyword_id)
);

-- Add RLS policies
ALTER TABLE public.strategy_keyword_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own strategy keyword integrations"
ON public.strategy_keyword_integrations
FOR ALL
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_strategy_keyword_integrations_strategy_id 
ON public.strategy_keyword_integrations(strategy_id);

CREATE INDEX IF NOT EXISTS idx_strategy_keyword_integrations_keyword_id 
ON public.strategy_keyword_integrations(keyword_id);

-- Add keywords column to content_items if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'content_items' 
    AND column_name = 'keywords' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.content_items 
    ADD COLUMN keywords JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add updated_at trigger for strategy_keyword_integrations
CREATE OR REPLACE TRIGGER update_strategy_keyword_integrations_updated_at
  BEFORE UPDATE ON public.strategy_keyword_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();