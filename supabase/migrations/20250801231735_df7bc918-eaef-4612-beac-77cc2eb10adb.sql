-- Create glossaries table
CREATE TABLE public.glossaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  domain_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create glossary_terms table
CREATE TABLE public.glossary_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  glossary_id UUID NOT NULL,
  user_id UUID NOT NULL,
  term TEXT NOT NULL,
  short_definition TEXT,
  expanded_explanation TEXT,
  search_volume INTEGER,
  keyword_difficulty INTEGER,
  related_terms JSONB DEFAULT '[]'::jsonb,
  paa_questions JSONB DEFAULT '[]'::jsonb,
  internal_links JSONB DEFAULT '[]'::jsonb,
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

-- Create policies for glossary_terms
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

-- Create trigger for updated_at on glossaries
CREATE TRIGGER update_glossaries_updated_at
BEFORE UPDATE ON public.glossaries
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

-- Create foreign key constraint
ALTER TABLE public.glossary_terms
ADD CONSTRAINT glossary_terms_glossary_id_fkey
FOREIGN KEY (glossary_id) REFERENCES public.glossaries(id) ON DELETE CASCADE;