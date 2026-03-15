

# Phase 2: P1 Silent Failures — Implementation Plan

Six fixes for issues that fail silently without user-visible errors.

---

## 2a. Fix OpenRouter HTTP-Referer & X-Title
**File:** `supabase/functions/ai-proxy/index.ts` (lines 709-710)
- Change `'HTTP-Referer': 'https://localhost:5173'` → `'HTTP-Referer': 'https://creaiter.lovable.app'`
- Change `'X-Title': 'AI Content Creator'` → `'X-Title': 'Creaiter'`

## 2b. LM Studio — Return clear error from edge function
**File:** `supabase/functions/ai-proxy/index.ts`
- LM Studio runs on `localhost:1234` which is unreachable from Deno edge functions. Add an early return with a 400 error in the main serve handler when `service === 'lmstudio'`, explaining that LM Studio is only available for local development.

## 2c. Add webhook response validation
**File:** `src/services/marketingIntegrationHooks.ts`
- After all 7 `fetch()` calls (lines ~202, 227, 250, 279, 294, 404, 423), add `if (!response.ok) throw new Error(...)` checks so failures are surfaced rather than swallowed silently.

## 2d. Fix webhook test — remove `no-cors`
**File:** `src/components/enterprise/ThirdPartyIntegrations.tsx` (line 256)
- Remove `mode: "no-cors"` from the fetch options
- Add response checking: `if (!response.ok) throw new Error(...)`
- This allows actual error detection instead of opaque responses

## 2e. Route SerpAPI test through edge function
**File:** `src/utils/apiKeyTestUtils.ts` (function `testSerpApiConnection`, line ~108)
- Replace direct `fetch('https://serpapi.com/search')` with `supabase.functions.invoke('api-test', { body: { service: 'serp', apiKey } })`
- This avoids CORS issues from calling SerpAPI directly from the browser
- Import supabase client at top of file

## 2f. Handle expired image URLs on download
**File:** `src/components/ai-chat/GeneratedImageCard.tsx` (line 82)
- After `const response = await fetch(image.url)`, add: `if (!response.ok) { toast error "Image URL has expired"; return; }`

