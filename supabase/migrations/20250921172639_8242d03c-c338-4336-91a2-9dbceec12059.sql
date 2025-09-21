-- Create table to store user instructions for AI content generation
CREATE TABLE public.user_content_instructions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NULL, -- Optional link to specific content
  instruction_text TEXT NOT NULL,
  use_case TEXT NOT NULL DEFAULT 'content_generation', -- 'content_generation', 'inline_editing', etc.
  format_type TEXT NULL, -- 'blog', 'social-twitter', etc.
  session_id TEXT NULL, -- For grouping related instructions
  applied_count INTEGER NOT NULL DEFAULT 0, -- How many times this instruction was used
  effectiveness_score NUMERIC NULL, -- Future: track how effective instructions are
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_content_instructions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own content instructions" 
ON public.user_content_instructions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content instructions" 
ON public.user_content_instructions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content instructions" 
ON public.user_content_instructions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content instructions" 
ON public.user_content_instructions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE TRIGGER update_user_content_instructions_updated_at
BEFORE UPDATE ON public.user_content_instructions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_content_instructions_user_id ON public.user_content_instructions(user_id);
CREATE INDEX idx_user_content_instructions_use_case ON public.user_content_instructions(use_case);
CREATE INDEX idx_user_content_instructions_format_type ON public.user_content_instructions(format_type);
CREATE INDEX idx_user_content_instructions_created_at ON public.user_content_instructions(created_at DESC);