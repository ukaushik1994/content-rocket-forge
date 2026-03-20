-- 3A: Performance indexes on core tables
CREATE INDEX IF NOT EXISTS idx_content_items_user_status ON public.content_items (user_id, status);
CREATE INDEX IF NOT EXISTS idx_content_items_user_created ON public.content_items (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_user_seo ON public.content_items (user_id, seo_score DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_user_funnel ON public.content_items (user_id, funnel_stage);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conv_seq ON public.ai_messages (conversation_id, message_sequence DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_updated ON public.ai_conversations (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_user_keyword ON public.keywords (user_id, keyword);
CREATE INDEX IF NOT EXISTS idx_proposals_user_status ON public.ai_strategy_proposals (user_id, status);
CREATE INDEX IF NOT EXISTS idx_calendar_user_date ON public.content_calendar (user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_status ON public.campaigns (user_id, status);
CREATE INDEX IF NOT EXISTS idx_perf_signals_user_content ON public.content_performance_signals (user_id, content_id);

-- 3B: Data retention cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete messages from archived conversations older than 1 year
  DELETE FROM public.ai_messages
  WHERE conversation_id IN (
    SELECT id FROM public.ai_conversations
    WHERE archived = true AND updated_at < now() - interval '1 year'
  );

  -- Delete old archived conversations themselves (1 year+)
  DELETE FROM public.ai_conversations
  WHERE archived = true AND updated_at < now() - interval '1 year';

  -- Delete acted-on approval recommendations older than 90 days
  DELETE FROM public.approval_recommendations
  WHERE created_at < now() - interval '90 days';

  -- Delete old performance signals older than 1 year
  DELETE FROM public.content_performance_signals
  WHERE created_at < now() - interval '1 year';

  -- Delete old action analytics older than 1 year
  DELETE FROM public.action_analytics
  WHERE created_at < now() - interval '1 year';

  -- Delete old behavioral sessions older than 1 year
  DELETE FROM public.behavioral_analytics_sessions
  WHERE session_start < now() - interval '1 year';
END;
$$;