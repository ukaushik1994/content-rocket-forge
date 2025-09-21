-- Force refresh the update_proposal_status trigger function with comprehensive error handling
-- Drop the existing function completely to ensure clean recreation
DROP FUNCTION IF EXISTS public.update_proposal_status() CASCADE;

-- Recreate the function with bulletproof NULL checks and error handling
CREATE OR REPLACE FUNCTION public.update_proposal_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Add logging to help debug which condition is being triggered
  RAISE LOG 'update_proposal_status triggered: table=%, operation=%', TG_TABLE_NAME, TG_OP;
  
  -- When a calendar item is created with a proposal_id, mark proposal as scheduled
  IF TG_TABLE_NAME = 'content_calendar' AND TG_OP = 'INSERT' THEN
    IF NEW.proposal_id IS NOT NULL THEN
      RAISE LOG 'Scheduling proposal: %', NEW.proposal_id;
      UPDATE public.ai_strategy_proposals 
      SET 
        status = 'scheduled',
        scheduled_at = now(),
        updated_at = now()
      WHERE id = NEW.proposal_id;
    END IF;
  END IF;
  
  -- When a calendar item with proposal_id is deleted, restore proposal to available
  IF TG_TABLE_NAME = 'content_calendar' AND TG_OP = 'DELETE' THEN
    IF OLD.proposal_id IS NOT NULL THEN
      RAISE LOG 'Restoring proposal to available: %', OLD.proposal_id;
      UPDATE public.ai_strategy_proposals 
      SET 
        status = 'available',
        scheduled_at = NULL,
        updated_at = now()
      WHERE id = OLD.proposal_id;
    END IF;
  END IF;
  
  -- When content is created from a proposal, mark proposal as completed
  -- CRITICAL: Only check metadata field when operating on content_items table AND metadata exists
  IF TG_TABLE_NAME = 'content_items' AND TG_OP = 'INSERT' THEN
    -- Check if NEW record has metadata column AND it's not NULL AND contains proposal_id
    IF NEW.metadata IS NOT NULL AND (NEW.metadata ? 'proposal_id') AND NEW.metadata->>'proposal_id' IS NOT NULL THEN
      RAISE LOG 'Completing proposal from content: %', NEW.metadata->>'proposal_id';
      UPDATE public.ai_strategy_proposals 
      SET 
        status = 'completed',
        completed_at = now(),
        updated_at = now()
      WHERE id = (NEW.metadata->>'proposal_id')::uuid;
    END IF;
  END IF;

  -- Return appropriate record based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$;

-- Recreate all triggers to ensure they use the new function
DROP TRIGGER IF EXISTS update_proposal_status_trigger ON public.content_calendar;
DROP TRIGGER IF EXISTS update_proposal_status_content_trigger ON public.content_items;

-- Create triggers for both tables
CREATE TRIGGER update_proposal_status_trigger
  AFTER INSERT OR DELETE ON public.content_calendar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_proposal_status();

CREATE TRIGGER update_proposal_status_content_trigger
  AFTER INSERT ON public.content_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_proposal_status();