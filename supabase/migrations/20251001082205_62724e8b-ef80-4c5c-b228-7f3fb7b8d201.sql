-- Phase 3: Research Intelligence Enhancement - Complete Database Schema
-- Drop existing tables if they exist to ensure clean creation
DROP TABLE IF EXISTS public.keyword_topics CASCADE;
DROP TABLE IF EXISTS public.topic_performance CASCADE;
DROP TABLE IF EXISTS public.content_opportunities CASCADE;
DROP TABLE IF EXISTS public.strategy_recommendations CASCADE;
DROP TABLE IF EXISTS public.content_gaps CASCADE;
DROP TABLE IF EXISTS public.topic_clusters CASCADE;

-- Topic Clusters: Groups related topics together
CREATE TABLE public.topic_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cluster_name TEXT NOT NULL,
  description TEXT,
  parent_cluster_id UUID REFERENCES public.topic_clusters(id) ON DELETE SET NULL,
  embedding vector(1536),
  importance_score FLOAT DEFAULT 0.5,
  topic_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Gaps: Identified opportunities based on SERP analysis
CREATE TABLE public.content_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  gap_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  keywords TEXT[],
  target_cluster_id UUID REFERENCES public.topic_clusters(id) ON DELETE SET NULL,
  opportunity_score FLOAT DEFAULT 0.5,
  search_volume INTEGER,
  competition_level TEXT,
  current_ranking INTEGER,
  potential_traffic INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'identified',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategy Recommendations: AI-generated strategic recommendations
CREATE TABLE public.strategy_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT,
  priority TEXT DEFAULT 'medium',
  confidence_score FLOAT DEFAULT 0.5,
  expected_impact TEXT,
  effort_estimate TEXT,
  related_gap_id UUID REFERENCES public.content_gaps(id) ON DELETE SET NULL,
  related_cluster_id UUID REFERENCES public.topic_clusters(id) ON DELETE SET NULL,
  data_sources JSONB DEFAULT '[]'::jsonb,
  action_items JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending',
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Opportunities: Scored content opportunities
CREATE TABLE public.content_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  primary_keyword TEXT NOT NULL,
  related_keywords TEXT[],
  cluster_id UUID REFERENCES public.topic_clusters(id) ON DELETE SET NULL,
  opportunity_type TEXT NOT NULL,
  priority_score FLOAT DEFAULT 0.5,
  search_volume INTEGER,
  keyword_difficulty INTEGER,
  content_quality_gap FLOAT,
  competitor_count INTEGER,
  trending_score FLOAT,
  estimated_traffic INTEGER,
  estimated_effort TEXT,
  suggested_format TEXT,
  content_angle TEXT,
  target_audience TEXT,
  serp_features TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'open',
  scheduled_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topic Performance: Historical performance tracking of topics
CREATE TABLE public.topic_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic_id UUID REFERENCES public.context_topics(id) ON DELETE CASCADE,
  cluster_id UUID REFERENCES public.topic_clusters(id) ON DELETE SET NULL,
  metric_date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr FLOAT DEFAULT 0,
  average_position FLOAT,
  content_count INTEGER DEFAULT 0,
  engagement_score FLOAT DEFAULT 0,
  conversion_score FLOAT DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keyword Topics: Links keywords to topics for clustering
CREATE TABLE public.keyword_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  cluster_id UUID REFERENCES public.topic_clusters(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.context_topics(id) ON DELETE CASCADE,
  relevance_score FLOAT DEFAULT 0.5,
  search_volume INTEGER,
  competition_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_topic_clusters_user ON public.topic_clusters(user_id);
CREATE INDEX idx_topic_clusters_parent ON public.topic_clusters(parent_cluster_id);
CREATE INDEX idx_topic_clusters_embedding ON public.topic_clusters USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_keyword_topics_user ON public.keyword_topics(user_id);
CREATE INDEX idx_keyword_topics_cluster ON public.keyword_topics(cluster_id);
CREATE INDEX idx_keyword_topics_topic ON public.keyword_topics(topic_id);
CREATE INDEX idx_keyword_topics_keyword_cluster ON public.keyword_topics(user_id, keyword, cluster_id);
CREATE INDEX idx_content_gaps_user ON public.content_gaps(user_id);
CREATE INDEX idx_content_gaps_cluster ON public.content_gaps(target_cluster_id);
CREATE INDEX idx_content_gaps_status ON public.content_gaps(status);
CREATE INDEX idx_strategy_recommendations_user ON public.strategy_recommendations(user_id);
CREATE INDEX idx_strategy_recommendations_status ON public.strategy_recommendations(status);
CREATE INDEX idx_content_opportunities_user ON public.content_opportunities(user_id);
CREATE INDEX idx_content_opportunities_cluster ON public.content_opportunities(cluster_id);
CREATE INDEX idx_content_opportunities_status ON public.content_opportunities(status);
CREATE INDEX idx_topic_performance_user ON public.topic_performance(user_id);
CREATE INDEX idx_topic_performance_topic ON public.topic_performance(topic_id);
CREATE INDEX idx_topic_performance_date ON public.topic_performance(metric_date);
CREATE INDEX idx_topic_performance_unique ON public.topic_performance(user_id, topic_id, metric_date);

-- RLS Policies
ALTER TABLE public.topic_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own clusters" ON public.topic_clusters FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own keyword topics" ON public.keyword_topics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own content gaps" ON public.content_gaps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own recommendations" ON public.strategy_recommendations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own opportunities" ON public.content_opportunities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own performance data" ON public.topic_performance FOR ALL USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_topic_clusters_updated_at
  BEFORE UPDATE ON public.topic_clusters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_gaps_updated_at
  BEFORE UPDATE ON public.content_gaps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategy_recommendations_updated_at
  BEFORE UPDATE ON public.strategy_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_opportunities_updated_at
  BEFORE UPDATE ON public.content_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();