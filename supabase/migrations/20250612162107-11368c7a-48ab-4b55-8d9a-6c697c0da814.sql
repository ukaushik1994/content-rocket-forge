
-- Create table for AI conversations
CREATE TABLE public.ai_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for AI messages
CREATE TABLE public.ai_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('user', 'agent')),
  content text NOT NULL,
  function_calls jsonb DEFAULT NULL,
  attachments jsonb DEFAULT NULL,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('sending', 'processing', 'completed', 'error')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their own conversations" 
  ON public.ai_conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
  ON public.ai_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
  ON public.ai_conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
  ON public.ai_conversations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for messages
CREATE POLICY "Users can view messages from their conversations" 
  ON public.ai_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations 
      WHERE id = ai_messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations" 
  ON public.ai_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations 
      WHERE id = ai_messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their conversations" 
  ON public.ai_messages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations 
      WHERE id = ai_messages.conversation_id AND user_id = auth.uid()
    )
  );

-- Add indexes for performance
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created_at ON public.ai_messages(created_at);

-- Trigger to update conversation updated_at when new message is added
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ai_conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message_insert
  AFTER INSERT ON public.ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();
