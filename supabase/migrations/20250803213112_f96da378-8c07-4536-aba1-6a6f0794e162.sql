-- Create content clusters table for strategic content planning
CREATE TABLE public.content_clusters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  estimated_traffic INTEGER DEFAULT 0,
  suggested_assets JSONB DEFAULT '{"glossary": 0, "blog": 0, "article": 0, "faq": 0}'::jsonb,
  timeframe_weeks INTEGER DEFAULT 6,
  priority_tag TEXT DEFAULT 'evergreen',
  description TEXT,
  solution_mapping TEXT[] DEFAULT '{}',
  competitor_analysis JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_clusters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own content clusters" 
ON public.content_clusters 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content clusters" 
ON public.content_clusters 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content clusters" 
ON public.content_clusters 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content clusters" 
ON public.content_clusters 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create cluster keywords junction table
CREATE TABLE public.cluster_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cluster_id UUID NOT NULL,
  keyword_id UUID NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  volume INTEGER DEFAULT 0,
  difficulty INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for cluster_keywords
ALTER TABLE public.cluster_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cluster keywords for their clusters" 
ON public.cluster_keywords 
FOR SELECT 
USING (cluster_id IN (SELECT id FROM content_clusters WHERE user_id = auth.uid()));

CREATE POLICY "Users can create cluster keywords for their clusters" 
ON public.cluster_keywords 
FOR INSERT 
WITH CHECK (cluster_id IN (SELECT id FROM content_clusters WHERE user_id = auth.uid()));

CREATE POLICY "Users can update cluster keywords for their clusters" 
ON public.cluster_keywords 
FOR UPDATE 
USING (cluster_id IN (SELECT id FROM content_clusters WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete cluster keywords for their clusters" 
ON public.cluster_keywords 
FOR DELETE 
USING (cluster_id IN (SELECT id FROM content_clusters WHERE user_id = auth.uid()));

-- Create strategy logs table
CREATE TABLE public.strategy_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cluster_id UUID,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for strategy_logs
ALTER TABLE public.strategy_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own strategy logs" 
ON public.strategy_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own strategy logs" 
ON public.strategy_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updating updated_at
CREATE TRIGGER update_content_clusters_updated_at
  BEFORE UPDATE ON public.content_clusters
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();