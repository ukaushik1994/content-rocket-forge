-- SECURITY FIX: Prevent encrypted API keys from being exposed to clients
-- Create a secure view that excludes the encrypted_key column

-- Step 1: Create a public view that hides the encrypted_key column
CREATE OR REPLACE VIEW public.api_keys_metadata
WITH (security_invoker=on) AS
  SELECT 
    id,
    user_id,
    service,
    is_active,
    created_at,
    updated_at
  FROM public.api_keys;

-- Step 2: Drop the existing SELECT policy on api_keys
DROP POLICY IF EXISTS "Users can view their own API keys" ON public.api_keys;

-- Step 3: Create a new restrictive SELECT policy that DENIES direct access
-- The encrypted_key column should only be accessed via edge functions with service role
CREATE POLICY "No direct SELECT access to api_keys"
  ON public.api_keys
  FOR SELECT
  USING (false);

-- Step 4: Grant SELECT on the view to authenticated users (RLS on base table still applies)
GRANT SELECT ON public.api_keys_metadata TO authenticated;

-- Note: INSERT, UPDATE, DELETE policies remain unchanged - users can still manage their own keys
-- The secure-api-key edge function uses service role to bypass RLS for actual key retrieval