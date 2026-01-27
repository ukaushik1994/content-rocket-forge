-- ai_message_reactions table for persistent emoji reactions
CREATE TABLE public.ai_message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.ai_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id, reaction)
);

-- Enable RLS
ALTER TABLE public.ai_message_reactions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own reactions
CREATE POLICY "Users can insert their own reactions" ON public.ai_message_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON public.ai_message_reactions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all reactions" ON public.ai_message_reactions
  FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX idx_ai_message_reactions_message ON public.ai_message_reactions(message_id);
CREATE INDEX idx_ai_message_reactions_user ON public.ai_message_reactions(user_id);