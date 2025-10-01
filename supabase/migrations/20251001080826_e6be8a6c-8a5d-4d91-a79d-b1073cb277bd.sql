-- Database functions for Phase 2 context intelligence

-- Function to increment topic frequency
CREATE OR REPLACE FUNCTION public.increment_topic_frequency(
  p_user_id UUID,
  p_topic_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.context_topics
  SET 
    frequency = frequency + 1,
    last_mentioned = NOW()
  WHERE user_id = p_user_id AND topic_name = p_topic_name;
END;
$$;

-- Function to match similar messages using vector similarity
CREATE OR REPLACE FUNCTION public.match_messages(
  query_embedding TEXT,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  message_id UUID,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    me.message_id,
    1 - (me.embedding <=> query_embedding::vector) as similarity
  FROM public.message_embeddings me
  WHERE me.user_id = auth.uid()
    AND 1 - (me.embedding <=> query_embedding::vector) > match_threshold
  ORDER BY me.embedding <=> query_embedding::vector
  LIMIT match_count;
END;
$$;

-- Function to match similar topics using vector similarity
CREATE OR REPLACE FUNCTION public.match_topics(
  query_embedding TEXT,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  topic_name TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.id,
    ct.topic_name,
    1 - (ct.embedding <=> query_embedding::vector) as similarity
  FROM public.context_topics ct
  WHERE ct.user_id = auth.uid()
    AND ct.embedding IS NOT NULL
    AND 1 - (ct.embedding <=> query_embedding::vector) > match_threshold
  ORDER BY ct.embedding <=> query_embedding::vector
  LIMIT match_count;
END;
$$;