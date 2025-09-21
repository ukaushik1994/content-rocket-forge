-- Fix the update_proposal_status trigger function to handle different table contexts properly
CREATE OR REPLACE FUNCTION public.update_proposal_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  -- Only check metadata field when operating on content_items table
  IF TG_TABLE_NAME = 'content_items' AND TG_OP = 'INSERT' AND NEW.metadata IS NOT NULL AND NEW.metadata->>'proposal_id' IS NOT NULL THEN
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
$function$;