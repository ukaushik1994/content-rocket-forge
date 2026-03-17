

# Fix: Web Search Using User's SERP API Key from Settings

## Root Causes

1. **`executeWebSearch` ignores the user's SERP key.** It calls `api-proxy` without an `apiKey` field, so `api-proxy` falls back to the env secret `SERP_API_KEY` — which doesn't exist. The user's key (saved via Settings, encrypted in the `api_keys` table) is never decrypted or passed along.

2. **`[web-search]` prefix not handled.** The frontend prepends `[web-search]` to queries when the user activates Web Search mode. The backend never detects or strips this prefix, so it gets fed raw into `analyzeSerpIntent()` which may not match its regex patterns.

---

## Fix (2 files, 1 deploy)

### File 1: `supabase/functions/enhanced-ai-chat/serp-intelligence.ts`
- Update `executeWebSearch` signature to accept an optional `apiKey` parameter
- Pass `apiKey` in the `api-proxy` request body so the proxy uses it instead of the missing env secret

### File 2: `supabase/functions/enhanced-ai-chat/index.ts`

**A) Detect and strip `[web-search]` prefix (~line 1849)**
- After extracting `userQuery`, check for `[web-search]` prefix
- If found: strip it, set a `forceWebSearch = true` flag

**B) Decrypt user's SERP key before calling executeWebSearch (~line 2159)**
- Import `getApiKey` from `../shared/apiKeyService.ts`
- Call `getApiKey('serp', userId)` to get the decrypted key
- If no key found, try `getApiKey('serpstack', userId)` as fallback

**C) Force web search when prefix detected (~line 2154)**
- If `forceWebSearch` is true, skip `analyzeSerpIntent` and go directly to the web search path with the decrypted key
- Pass the decrypted key to `executeWebSearch(query, 'us', serpApiKey)`

**D) Add user feedback on failure (~line 2170)**
- If web search returns 0 results or no SERP key is found, append a note to the AI context: "Web search was requested but unavailable — configure a SERP API key in Settings."

### Deploy
Single redeploy of `enhanced-ai-chat` (which bundles `serp-intelligence.ts`).

---

## Flow After Fix

```text
User types "[web-search] latest AI trends"
  → Backend strips prefix, sets forceWebSearch=true
  → Decrypts user's SERP key from api_keys table
  → Calls executeWebSearch("latest AI trends", "us", decryptedKey)
  → api-proxy receives apiKey in body, uses it for SerpAPI call
  → Results injected into LLM context
```

