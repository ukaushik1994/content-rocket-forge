

# Fix: Delete stale `query-analyzer.ts` and force fresh deployment

## Root Cause
The `enhanced-ai-chat` edge function crashes because **the `query-analyzer.ts` file still exists on disk**. Even though `index.ts` no longer imports it, the Supabase edge runtime bundles all `.ts` files in the function directory. The old file uses `requiresVisualData` as a bare reference (line 186 in the old file maps to the regex array ending, where the variable name was previously used before being renamed to `visualDataRequired`).

The runtime stack trace confirms this: `at analyzeQueryIntent (file:///var/tmp/sb-compile-edge-runtime/enhanced-ai-chat/query-analyzer.ts:186:5)`.

## Supabase Connection Verification
All connection details are correct and consistent:
- Client URL, anon key, and project ID all match across `client.ts`, `.env`, and `config.toml`
- Database schema, functions, and RLS policies are accessible
- Runtime secret `LOVABLE_API_KEY` is configured

## Fix Steps

1. **Delete `supabase/functions/enhanced-ai-chat/query-analyzer.ts`** — This is the only required fix. The file is dead code that the runtime incorrectly bundles, causing the `ReferenceError`.

2. **Bump `DEPLOY_VERSION`** in `index.ts` to `v10` so we can confirm the new deployment is live by checking the response payload.

3. **Verify** by sending a test message in the AI chat and confirming:
   - No 500 error
   - Response includes `deployVersion: "enhanced-ai-chat-v10-..."`

## Why previous fixes didn't work
Every prior attempt renamed/fixed variables inside `index.ts`, but the runtime kept loading and executing the separate `query-analyzer.ts` file where `requiresVisualData` was still a bare `ReferenceError`. Deleting the file eliminates the problem at its source.

