-- Create enum for persona types
CREATE TYPE public.persona_type AS ENUM ('end_user', 'decision_maker', 'influencer');

-- Create solution_personas table
CREATE TABLE public.solution_personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID NOT NULL,
  persona_type persona_type NOT NULL,
  persona_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  typical_goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferred_tone TEXT NOT NULL,
  key_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(solution_id, persona_type)
);

-- Enable RLS
ALTER TABLE public.solution_personas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own solution personas" 
ON public.solution_personas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own solution personas" 
ON public.solution_personas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own solution personas" 
ON public.solution_personas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own solution personas" 
ON public.solution_personas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_solution_personas_updated_at
BEFORE UPDATE ON public.solution_personas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();