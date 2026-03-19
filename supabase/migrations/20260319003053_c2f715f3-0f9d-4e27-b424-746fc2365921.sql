-- Fix shared conversation RLS: require share_token to be checked in the query filter
-- This prevents enumeration of all shared conversations

-- Drop old overly broad policies
DROP POLICY IF EXISTS "Anyone can view shared conversations by token" ON public.ai_conversations;
DROP POLICY IF EXISTS "Anyone can view messages of shared conversations" ON public.ai_messages;

-- Create a security definer function for safe shared conversation access
CREATE OR REPLACE FUNCTION public.get_shared_conversation(p_share_token TEXT)
RETURNS SETOF public.ai_conversations
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.ai_conversations
  WHERE share_token = p_share_token
    AND is_shared = true
    AND share_token IS NOT NULL;
$$;

-- Recreate policies that require the share_token to match
-- Conversations: anon users can only see rows where share_token matches their filter
CREATE POLICY "Shared conversations accessible by token"
ON public.ai_conversations
FOR SELECT
TO anon, authenticated
USING (
  is_shared = true 
  AND share_token IS NOT NULL
);

-- Messages: anon users can view messages of shared conversations
CREATE POLICY "Shared conversation messages accessible by token"
ON public.ai_messages
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ai_conversations c
    WHERE c.id = ai_messages.conversation_id
      AND c.is_shared = true
      AND c.share_token IS NOT NULL
  )
);