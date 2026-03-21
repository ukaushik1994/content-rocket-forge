# Creaiter — Bug Fixes & Feature Delivery Implementation Guide

> **Purpose:** This document lists every broken feature, bug, and undelivered promise in the Creaiter codebase. Each item includes the exact file(s), line numbers, root cause, and step-by-step fix instructions.
>
> **Priority tiers:**
> - **P0 — Blocking:** Feature is completely broken, users hit errors
> - **P1 — Silent failure:** Feature appears to work but doesn't actually do what it claims
> - **P2 — UX bug:** Minor bugs that degrade experience
> - **P3 — Cleanup:** Dead code, performance waste

---

## TABLE OF CONTENTS

1. [P0-01: Anthropic/Claude API Calls Always Fail (401)](#p0-01)
2. [P0-02: AI Provider Request Bodies Contain Invalid Fields](#p0-02)
3. [P0-03: CORS Production URL Typo Blocks Requests](#p0-03)
4. [P0-04: Streaming Chat URL Can Be `undefined`](#p0-04)
5. [P1-01: OpenRouter HTTP-Referer Shows localhost](#p1-01)
6. [P1-02: LM Studio Cannot Work From Edge Functions](#p1-02)
7. [P1-03: Webhook Integrations Silently Fail](#p1-03)
8. [P1-04: Webhook Test Always Reports Success](#p1-04)
9. [P1-05: SerpAPI Test Calls API Directly From Browser](#p1-05)
10. [P1-06: Image Download Crashes on Expired URLs](#p1-06)
11. [P2-01: Repository Page Fires Duplicate Refresh](#p2-01)
12. [P2-02: deleteApiKey Doesn't Normalize serpapi](#p2-02)
13. [P2-03: Window Event Listener Leak in App.tsx](#p2-03)
14. [P3-01: Dead Code — GlossaryBuilder (19 files)](#p3-01)
15. [P3-02: Dead Code — ContentRepurposing (9 files, no route)](#p3-02)
16. [P3-03: Dead Code — NotificationSettings Page (no route)](#p3-03)
17. [P3-04: Duplicate CORS Files](#p3-04)

---

<a id="p0-01"></a>
## P0-01: Anthropic/Claude API Calls Always Fail (401)

**Severity:** P0 — Blocking
**Impact:** Every user who configures Anthropic Claude as their AI provider gets 401 errors. Claude is one of the 6 supported providers — it is completely non-functional.

### Files to change

**File:** `supabase/functions/ai-proxy/index.ts`

### Root cause

Anthropic's API uses the `x-api-key` header for authentication. The code incorrectly uses `Authorization: Bearer`, which Anthropic rejects with 401.

### What to change

**1. Fix `testAnthropic` function (around line 450):**

Find this block:
```ts
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
  },
```

Replace with:
```ts
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
  },
```

**2. Fix `chatAnthropic` function (around line 494):**

Find this block:
```ts
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify(requestBody),
});
```

Replace with:
```ts
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify(requestBody),
});
```

### How to verify
1. Go to AI Settings, add an Anthropic API key
2. Open AI Chat, send any message
3. Check Supabase edge function logs — should see `✅ Anthropic chat successful` instead of `❌ Anthropic test failed: 401`

---

<a id="p0-02"></a>
## P0-02: AI Provider Request Bodies Contain Invalid Fields

**Severity:** P0 — Blocking (intermittent)
**Impact:** All AI providers (OpenAI, Anthropic, Gemini, OpenRouter, Mistral) may reject requests because the request body contains unknown fields. This is because `...params` is spread directly into the API request, passing through client-side fields that providers don't recognize.

### Files to change

**File:** `supabase/functions/ai-proxy/index.ts`

### Root cause

In every chat handler, the code does something like:
```ts
const requestBody = {
  model,
  messages: params.messages || [],
  temperature: params.temperature || 0.7,
  max_tokens: params.maxTokens || params.max_tokens || 1000,
  ...params  // <-- THIS spreads ALL client fields into the API request
};
```

The `...params` includes fields like `maxTokens` (camelCase duplicate), `model` (duplicate), and any other fields the client sends. API providers reject unknown fields.

### What to change

**1. Fix `chatOpenAI` (around line 201):**

Replace:
```ts
const requestBody: any = {
  model,
  messages: params.messages || [],
  ...params
};
```

With:
```ts
const requestBody: any = {
  model,
  messages: params.messages || [],
};
```

Keep all the existing logic below it that handles `max_tokens`, `max_completion_tokens`, `temperature`, etc. — just remove the `...params` spread. The function already extracts every needed field individually.

**2. Fix `chatAnthropic` (around line 486):**

Replace:
```ts
const requestBody = {
  model: params.model || 'claude-3-sonnet-20240229',
  max_tokens: params.maxTokens || params.max_tokens || 1000,
  messages: params.messages || [],
  temperature: params.temperature || 0.7,
  ...params
};
```

With:
```ts
const requestBody = {
  model: params.model || 'claude-3-sonnet-20240229',
  max_tokens: params.maxTokens || params.max_tokens || 1000,
  messages: params.messages || [],
  temperature: params.temperature || 0.7,
};

// Add system prompt if provided
if (params.system) {
  (requestBody as any).system = params.system;
}
```

**3. Fix `chatOpenRouter` (around line 669):**

Replace:
```ts
const requestBody: any = {
  model,
  messages: params.messages || [],
  ...params
};
```

With:
```ts
const requestBody: any = {
  model,
  messages: params.messages || [],
};
```

Keep the existing `isNewerModel` logic below it unchanged.

**4. Fix `chatMistral` (around line 778):**

Replace:
```ts
const requestBody = {
  model: params.model || 'mistral-large-latest',
  messages: params.messages || [],
  temperature: params.temperature || 0.7,
  max_tokens: params.maxTokens || params.max_tokens || 1000,
  ...params
};
```

With:
```ts
const requestBody = {
  model: params.model || 'mistral-large-latest',
  messages: params.messages || [],
  temperature: params.temperature || 0.7,
  max_tokens: params.maxTokens || params.max_tokens || 1000,
};
```

**5. Fix `chatLMStudio` (around line 889):**

Same pattern — replace:
```ts
const requestBody = {
  model: params.model || 'local-model',
  messages: params.messages || [],
  temperature: params.temperature || 0.7,
  max_tokens: params.maxTokens || params.max_tokens || 1000,
  ...params
};
```

With:
```ts
const requestBody = {
  model: params.model || 'local-model',
  messages: params.messages || [],
  temperature: params.temperature || 0.7,
  max_tokens: params.maxTokens || params.max_tokens || 1000,
};
```

### How to verify
1. Send a chat message using each provider (OpenAI, OpenRouter, Anthropic, Gemini, Mistral)
2. Check edge function logs — should see `✅ [Provider] chat successful` for each
3. No more `400 Bad Request` errors about unknown parameters

---

<a id="p0-03"></a>
## P0-03: CORS Production URL Typo Blocks Requests

**Severity:** P0 — Blocking (production)
**Impact:** The CORS allowlist has `creaitesr` (with extra 's') instead of `creaiter`. If the real domain is `creaiter.lovable.app`, production requests will fail CORS checks and fall through to the wildcard `*` fallback, which doesn't include `Access-Control-Allow-Credentials: true` — breaking authenticated requests.

### Files to change

1. `supabase/functions/shared/cors.ts` — line 3
2. `supabase/functions/_shared/cors.ts` — line 3

### What to change

In both files, find:
```ts
'https://creaitesr.lovable.app',
```

Replace with:
```ts
'https://creaiter.lovable.app',
```

**IMPORTANT:** Verify the actual production URL first. Check the Lovable dashboard for the published domain. If it truly is `creaitesr`, then update `src/contexts/AuthContext.tsx:93` instead (which currently has `creaiter`). The point is: they MUST match.

### How to verify
1. Open browser DevTools Network tab on the production site
2. Make any API call (e.g., send a chat message)
3. Check the response headers — should see `Access-Control-Allow-Origin: https://creaiter.lovable.app` (not `*`)

---

<a id="p0-04"></a>
## P0-04: Streaming Chat URL Can Be `undefined`

**Severity:** P0 — Blocking (when env var is missing)
**Impact:** If `VITE_SUPABASE_URL` environment variable is not set, the streaming chat URL becomes `undefined/functions/v1/ai-streaming`, causing all streaming requests to fail with a confusing network error.

### Files to change

**File:** `src/hooks/useStreamingAI.ts` — line 54

### What to change

Find:
```ts
const streamUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-streaming`;
```

Replace with:
```ts
const streamUrl = `${import.meta.env.VITE_SUPABASE_URL || 'https://iqiundzzcepmuykcnfbc.supabase.co'}/functions/v1/ai-streaming`;
```

This matches the pattern already used in `src/hooks/useUnifiedChatDB.ts:73` and `src/hooks/useStreamingChatDB.ts:269`.

### How to verify
1. Open AI Chat
2. Send a message that triggers streaming
3. Should work without errors even if VITE_SUPABASE_URL is not set

---

<a id="p1-01"></a>
## P1-01: OpenRouter HTTP-Referer Shows localhost

**Severity:** P1 — Silent failure
**Impact:** OpenRouter uses the HTTP-Referer header to identify apps on their dashboard and for billing tracking. Currently hardcoded to `https://localhost:5173`. This means the production app appears as "localhost" in OpenRouter's system.

### Files to change

**File:** `supabase/functions/ai-proxy/index.ts` — line 707

### What to change

Find:
```ts
'HTTP-Referer': 'https://localhost:5173',
'X-Title': 'AI Content Creator'
```

Replace with:
```ts
'HTTP-Referer': 'https://creaiter.lovable.app',
'X-Title': 'Creaiter'
```

### How to verify
1. Make a chat request using OpenRouter provider
2. Check OpenRouter dashboard (openrouter.ai/activity) — app should show as "Creaiter" not "localhost"

---

<a id="p1-02"></a>
## P1-02: LM Studio Cannot Work From Edge Functions

**Severity:** P1 — Feature is dead on arrival
**Impact:** LM Studio is listed as a supported provider in the UI, but it connects to `localhost:1234`. Edge functions run on Supabase/Deno cloud servers — `localhost` inside an edge function is the cloud container, not the user's machine. This feature can never work.

### Files to change

**File:** `supabase/functions/ai-proxy/index.ts` — `handleLMStudio`, `testLMStudio`, `chatLMStudio` functions (lines 820-924)

### Recommended approach

**Option A (recommended): Remove LM Studio from edge function and show clear messaging**

In the `serve` handler switch statement (around line 87), change:
```ts
case 'lmstudio':
  result = await handleLMStudio(endpoint, apiKey, params);
  break;
```

To:
```ts
case 'lmstudio':
  return createErrorResponse(
    'LM Studio requires a local connection and cannot be used through cloud edge functions. LM Studio is only available when running the app locally.',
    400,
    'ai-proxy',
    endpoint
  );
```

Also update the client-side provider metadata in `src/services/aiService/AIServiceController.ts` (around line 130) to add a note:
```ts
lmstudio: {
  name: 'LM Studio (Local Only)',
  description: 'Local AI models — requires running the app locally. Not available in cloud/hosted mode.',
  // ... rest unchanged
},
```

**Option B: Keep but show clear error to user**

In `testLMStudio` and `chatLMStudio`, add at the top:
```ts
console.warn('⚠️ LM Studio connects to localhost — this only works when the app runs locally, not from cloud edge functions');
```

### How to verify
1. Go to AI Settings, try to add LM Studio
2. Should see clear messaging that it's local-only, not a confusing connection timeout

---

<a id="p1-03"></a>
## P1-03: Webhook Integrations Silently Fail

**Severity:** P1 — Silent failure
**Impact:** When SERP data is synced to Slack, Zapier, HubSpot, or Google Sheets via webhooks, the code never checks if the webhook actually succeeded. A 404 or 500 from the external service is silently swallowed, and the user is told "synced" when nothing actually happened.

### Files to change

**File:** `src/services/marketingIntegrationHooks.ts`

### What to change

There are 7 `fetch()` calls that need response checking. Each one follows this pattern — add response checking after the `await fetch(...)`:

**1. `sendToSlack` (around line 202):**
```ts
// BEFORE:
await fetch(integration.webhook, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(slackMessage)
});

// AFTER:
const response = await fetch(integration.webhook, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(slackMessage)
});
if (!response.ok) {
  throw new Error(`Slack webhook failed with status ${response.status}`);
}
```

**2. `sendToZapier` (around line 227):**
Same pattern — add response check.

**3. `sendToHubSpot` (around line 250):**
Same pattern — add response check.

**4. `sendToGoogleSheets` (around line 279):**
Same pattern — add response check.

**5. `sendToWebhook` (around line 294):**
Same pattern — add response check.

**6. Slack action handler (around line 404):**
Same pattern — add response check.

**7. Default action handler (around line 423):**
Same pattern — add response check.

### How to verify
1. Configure a Slack webhook integration with an invalid URL
2. Trigger a SERP data sync
3. Should see error toast saying webhook failed, NOT success

---

<a id="p1-04"></a>
## P1-04: Webhook Test Always Reports Success

**Severity:** P1 — Silent failure
**Impact:** In Enterprise > Third-Party Integrations, the "Test Webhook" button uses `mode: "no-cors"`. With `no-cors`, the browser makes the request but returns an opaque response — you cannot check status, headers, or body. The success toast fires even if the webhook actually returned an error.

### Files to change

**File:** `src/components/enterprise/ThirdPartyIntegrations.tsx` — around line 251

### What to change

Find:
```ts
await fetch(webhookUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  mode: "no-cors",
  body: JSON.stringify({
```

Remove `mode: "no-cors"`. If the webhook endpoint doesn't support CORS from the browser, the correct fix is to route the test through a Supabase edge function:

**Option A (simple):** Remove `mode: "no-cors"` and let the browser show a real CORS error so the user knows the webhook isn't configured for browser requests. Update the toast:
```ts
try {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ... }),
  });
  if (response.ok) {
    toast({ title: "Webhook Triggered", description: "..." });
  } else {
    toast({ title: "Webhook Failed", description: `Status: ${response.status}`, variant: "destructive" });
  }
} catch (error) {
  toast({ title: "Webhook Error", description: "Could not reach the webhook URL. Check CORS settings.", variant: "destructive" });
}
```

**Option B (better):** Create a simple edge function `test-webhook` that makes the request server-side (no CORS issues).

### How to verify
1. Go to Enterprise > API Ecosystem > Webhooks
2. Create a webhook with an invalid URL like `https://httpstat.us/500`
3. Click Test — should show failure, not success

---

<a id="p1-05"></a>
## P1-05: SerpAPI Test Calls API Directly From Browser

**Severity:** P1 — Silent failure
**Impact:** `src/utils/apiKeyTestUtils.ts:120` calls `fetch('https://serpapi.com/search?api_key=...')` directly from the browser. SerpAPI likely blocks browser CORS requests, so this test always fails. Additionally, the API key is visible as a URL query parameter in DevTools.

### Files to change

**File:** `src/utils/apiKeyTestUtils.ts` — around line 120

### What to change

Replace the direct fetch call with a call through the existing `api-proxy` edge function:

```ts
// BEFORE:
const response = await fetch(`${testUrl}?${params.toString()}`, {
  method: 'GET',
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContentBuilder/1.0)' },
  signal: controller.signal
});

// AFTER:
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.functions.invoke('api-proxy', {
  body: {
    service: 'serp',
    endpoint: 'test',
    apiKey: cleanKey
  }
});

if (error) {
  throw new Error(`SerpAPI test failed: ${error.message}`);
}
```

### How to verify
1. Go to AI Settings
2. Add a SerpAPI key
3. Click "Test" — should return success or a clear error, not a CORS failure

---

<a id="p1-06"></a>
## P1-06: Image Download Crashes on Expired URLs

**Severity:** P1 — UX crash
**Impact:** AI-generated image URLs (from OpenAI DALL-E, etc.) expire after a few hours. When a user clicks "Download" on an old image, `fetch(image.url)` fails without error handling, causing an unhandled exception.

### Files to change

**File:** `src/components/ai-chat/GeneratedImageCard.tsx` — around line 82

### What to change

Find:
```ts
const response = await fetch(image.url);
const blob = await response.blob();
```

Replace with:
```ts
const response = await fetch(image.url);
if (!response.ok) {
  toast({
    title: "Download Failed",
    description: "This image URL has expired. Please regenerate the image.",
    variant: "destructive",
  });
  return;
}
const blob = await response.blob();
```

### How to verify
1. Generate an image in AI Chat
2. Wait for the URL to expire (or manually test with a 404 URL)
3. Click Download — should show a friendly error toast, not crash

---

<a id="p2-01"></a>
## P2-01: Repository Page Fires Duplicate Refresh

**Severity:** P2 — UX bug
**Impact:** `refreshContent()` is called twice in a row on lines 30-31. This fires two identical Supabase queries simultaneously, wasting bandwidth and potentially causing UI flicker.

### Files to change

**File:** `src/pages/Repository.tsx` — lines 29-31

### What to change

Find:
```ts
refreshContent();
refreshContent();
```

Remove the duplicate. Keep only one:
```ts
refreshContent();
```

### How to verify
1. Open Repository page
2. Check browser DevTools Network tab — should see ONE query to the content table, not two

---

<a id="p2-02"></a>
## P2-02: deleteApiKey Doesn't Normalize serpapi

**Severity:** P2 — UX bug
**Impact:** `storeApiKey` and `getApiKey` both normalize `'serpapi'` to `'serp'` before querying the database. But `deleteApiKey` does not. If called with `'serpapi'`, it queries `WHERE service = 'serpapi'` — but the record was stored as `service = 'serp'`. The delete silently does nothing.

### Files to change

**File:** `src/services/apiKeyService.ts` — `deleteApiKey` method, around line 217

### What to change

At the top of the `deleteApiKey` method, add normalization:

Find:
```ts
static async deleteApiKey(service: ApiProvider): Promise<boolean> {
  try {
    console.log(`🗑️ Deleting ${service} API key...`);
```

Replace with:
```ts
static async deleteApiKey(service: ApiProvider): Promise<boolean> {
  try {
    // Normalize serpapi alias to serp (consistent with storeApiKey and getApiKey)
    const normalizedService = service === 'serpapi' ? 'serp' : service;
    console.log(`🗑️ Deleting ${normalizedService} API key...`);
```

Then update all references to `service` within the method to use `normalizedService` instead — specifically the `.eq('service', service)` query and the log/toast messages.

### How to verify
1. Store a SERP API key (stored as 'serp' in DB)
2. Call deleteApiKey('serpapi')
3. Verify the key is actually deleted from the database

---

<a id="p2-03"></a>
## P2-03: Window Event Listener Leak in App.tsx

**Severity:** P2 — Code quality
**Impact:** `window.addEventListener('openSettings', ...)` is called at module load time (line 202-208 in App.tsx), outside any React component. It's never cleaned up and runs before React mounts. The `GlobalSettingsBridge` component already handles this same event pattern properly with cleanup.

### Files to change

**File:** `src/App.tsx` — lines 201-208

### What to change

Delete this entire block:
```ts
// Add global event listener for settings from service layers
if (typeof window !== 'undefined') {
  window.addEventListener('openSettings', (event: CustomEvent) => {
    const tab = event.detail || 'api';
    // This will be handled by the GlobalSettingsBridge component
    window.dispatchEvent(new CustomEvent('globalOpenSettings', { detail: tab }));
  });
}
```

The `GlobalSettingsBridge` component (lines 65-78) already listens for `globalOpenSettings` and handles it within the React lifecycle with proper cleanup.

### How to verify
1. Open AI Settings from various places in the app (sidebar, chat prompts, etc.)
2. Settings popup should still open correctly
3. No duplicate event listeners in DevTools

---

<a id="p3-01"></a>
## P3-01: Dead Code — GlossaryBuilder (19 files)

**Severity:** P3 — Cleanup
**Impact:** The GlossaryBuilder feature was deprecated (comment in App.tsx says "GlossaryBuilder removed — feature deprecated"). The route redirects to `/ai-chat`. But 19 files remain in the codebase, shipping in the production bundle.

### Files to delete

```
src/pages/GlossaryBuilder.tsx
src/contexts/glossary-builder/GlossaryBuilderContext.tsx
src/contexts/glossary-builder/actions.ts
src/contexts/glossary-builder/initialState.ts
src/contexts/glossary-builder/reducer.ts
src/contexts/glossary-builder/types.ts
src/components/glossary-builder/GlossaryBuilderHeader.tsx
src/components/glossary-builder/sidebar/GlossaryBuilderSidebar.tsx
src/components/glossary-builder/steps/TermInputStep.tsx
src/components/glossary-builder/steps/TermSelectionStep.tsx
src/components/glossary-builder/steps/DefinitionGenerationStep.tsx
src/components/glossary-builder/steps/ReviewAndEditStep.tsx
src/components/glossary-builder/steps/SaveAndExportStep.tsx
src/components/glossary-builder/term-input/TopicSuggestionMode.tsx
src/components/glossary-builder/term-input/ManualBulkMode.tsx
src/components/glossary-builder/term-input/DomainAnalysisMode.tsx
src/components/glossary-builder/term-management/TermsList.tsx
src/components/glossary-builder/term-management/TermCard.tsx
```

Also delete the `supabase/functions/glossary-generator/` edge function if it's only used by GlossaryBuilder.

**Before deleting:** Search the codebase for any imports from these files. If anything still imports from `glossary-builder`, either update that import or delete the importing file too.

---

<a id="p3-02"></a>
## P3-02: Dead Code — ContentRepurposing (9 files, no route)

**Severity:** P3 — Cleanup
**Impact:** ContentRepurposing has a page file and component tree but no route in App.tsx. These files are unreachable.

### Files to delete

```
src/pages/ContentRepurposing.tsx
src/pages/content-repurposing/ContentRepurposingView.tsx
src/pages/content-repurposing/ContentSelectionView.tsx
src/pages/content-repurposing/index.ts
src/components/content-repurposing/tour/ContentRepurposingTour.tsx
src/components/content-repurposing/hooks/useContentRepurposing.tsx
src/components/content-repurposing/hooks/index.ts
src/components/content-repurposing/ErrorBoundary.tsx
```

**Note:** `src/components/content-builder/final-review/ContentRepurposingCard.tsx` and `src/components/repository/ContentRepurposingModal.tsx` may still be used — check their imports before deleting.

---

<a id="p3-03"></a>
## P3-03: Dead Code — NotificationSettings Page (no route)

**Severity:** P3 — Cleanup
**Impact:** `src/pages/NotificationSettings.tsx` exists but has no route in App.tsx. The Settings popup already has notification settings built-in.

### Files to delete

```
src/pages/NotificationSettings.tsx
```

Check that `src/components/settings/NotificationSettings.tsx` (the popup version) is the one actually used before deleting the page.

---

<a id="p3-04"></a>
## P3-04: Duplicate CORS Files

**Severity:** P3 — Cleanup
**Impact:** Two near-identical CORS files exist:
- `supabase/functions/_shared/cors.ts`
- `supabase/functions/shared/cors.ts`

Some edge functions import from `_shared`, others from `shared`. This causes maintenance issues (e.g., fixing the URL typo requires editing both files).

### What to change

1. Pick one location (recommend `supabase/functions/shared/cors.ts` since it has the more complete `handleCorsPreflightRequest` function)
2. Search all edge function files for imports from `../_shared/cors.ts`
3. Update those imports to `../shared/cors.ts`
4. Delete `supabase/functions/_shared/cors.ts`

**Files that import from `_shared/cors.ts`:** Search with `grep -r "_shared/cors" supabase/functions/` to find all files.

---

## IMPLEMENTATION ORDER

For Lovable.dev to implement in sequence:

### Sprint 1: Critical Fixes (P0)
1. **P0-01** — Anthropic auth header fix (5 min)
2. **P0-02** — Remove `...params` spread from all chat handlers (15 min)
3. **P0-03** — Fix CORS URL typo (2 min)
4. **P0-04** — Add streaming URL fallback (2 min)

### Sprint 2: Silent Failures (P1)
5. **P1-01** — OpenRouter referer fix (2 min)
6. **P1-02** — LM Studio removal/messaging (10 min)
7. **P1-03** — Webhook response checking (15 min)
8. **P1-04** — Webhook test fix (10 min)
9. **P1-05** — SerpAPI test via edge function (10 min)
10. **P1-06** — Image download error handling (5 min)

### Sprint 3: UX Bugs (P2)
11. **P2-01** — Remove duplicate refresh (1 min)
12. **P2-02** — Normalize serpapi in delete (5 min)
13. **P2-03** — Remove leaked event listener (2 min)

### Sprint 4: Cleanup (P3)
14. **P3-01** — Delete GlossaryBuilder files (10 min)
15. **P3-02** — Delete ContentRepurposing files (5 min)
16. **P3-03** — Delete NotificationSettings page (2 min)
17. **P3-04** — Consolidate CORS files (15 min)

---

## TESTING CHECKLIST

After all fixes are applied, verify:

- [ ] Send a chat message with **OpenAI** provider → success
- [ ] Send a chat message with **Anthropic Claude** provider → success
- [ ] Send a chat message with **OpenRouter** provider → success
- [ ] Send a chat message with **Gemini** provider → success
- [ ] Send a chat message with **Mistral** provider → success
- [ ] Try to add **LM Studio** → see clear "local only" messaging
- [ ] **Streaming chat** works (tokens appear in real-time)
- [ ] **SERP API test** in Settings works
- [ ] **Webhook integration** shows error when webhook URL is wrong
- [ ] **Image download** shows friendly error on expired URL
- [ ] **Repository page** loads without duplicate queries
- [ ] **Delete a SERP API key** actually deletes it
- [ ] **Production CORS** shows correct origin (not `*`)
- [ ] **App loads** without console errors from leaked event listeners
- [ ] **Build succeeds** after dead code removal (no broken imports)
