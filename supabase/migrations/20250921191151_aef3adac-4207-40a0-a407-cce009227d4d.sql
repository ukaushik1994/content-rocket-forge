-- Phase 1: Add status management to AI Strategy Proposals

-- Add status field to ai_strategy_proposals table
ALTER TABLE public.ai_strategy_proposals 
ADD COLUMN status TEXT NOT NULL DEFAULT 'available';

-- Add check constraint for valid status values
ALTER TABLE public.ai_strategy_proposals 
ADD CONSTRAINT ai_strategy_proposals_status_check 
CHECK (status IN ('available', 'scheduled', 'in_progress', 'completed', 'archived'));

-- Add indexes for better performance on status queries
CREATE INDEX idx_ai_strategy_proposals_status ON public.ai_strategy_proposals(status);
CREATE INDEX idx_ai_strategy_proposals_user_status ON public.ai_strategy_proposals(user_id, status);

-- Add scheduled_at and completed_at timestamp fields for tracking
ALTER TABLE public.ai_strategy_proposals 
ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Function to automatically update proposal status based on calendar and content existence
CREATE OR REPLACE FUNCTION public.update_proposal_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When a calendar item is created with a proposal_id, mark proposal as scheduled
  IF TG_TABLE_NAME = 'content_calendar' AND TG_OP = 'INSERT' AND NEW.proposal_id IS NOT NULL THEN
    UPDATE public.ai_strategy_proposals 
    SET 
      status = 'scheduled',
      scheduled_at = now(),
      updated_at = now()
    WHERE id = NEW.proposal_id;
  END IF;
  
  -- When a calendar item with proposal_id is deleted, restore proposal to available
  IF TG_TABLE_NAME = 'content_calendar' AND TG_OP = 'DELETE' AND OLD.proposal_id IS NOT NULL THEN
    UPDATE public.ai_strategy_proposals 
    SET 
      status = 'available',
      scheduled_at = NULL,
      updated_at = now()
    WHERE id = OLD.proposal_id;
  END IF;
  
  -- When content is created from a proposal, mark proposal as completed
  IF TG_TABLE_NAME = 'content_items' AND TG_OP = 'INSERT' AND NEW.metadata->>'proposal_id' IS NOT NULL THEN
    UPDATE public.ai_strategy_proposals 
    SET 
      status = 'completed',
      completed_at = now(),
      updated_at = now()
    WHERE id = (NEW.metadata->>'proposal_id')::uuid;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic status updates
DROP TRIGGER IF EXISTS trigger_update_proposal_status_calendar ON public.content_calendar;
CREATE TRIGGER trigger_update_proposal_status_calendar
  AFTER INSERT OR DELETE ON public.content_calendar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_proposal_status();

DROP TRIGGER IF EXISTS trigger_update_proposal_status_content ON public.content_items;
CREATE TRIGGER trigger_update_proposal_status_content
  AFTER INSERT ON public.content_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_proposal_status();

-- Add proposal_id column to content_calendar if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'content_calendar' 
    AND column_name = 'proposal_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.content_calendar 
    ADD COLUMN proposal_id UUID REFERENCES public.ai_strategy_proposals(id) ON DELETE SET NULL;
    
    CREATE INDEX idx_content_calendar_proposal_id ON public.content_calendar(proposal_id);
  END IF;
END $$;