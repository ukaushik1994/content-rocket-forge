CREATE OR REPLACE FUNCTION public.avg_messages_per_conversation(p_user_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    ROUND(AVG(msg_count)::numeric, 1),
    0
  )
  FROM (
    SELECT c.id, COUNT(m.id) AS msg_count
    FROM public.ai_conversations c
    LEFT JOIN public.ai_messages m ON m.conversation_id = c.id
    WHERE c.user_id = p_user_id
    GROUP BY c.id
  ) sub;
$$;