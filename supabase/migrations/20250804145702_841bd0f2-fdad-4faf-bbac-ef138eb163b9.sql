-- Fix all functions with mutable search paths
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = user_id;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role = 'admin' FROM public.profiles WHERE id = user_id;
$function$;

CREATE OR REPLACE FUNCTION public.handle_content_submission()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- If status changed to pending_review, create approval record
  IF NEW.approval_status = 'pending_review' AND OLD.approval_status != 'pending_review' THEN
    INSERT INTO public.content_approvals (content_id, reviewer_id, status)
    VALUES (NEW.id, NEW.user_id, 'pending_review');
    
    NEW.submitted_for_review_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_approval_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert into approval history when status changes
  IF OLD.approval_status IS DISTINCT FROM NEW.approval_status THEN
    INSERT INTO approval_history (
      content_id,
      user_id,
      action,
      from_status,
      to_status,
      notes
    ) VALUES (
      NEW.id,
      auth.uid(),
      CASE 
        WHEN NEW.approval_status = 'pending_review' THEN 'submitted_for_review'
        WHEN NEW.approval_status = 'approved' THEN 'approved'
        WHEN NEW.approval_status = 'rejected' THEN 'rejected'
        WHEN NEW.approval_status = 'needs_changes' THEN 'requested_changes'
        ELSE 'status_changed'
      END,
      OLD.approval_status,
      NEW.approval_status,
      'Status changed via approval workflow'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.ai_conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.migrate_repurposed_content()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  content_record RECORD;
  format_id TEXT;
  format_content TEXT;
BEGIN
  FOR content_record IN 
    SELECT 
      id, 
      user_id, 
      title,
      metadata 
    FROM public.content_items 
    WHERE metadata->>'repurposedContentMap' IS NOT NULL
  LOOP
    FOR format_id, format_content IN 
      SELECT * FROM jsonb_each_text(content_record.metadata->'repurposedContentMap')
    LOOP
      -- Check if this repurposed content already exists
      IF NOT EXISTS (
        SELECT 1 FROM public.repurposed_contents 
        WHERE content_id = content_record.id AND format_code = format_id
      ) THEN
        -- Insert the repurposed content
        INSERT INTO public.repurposed_contents (
          content_id, 
          format_code, 
          content, 
          title, 
          user_id, 
          status
        ) VALUES (
          content_record.id,
          format_id,
          format_content,
          content_record.title || ' - ' || (SELECT name FROM public.content_formats WHERE format_code = format_id),
          content_record.user_id,
          'saved'
        );
      END IF;
    END LOOP;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.clean_expired_serp_cache()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.raw_serp_data WHERE expires_at < now();
END;
$function$;