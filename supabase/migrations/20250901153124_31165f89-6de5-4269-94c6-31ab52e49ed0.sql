-- Create solution_personas table for storing persona data
CREATE TABLE public.solution_personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID NOT NULL,
  persona_category TEXT NOT NULL CHECK (persona_category IN ('end_user', 'decision_maker', 'influencer')),
  persona_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  typical_goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferred_tone TEXT NOT NULL,
  key_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for efficient queries
CREATE INDEX idx_solution_personas_solution_id ON public.solution_personas(solution_id);
CREATE INDEX idx_solution_personas_category ON public.solution_personas(persona_category);
CREATE INDEX idx_solution_personas_user_id ON public.solution_personas(user_id);

-- Enable Row Level Security
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

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_solution_personas_updated_at
BEFORE UPDATE ON public.solution_personas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add solution_id column to content_items table for better content-solution relationship
ALTER TABLE public.content_items 
ADD COLUMN solution_id UUID REFERENCES public.solutions(id);

-- Create index for content_items solution_id
CREATE INDEX idx_content_items_solution_id ON public.content_items(solution_id);