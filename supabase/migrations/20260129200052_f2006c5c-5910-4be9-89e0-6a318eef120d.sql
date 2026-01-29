-- Add pending_optimizations_count column to content_items for efficient badge display
ALTER TABLE public.content_items 
ADD COLUMN IF NOT EXISTS pending_optimizations_count INTEGER DEFAULT 0;

-- Add user_id column to content_optimization_history to support RLS
ALTER TABLE public.content_optimization_history 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for efficient querying of pending optimizations
CREATE INDEX IF NOT EXISTS idx_content_optimization_history_pending 
ON public.content_optimization_history(content_id, status) 
WHERE status = 'pending_review';

-- Enable RLS on content_optimization_history if not already enabled
ALTER TABLE public.content_optimization_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for content_optimization_history
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own optimization history" ON public.content_optimization_history;
  DROP POLICY IF EXISTS "Users can update their own optimization history" ON public.content_optimization_history;
  DROP POLICY IF EXISTS "Users can insert optimization history" ON public.content_optimization_history;
END $$;

CREATE POLICY "Users can view their own optimization history" 
ON public.content_optimization_history 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.content_items 
    WHERE content_items.id = content_optimization_history.content_id 
    AND content_items.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own optimization history" 
ON public.content_optimization_history 
FOR UPDATE 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.content_items 
    WHERE content_items.id = content_optimization_history.content_id 
    AND content_items.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert optimization history" 
ON public.content_optimization_history 
FOR INSERT 
WITH CHECK (true);

-- Function to update pending_optimizations_count when optimization history changes
CREATE OR REPLACE FUNCTION public.update_pending_optimizations_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the count for the affected content item
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE content_items 
    SET pending_optimizations_count = (
      SELECT COUNT(*) 
      FROM content_optimization_history 
      WHERE content_id = NEW.content_id 
      AND status = 'pending_review'
    )
    WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE content_items 
    SET pending_optimizations_count = (
      SELECT COUNT(*) 
      FROM content_optimization_history 
      WHERE content_id = OLD.content_id 
      AND status = 'pending_review'
    )
    WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger to automatically update pending_optimizations_count
DROP TRIGGER IF EXISTS update_pending_optimizations_count_trigger ON public.content_optimization_history;
CREATE TRIGGER update_pending_optimizations_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.content_optimization_history
FOR EACH ROW
EXECUTE FUNCTION public.update_pending_optimizations_count();