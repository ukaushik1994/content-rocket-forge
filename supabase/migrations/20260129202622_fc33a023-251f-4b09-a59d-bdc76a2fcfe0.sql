-- Fix UPSERT by allowing users to SELECT their own rows
-- This enables the conflict check required for UPSERT operations
DROP POLICY IF EXISTS "No direct SELECT access to api_keys" ON api_keys;

CREATE POLICY "Users can select their own API keys"
  ON api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Note: The api_keys_metadata VIEW (without encrypted_key) remains the recommended
-- way for clients to check key status. Decryption only happens via edge function.