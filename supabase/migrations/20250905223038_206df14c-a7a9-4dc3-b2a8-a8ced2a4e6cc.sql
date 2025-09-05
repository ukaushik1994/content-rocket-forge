-- Create table to store historical AI strategy proposals
CREATE TABLE public.ai_strategy_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  primary_keyword TEXT NOT NULL,
  related_keywords TEXT[] DEFAULT '{}',
  content_suggestions TEXT[] DEFAULT '{}',
  estimated_impressions INTEGER DEFAULT 0,
  priority_tag TEXT DEFAULT 'evergreen',
  content_type TEXT DEFAULT 'blog',
  serp_data JSONB DEFAULT '{}',
  proposal_data JSONB DEFAULT '{}',
  strategy_session_id UUID, -- Link to the ai_strategies table
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_strategy_proposals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own AI strategy proposals" 
ON public.ai_strategy_proposals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own AI strategy proposals" 
ON public.ai_strategy_proposals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI strategy proposals" 
ON public.ai_strategy_proposals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI strategy proposals" 
ON public.ai_strategy_proposals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_ai_strategy_proposals_user_id ON public.ai_strategy_proposals(user_id);
CREATE INDEX idx_ai_strategy_proposals_primary_keyword ON public.ai_strategy_proposals(primary_keyword);
CREATE INDEX idx_ai_strategy_proposals_created_at ON public.ai_strategy_proposals(created_at DESC);
CREATE INDEX idx_ai_strategy_proposals_strategy_session ON public.ai_strategy_proposals(strategy_session_id);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_strategy_proposals_updated_at
BEFORE UPDATE ON public.ai_strategy_proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();