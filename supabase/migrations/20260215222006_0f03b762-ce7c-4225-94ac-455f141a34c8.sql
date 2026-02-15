
-- Fix evaluate_segment to actually evaluate rules server-side
CREATE OR REPLACE FUNCTION public.evaluate_segment(p_segment_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_workspace_id uuid;
  v_definition jsonb;
  v_rules jsonb;
  v_match text;
  v_sql text;
  v_where_clauses text[];
  v_rule jsonb;
  v_field text;
  v_operator text;
  v_value text;
  v_clause text;
  v_count integer := 0;
BEGIN
  SELECT workspace_id, definition INTO v_workspace_id, v_definition
  FROM public.engage_segments WHERE id = p_segment_id;

  IF v_workspace_id IS NULL THEN RETURN 0; END IF;

  v_rules := COALESCE(v_definition->'rules', '[]'::jsonb);
  v_match := COALESCE(v_definition->>'match', 'all');

  -- Clear old memberships
  DELETE FROM public.engage_segment_memberships WHERE segment_id = p_segment_id;

  -- Build WHERE clauses from rules
  v_where_clauses := ARRAY[]::text[];

  FOR v_rule IN SELECT * FROM jsonb_array_elements(v_rules)
  LOOP
    v_field := v_rule->>'field';
    v_operator := v_rule->>'operator';
    v_value := v_rule->>'value';

    IF v_field IS NULL OR v_operator IS NULL OR v_value IS NULL THEN
      CONTINUE;
    END IF;

    v_clause := NULL;

    -- Handle different field/operator combinations
    IF v_field IN ('email', 'first_name', 'last_name') THEN
      CASE v_operator
        WHEN 'equals' THEN v_clause := format('%I = %L', v_field, v_value);
        WHEN 'not_equals' THEN v_clause := format('%I != %L', v_field, v_value);
        WHEN 'contains' THEN v_clause := format('%I ILIKE %L', v_field, '%' || v_value || '%');
        WHEN 'not_contains' THEN v_clause := format('%I NOT ILIKE %L', v_field, '%' || v_value || '%');
        WHEN 'starts_with' THEN v_clause := format('%I ILIKE %L', v_field, v_value || '%');
        WHEN 'ends_with' THEN v_clause := format('%I ILIKE %L', v_field, '%' || v_value);
        WHEN 'is_empty' THEN v_clause := format('(%I IS NULL OR %I = '''')', v_field, v_field);
        WHEN 'is_not_empty' THEN v_clause := format('(%I IS NOT NULL AND %I != '''')', v_field, v_field);
        ELSE NULL;
      END CASE;
    ELSIF v_field = 'tags' THEN
      CASE v_operator
        WHEN 'includes', 'contains' THEN v_clause := format('tags @> ARRAY[%L]::text[]', v_value);
        WHEN 'not_includes', 'not_contains' THEN v_clause := format('NOT (tags @> ARRAY[%L]::text[])', v_value);
        WHEN 'is_empty' THEN v_clause := '(tags IS NULL OR array_length(tags, 1) IS NULL)';
        WHEN 'is_not_empty' THEN v_clause := '(tags IS NOT NULL AND array_length(tags, 1) > 0)';
        ELSE NULL;
      END CASE;
    ELSIF v_field = 'created_at' THEN
      CASE v_operator
        WHEN 'gt', 'after' THEN v_clause := format('created_at > %L::timestamptz', v_value);
        WHEN 'lt', 'before' THEN v_clause := format('created_at < %L::timestamptz', v_value);
        WHEN 'equals' THEN v_clause := format('created_at::date = %L::date', v_value);
        ELSE NULL;
      END CASE;
    ELSIF v_field = 'unsubscribed' THEN
      CASE v_operator
        WHEN 'equals' THEN v_clause := format('unsubscribed = %L::boolean', v_value);
        ELSE NULL;
      END CASE;
    END IF;

    IF v_clause IS NOT NULL THEN
      v_where_clauses := array_append(v_where_clauses, v_clause);
    END IF;
  END LOOP;

  -- Build and execute the dynamic query
  v_sql := format(
    'INSERT INTO public.engage_segment_memberships (workspace_id, segment_id, contact_id, computed_at) '
    'SELECT %L, %L, id, now() FROM public.engage_contacts WHERE workspace_id = %L AND unsubscribed = false',
    v_workspace_id, p_segment_id, v_workspace_id
  );

  IF array_length(v_where_clauses, 1) > 0 THEN
    IF v_match = 'any' THEN
      v_sql := v_sql || ' AND (' || array_to_string(v_where_clauses, ' OR ') || ')';
    ELSE
      v_sql := v_sql || ' AND ' || array_to_string(v_where_clauses, ' AND ');
    END IF;
  END IF;

  EXECUTE v_sql;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$;

-- Create social-media storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('social-media', 'social-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read policy for social-media bucket
CREATE POLICY "Social media files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'social-media');

-- Authenticated users can upload to social-media bucket
CREATE POLICY "Authenticated users can upload social media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'social-media' AND auth.role() = 'authenticated');

-- Users can delete their own social media uploads
CREATE POLICY "Users can delete own social media files"
ON storage.objects FOR DELETE
USING (bucket_id = 'social-media' AND auth.uid()::text = (storage.foldername(name))[1]);
