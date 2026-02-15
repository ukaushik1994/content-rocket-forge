
-- Fix overly permissive policy on social_saved_replies
DROP POLICY IF EXISTS "Users can manage saved replies" ON public.social_saved_replies;

CREATE POLICY "Users can insert saved replies"
  ON public.social_saved_replies FOR INSERT
  WITH CHECK (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

CREATE POLICY "Users can update saved replies"
  ON public.social_saved_replies FOR UPDATE
  USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

CREATE POLICY "Users can delete saved replies"
  ON public.social_saved_replies FOR DELETE
  USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));
