
-- Create content_analytics table to store analytics data
CREATE TABLE IF NOT EXISTS public.content_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  published_url TEXT NOT NULL,
  analytics_data JSONB,
  search_console_data JSONB,
  last_fetched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(content_id)
);

-- Enable RLS
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for content analytics
CREATE POLICY "Users can view analytics for their content" 
  ON public.content_analytics 
  FOR SELECT 
  USING (
    content_id IN (
      SELECT id FROM public.content_items WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analytics for their content" 
  ON public.content_analytics 
  FOR INSERT 
  WITH CHECK (
    content_id IN (
      SELECT id FROM public.content_items WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update analytics for their content" 
  ON public.content_analytics 
  FOR UPDATE 
  USING (
    content_id IN (
      SELECT id FROM public.content_items WHERE user_id = auth.uid()
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER handle_content_analytics_updated_at
  BEFORE UPDATE ON public.content_analytics
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
