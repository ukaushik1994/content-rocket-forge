-- Update create_campaign_atomic function to accept solution_id and objective
CREATE OR REPLACE FUNCTION create_campaign_atomic(
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_status TEXT,
  p_input JSONB,
  p_strategy JSONB,
  p_solution_id UUID DEFAULT NULL,
  p_objective TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_campaign_id UUID;
  v_result JSONB;
BEGIN
  -- Insert campaign with solution_id and objective
  INSERT INTO campaigns (
    user_id,
    name,
    original_idea,
    status,
    selected_strategy,
    solution_id,
    objective
  ) VALUES (
    p_user_id,
    p_title,
    p_description,
    p_status,
    p_strategy,
    p_solution_id,
    p_objective
  )
  RETURNING id INTO v_campaign_id;

  -- Initialize cost tracking (optional, can be removed if not needed)
  INSERT INTO campaign_costs (
    campaign_id,
    user_id,
    cost_type,
    amount,
    description
  ) VALUES (
    v_campaign_id,
    p_user_id,
    'setup',
    0,
    'Initial campaign setup'
  );

  -- Build result JSON
  v_result := jsonb_build_object(
    'id', v_campaign_id,
    'user_id', p_user_id,
    'name', p_title,
    'original_idea', p_description,
    'status', p_status,
    'selected_strategy', p_strategy,
    'solution_id', p_solution_id,
    'objective', p_objective,
    'created_at', NOW()
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Campaign creation failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;