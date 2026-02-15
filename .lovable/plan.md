

# Fix All Auto-Extraction: Use User's AI Provider Everywhere

## Root Cause Summary

Three critical issues are breaking extraction:

1. **`solution-intel` crashes on boot** -- duplicate `const supabase` declaration at line 80 (already declared at line 47). The function literally cannot start.

2. **`solution-intel` calls `enhanced-ai-chat`** instead of `ai-proxy` -- wrong pattern. It should fetch the user's AI provider from `ai_service_providers` and call `ai-proxy` directly (like `competitor-intel` does correctly).

3. **`company-intel` and `brand-intel` use Lovable AI Gateway** (`ai.gateway.lovable.dev` with `LOVABLE_API_KEY`) instead of the user's configured AI provider. You want all functions to use the same AI service you configured in Settings.

4. **`company-intel` URL filter is too strict** -- only accepts URLs containing `/about`, `/company`, `/our-story`, `/mission`, `/team`. Rejects the homepage itself, so if SERP returns `https://example.com`, it gets filtered out.

5. **Missing `SERP_API_KEY` secret** -- needs to be added so SERP discovery works across all three functions.

## The Fix

### Pattern to Follow (from `competitor-intel`)

All three edge functions will be updated to:
1. Get user's active AI provider from `ai_service_providers` table
2. Call `ai-proxy` with `{service, endpoint, apiKey, params}` format
3. Parse response as `aiProxyResult.data.choices[0].message.content`

This is the exact pattern `competitor-intel` already uses successfully.

---

### Step 0: Add SERP_API_KEY Secret
- Request user's SerpAPI key via the add_secret tool

### Step 1: Fix `solution-intel/index.ts` (3 changes)

**Change A -- Remove duplicate client (line 80)**
Delete `const supabase = createClient(supabaseUrl, supabaseServiceKey);` since line 47 already creates one.

**Change B -- Fix `detectProducts` function (lines 447-481)**
- Remove duplicate `createClient` call at line 448
- Replace `supabase.functions.invoke('enhanced-ai-chat', ...)` with the correct pattern:
  1. Fetch user's provider from `ai_service_providers` (using userId passed in)
  2. Call `supabase.functions.invoke('ai-proxy', { body: { service, endpoint: 'chat', apiKey, params: { model, messages, temperature } } })`
  3. Parse response as `aiProxyResult.data.choices[0].message.content`

**Change C -- Fix `extractProductDetails` function (lines 697-808)**
- Same fix as Change B: remove duplicate client, replace `enhanced-ai-chat` with `ai-proxy` using user's provider

### Step 2: Fix `company-intel/index.ts` (2 changes)

**Change A -- Use user's AI provider instead of Lovable Gateway (lines 250-265)**
- Add provider lookup from `ai_service_providers` table (same as competitor-intel)
- Replace `fetch("https://ai.gateway.lovable.dev/v1/chat/completions", ...)` with `supabase.functions.invoke('ai-proxy', ...)`
- Use user's configured provider, model, and API key

**Change B -- Fix URL discovery filter (lines 154-167)**
- Always include the homepage URL (the website parameter itself)
- Broaden SERP queries to include `site:{domain}` (general search)
- Remove the strict filter that rejects URLs not containing `/about`, `/company`, etc.
- Accept any URL on the same domain

### Step 3: Fix `brand-intel/index.ts` (1 change)

**Change A -- Use user's AI provider instead of Lovable Gateway (lines 288-303)**
- Add provider lookup from `ai_service_providers` table
- Replace `fetch("https://ai.gateway.lovable.dev/v1/chat/completions", ...)` with `supabase.functions.invoke('ai-proxy', ...)`
- Use user's configured provider, model, and API key

### Step 4: Redeploy all three edge functions

---

## Files Modified

| File | What Changes |
|------|-------------|
| `supabase/functions/solution-intel/index.ts` | Remove 2 duplicate `createClient` calls; replace 2 `enhanced-ai-chat` invocations with `ai-proxy` using user's provider |
| `supabase/functions/company-intel/index.ts` | Replace Lovable Gateway AI call with `ai-proxy`; fix URL discovery to include homepage and broaden filter |
| `supabase/functions/brand-intel/index.ts` | Replace Lovable Gateway AI call with `ai-proxy` using user's provider |

## Secret to Add
- `SERP_API_KEY` -- user's SerpAPI key

## No Database Changes Required

## AI Provider Pattern (applied to all 3 functions)

```text
// 1. Fetch user's active provider
const { data: provider } = await supabase
  .from('ai_service_providers')
  .select('provider, api_key, preferred_model, status')
  .eq('user_id', userId)
  .eq('status', 'active')
  .order('priority', { ascending: true })
  .limit(1)
  .single();

// 2. Call ai-proxy with user's credentials
const { data: aiResult } = await supabase.functions.invoke('ai-proxy', {
  body: {
    service: provider.provider,
    endpoint: 'chat',
    apiKey: provider.api_key,
    params: {
      model: provider.preferred_model,
      messages: [...],
      temperature: 0.3,
      max_tokens: 4000
    }
  }
});

// 3. Parse response
const content = aiResult.data.choices[0].message.content;
```

