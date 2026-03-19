
-- Phase 3a: Tighten shared conversation RLS
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Shared conversations accessible by token" ON public.ai_conversations;

-- No replacement SELECT policy needed for shared conversations - 
-- access is now via get_shared_conversation() SECURITY DEFINER RPC
