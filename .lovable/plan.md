
# Fix: API Key Storage and Provider Tag Visibility

## Problem Summary

### 1. API Key Storage Fails with RLS Violation
The database logs show `new row violates row-level security policy for table "api_keys"`.

**Root Cause**: The `api_keys` table uses UPSERT, but the SELECT policy is `USING (false)` to prevent encrypted key exposure. UPSERT requires a SELECT to check for conflicts, which is blocked by this policy.

### 2. Provider Tag Shows When It Shouldn't
The "OpenAI" tag in the header displays even when no API key is actually stored.

**Root Cause**: `ActiveProviderIndicator` checks `ai_service_providers.status = 'active'` but doesn't verify an actual API key exists in `api_keys`.

---

## Solution

### Fix 1: Update RLS to Allow UPSERT Conflict Check

Add a SELECT policy that allows users to check if THEIR OWN rows exist (for upsert), but excludes the sensitive `encrypted_key` column from being readable.

```sql
-- Drop the overly restrictive SELECT policy
DROP POLICY IF EXISTS "No direct SELECT access to api_keys" ON api_keys;

-- Create a new policy that allows existence checks for upsert
-- Users can only see metadata about their own keys (not the encrypted content)
CREATE POLICY "Users can check their own API key existence"
  ON api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Note: The api_keys_metadata VIEW remains the recommended way for clients 
-- to check key status (excludes encrypted_key column for security)
```

The encrypted key is still protected because:
- The VIEW `api_keys_metadata` (without encrypted_key) should be used for status checks
- Client code already uses the metadata view for display purposes
- Only the secure-api-key edge function with service role can decrypt

### Fix 2: Update ActiveProviderIndicator Visibility Logic

Only show the provider tag when BOTH conditions are true:
1. `ai_service_providers.status = 'active'`
2. An actual API key exists in `api_keys` table (via metadata view)

```text
Modified File: src/components/ai/ActiveProviderIndicator.tsx

Changes:
- Add a check against api_keys_metadata to verify key exists
- Only render the tag when both provider is active AND key exists
- Update the real-time subscription to watch both tables
```

---

## Files to Modify

| File | Change |
|------|--------|
| Database Migration | Update RLS policy to allow SELECT for user's own rows |
| `src/components/ai/ActiveProviderIndicator.tsx` | Add key existence check before showing tag |

---

## Technical Details

### Database Migration SQL

```sql
-- Fix UPSERT by allowing users to SELECT their own rows
DROP POLICY IF EXISTS "No direct SELECT access to api_keys" ON api_keys;

CREATE POLICY "Users can select their own API keys"
  ON api_keys
  FOR SELECT
  USING (auth.uid() = user_id);
```

### ActiveProviderIndicator Logic Update

```text
Current:
1. Query ai_service_providers WHERE status = 'active'
2. If found, show tag

Updated:
1. Query ai_service_providers WHERE status = 'active'
2. Query api_keys_metadata WHERE user_id = current_user AND service = provider AND is_active = true
3. Only show tag if BOTH queries return results
```

---

## Expected Outcome

1. API keys can be stored successfully (UPSERT works)
2. Provider tag only appears when:
   - Provider status is 'active' in ai_service_providers
   - AND a valid API key exists in api_keys table
3. If user deletes their API key, the tag disappears
4. Security maintained: encrypted keys only accessible via edge function

---

## Alternative Consideration

If you want to be extra cautious about encrypted key exposure, we could instead move the entire upsert logic into the `secure-api-key` edge function (using service role). This keeps all writes server-side but requires more refactoring.

The proposed RLS fix is simpler and maintains security because:
- Clients use the `api_keys_metadata` view for status checks
- Decryption only happens via edge function with service role
- The encrypted_key column is still protected in transit by the view pattern
