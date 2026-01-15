-- Fix permissive RLS policies on proposal_lifecycle_logs
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can create their own proposal lifecycle logs" ON proposal_lifecycle_logs;
DROP POLICY IF EXISTS "Users can view proposal lifecycle logs" ON proposal_lifecycle_logs;
DROP POLICY IF EXISTS "Users can update their own proposal lifecycle logs" ON proposal_lifecycle_logs;

-- Create properly scoped policies based on updated_by field
-- Users can only insert logs where they are the updater
CREATE POLICY "Users can insert their own proposal lifecycle logs"
ON proposal_lifecycle_logs FOR INSERT
TO authenticated
WITH CHECK (updated_by = auth.uid()::text);

-- Users can only view logs where they are the updater
CREATE POLICY "Users can view their own proposal lifecycle logs"
ON proposal_lifecycle_logs FOR SELECT
TO authenticated
USING (updated_by = auth.uid()::text);

-- Users can only update logs where they are the updater
CREATE POLICY "Users can update their own proposal lifecycle logs"
ON proposal_lifecycle_logs FOR UPDATE
TO authenticated
USING (updated_by = auth.uid()::text)
WITH CHECK (updated_by = auth.uid()::text);