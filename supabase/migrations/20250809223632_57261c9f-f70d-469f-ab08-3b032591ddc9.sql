-- Allow reviewers (assigned) to manage analyses for a content item
-- and allow content owners to update/view as well, enabling a single shared analysis per content

-- SELECT: reviewers assigned via content_approvals or content_items.reviewer_id can view
CREATE POLICY "Reviewers can view analyses for assigned content"
ON public.content_ai_analyses
FOR SELECT
USING (
  (content_id IN (
    SELECT ca.content_id FROM public.content_approvals ca
    WHERE ca.reviewer_id = auth.uid()
  ))
  OR (content_id IN (
    SELECT ci.id FROM public.content_items ci
    WHERE ci.reviewer_id = auth.uid()
  ))
);

-- UPDATE: content owners can update analyses for their content
CREATE POLICY "Owners can update analyses for their content"
ON public.content_ai_analyses
FOR UPDATE
USING (
  content_id IN (
    SELECT ci.id FROM public.content_items ci
    WHERE ci.user_id = auth.uid()
  )
);

-- UPDATE: reviewers assigned can also update
CREATE POLICY "Reviewers can update analyses for assigned content"
ON public.content_ai_analyses
FOR UPDATE
USING (
  (content_id IN (
    SELECT ca.content_id FROM public.content_approvals ca
    WHERE ca.reviewer_id = auth.uid()
  ))
  OR (content_id IN (
    SELECT ci.id FROM public.content_items ci
    WHERE ci.reviewer_id = auth.uid()
  ))
);

-- INSERT: reviewers assigned (or owners) can insert an analysis row, with user_id = current user
CREATE POLICY "Reviewers can insert analyses for assigned content"
ON public.content_ai_analyses
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND (
    (content_id IN (
      SELECT ca.content_id FROM public.content_approvals ca
      WHERE ca.reviewer_id = auth.uid()
    ))
    OR (content_id IN (
      SELECT ci.id FROM public.content_items ci
      WHERE ci.reviewer_id = auth.uid()
    ))
    OR (content_id IN (
      SELECT ci.id FROM public.content_items ci
      WHERE ci.user_id = auth.uid()
    ))
  )
);
