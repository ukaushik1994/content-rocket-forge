-- Enhance the update_proposal_status trigger with better logging and error handling
CREATE OR REPLACE FUNCTION public.update_proposal_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Add logging to help debug which condition is being triggered
  RAISE LOG 'update_proposal_status triggered: table=%, operation=%, row=%', TG_TABLE_NAME, TG_OP, 
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END;
  
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
      
      -- Log the result
      IF FOUND THEN
        RAISE LOG 'Successfully scheduled proposal: %', NEW.proposal_id;
      ELSE
        RAISE WARNING 'Failed to schedule proposal - not found: %', NEW.proposal_id;
      END IF;
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
      
      -- Log the result
      IF FOUND THEN
        RAISE LOG 'Successfully restored proposal: %', OLD.proposal_id;
      ELSE
        RAISE WARNING 'Failed to restore proposal - not found: %', OLD.proposal_id;
      END IF;
    END IF;
  END IF;
  
  -- When content is created from a proposal, mark proposal as completed
  -- CRITICAL: Only check metadata field when operating on content_items table AND metadata exists
  IF TG_TABLE_NAME = 'content_items' AND TG_OP = 'INSERT' THEN
    -- Check if NEW record has metadata column AND it's not NULL AND contains proposal_id
    IF NEW.metadata IS NOT NULL THEN
      DECLARE
        proposal_id_text TEXT;
        proposal_id_uuid UUID;
      BEGIN
        -- Try to extract proposal_id from metadata (check both field names)
        proposal_id_text := COALESCE(
          NEW.metadata->>'proposal_id',
          NEW.metadata->>'source_proposal_id'
        );
        
        IF proposal_id_text IS NOT NULL THEN
          -- Convert to UUID and update proposal
          proposal_id_uuid := proposal_id_text::uuid;
          RAISE LOG 'Completing proposal from content: % (content_id: %)', proposal_id_uuid, NEW.id;
          
          UPDATE public.ai_strategy_proposals 
          SET 
            status = 'completed',
            completed_at = now(),
            updated_at = now()
          WHERE id = proposal_id_uuid;
          
          -- Log the result
          IF FOUND THEN
            RAISE LOG 'Successfully completed proposal: % from content: %', proposal_id_uuid, NEW.id;
          ELSE
            RAISE WARNING 'Failed to complete proposal - not found: % (content_id: %)', proposal_id_uuid, NEW.id;
          END IF;
        ELSE
          RAISE LOG 'No proposal_id found in content metadata for content_id: %', NEW.id;
        END IF;
      EXCEPTION
        WHEN invalid_text_representation THEN
          RAISE WARNING 'Invalid UUID format in proposal_id: % (content_id: %)', proposal_id_text, NEW.id;
        WHEN OTHERS THEN
          RAISE WARNING 'Error processing proposal completion: % (content_id: %)', SQLERRM, NEW.id;
      END;
    ELSE
      RAISE LOG 'No metadata found for content_id: %', NEW.id;
    END IF;
  END IF;

  -- Return appropriate record based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$;