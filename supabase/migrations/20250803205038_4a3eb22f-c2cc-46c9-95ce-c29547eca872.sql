-- Create company_competitors table
CREATE TABLE public.company_competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  resources JSONB DEFAULT '[]'::jsonb,
  market_position TEXT,
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  priority_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_competitors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own competitors" 
ON public.company_competitors 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own competitors" 
ON public.company_competitors 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competitors" 
ON public.company_competitors 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own competitors" 
ON public.company_competitors 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_company_competitors_updated_at
BEFORE UPDATE ON public.company_competitors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();