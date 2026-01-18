-- Fix: Remove public access policies from competitor_cache table
-- This table should only be accessible via service role (edge functions)

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can view competitor cache" ON public.competitor_cache;
DROP POLICY IF EXISTS "Authenticated users can read competitor_cache" ON public.competitor_cache;

-- Keep the service role policy (already exists) for edge function access
-- The "Service role can manage cache" policy is correct and remains

-- Add a comment documenting the security decision
COMMENT ON TABLE public.competitor_cache IS 'System cache for competitor data. Access restricted to service role only for security - prevents exposure of competitive analysis methodology.';