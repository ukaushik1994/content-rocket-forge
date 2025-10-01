-- Phase 2: Context & Memory Intelligence System

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Conversation summaries with key insights
CREATE TABLE IF NOT EXISTS public.conversation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  summary TEXT NOT NULL,
  key_topics TEXT[],
  entities JSONB DEFAULT '[]'::jsonb,
  sentiment_score FLOAT,
  importance_score FLOAT DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Context topics with embeddings for semantic search
CREATE TABLE IF NOT EXISTS public.context_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic_name TEXT NOT NULL,
  description TEXT,
  embedding vector(1536),
  frequency INTEGER DEFAULT 1,
  last_mentioned TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_name)
);

-- Topic relationships for cross-conversation linking
CREATE TABLE IF NOT EXISTS public.topic_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic_a_id UUID REFERENCES public.context_topics(id) ON DELETE CASCADE,
  topic_b_id UUID REFERENCES public.context_topics(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  strength FLOAT DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences learned from conversations
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  preference_type TEXT NOT NULL,
  preference_value JSONB NOT NULL,
  confidence_score FLOAT DEFAULT 0.5,
  source_conversation_id UUID REFERENCES public.ai_conversations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learned patterns from user behavior
CREATE TABLE IF NOT EXISTS public.learned_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB NOT NULL,
  occurrences INTEGER DEFAULT 1,
  confidence FLOAT DEFAULT 0.5,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation insights and key moments
CREATE TABLE IF NOT EXISTS public.conversation_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL,
  insight_data JSONB NOT NULL,
  importance FLOAT DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message embeddings for semantic search
CREATE TABLE IF NOT EXISTS public.message_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.ai_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_user ON public.conversation_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_conversation ON public.conversation_summaries(conversation_id);
CREATE INDEX IF NOT EXISTS idx_context_topics_user ON public.context_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_context_topics_embedding ON public.context_topics USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_topic_relationships_user ON public.topic_relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_learned_patterns_user ON public.learned_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_insights_user ON public.conversation_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_insights_conversation ON public.conversation_insights(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_embeddings_user ON public.message_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_message_embeddings_embedding ON public.message_embeddings USING ivfflat (embedding vector_cosine_ops);

-- RLS Policies
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learned_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own summaries" ON public.conversation_summaries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own topics" ON public.context_topics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own relationships" ON public.topic_relationships FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own patterns" ON public.learned_patterns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own insights" ON public.conversation_insights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own embeddings" ON public.message_embeddings FOR ALL USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_summaries_updated_at
  BEFORE UPDATE ON public.conversation_summaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();