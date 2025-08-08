
-- Add columns to store the selected solution alongside reuse history
ALTER TABLE public.content_reuse_history
  ADD COLUMN IF NOT EXISTS selected_solution_id text,
  ADD COLUMN IF NOT EXISTS selected_solution_name text;

-- Helpful index to query reuse by user and solution quickly
CREATE INDEX IF NOT EXISTS content_reuse_history_user_solution_idx
  ON public.content_reuse_history (user_id, selected_solution_id);
