-- Create glossaries table
CREATE TABLE IF NOT EXISTS public.glossaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  domain_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create glossary terms table
CREATE TABLE IF NOT EXISTS public.glossary_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  glossary_id UUID NOT NULL REFERENCES public.glossaries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  short_definition TEXT,
  expanded_explanation TEXT,
  search_volume INTEGER,
  keyword_difficulty INTEGER,
  related_terms TEXT[] DEFAULT '{}',
  paa_questions JSONB DEFAULT '[]',
  internal_links JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'needs_review')),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.glossaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

-- Create policies for glossaries
CREATE POLICY "Users can view their own glossaries" 
ON public.glossaries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own glossaries" 
ON public.glossaries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own glossaries" 
ON public.glossaries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own glossaries" 
ON public.glossaries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for glossary terms
CREATE POLICY "Users can view their own glossary terms" 
ON public.glossary_terms 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own glossary terms" 
ON public.glossary_terms 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own glossary terms" 
ON public.glossary_terms 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own glossary terms" 
ON public.glossary_terms 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_glossary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_glossaries_updated_at
BEFORE UPDATE ON public.glossaries
FOR EACH ROW
EXECUTE FUNCTION public.update_glossary_updated_at();

CREATE TRIGGER update_glossary_terms_updated_at
BEFORE UPDATE ON public.glossary_terms
FOR EACH ROW
EXECUTE FUNCTION public.update_glossary_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_glossaries_user_id ON public.glossaries(user_id);
CREATE INDEX idx_glossaries_is_active ON public.glossaries(is_active);
CREATE INDEX idx_glossary_terms_glossary_id ON public.glossary_terms(glossary_id);
CREATE INDEX idx_glossary_terms_user_id ON public.glossary_terms(user_id);
CREATE INDEX idx_glossary_terms_status ON public.glossary_terms(status);