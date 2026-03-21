# AI API Key Storage Consolidation Plan

> **Created:** 2026-03-21
> **For:** Lovable.dev implementation
> **Goal:** Consolidate 3 overlapping tables into a clean 2-table system. Wire the default provider selector. Remove dead providers.
> **Rule:** Don't break existing functionality. Migration must be safe.

---

## THE PROBLEM

Three tables track AI keys:

| Table | Purpose | Problem |
|-------|---------|---------|
| `api_keys` | Encrypted key storage (new, correct) | This is the right table |
| `ai_service_providers` | Provider metadata + active status | Needed, but `api_key` column on it is confusing — sometimes empty, sometimes has data |
| `user_llm_keys` | Legacy plaintext key storage | Should be dead but OpenRouter still writes here |

**Result:** Edge functions check all 3 tables with fallback chains. OpenRouter has special-case code everywhere. User can enable multiple providers but only 1 works, and they can't see which one.

---

## THE FIX (4 steps)

### Step 1: Remove Dead Providers from UI (5 min)

**What:** Remove 6 providers that have no backend handlers. Users can add keys but nothing happens.

**Frontend — File:** `src/components/settings/api/types.ts`

Remove these entries from the `API_PROVIDERS` array:

| Provider | Service Key | Why Remove |
|----------|-------------|------------|
| LM Studio | `lmstudio` | Localhost only — can't work from Supabase cloud |
| LM Studio Image | `lmstudio_image` | Same reason |
| Serpstack | `serpstack` | No edge function handler exists |
| SendGrid | `sendgrid` | No edge function handler exists |
| Twilio | `twilio` | No edge function handler exists |
| Stripe | `stripe` | No billing system built |

**How:** Find each entry in the `API_PROVIDERS` array and delete the entire object. They look like:

```ts
{
  id: 'lmstudio',
  name: 'LM Studio',
  description: '...',
  serviceKey: 'lmstudio',
  category: 'AI Services'
},
```

Delete all 6 of these objects from the array.

**After this:** 19 working providers remain. Every provider the user sees has a real backend handler.

**Backend:** No changes.

---

### Step 2: Make OpenRouter Use `api_keys` Table (30 min)

**What:** OpenRouterSettings.tsx currently writes to `user_llm_keys` (legacy plaintext table). Change it to write to `api_keys` (encrypted) like every other provider. Then remove the special-case fallback in edge functions.

#### Step 2A — Frontend: Change OpenRouterSettings to use api_keys

**File:** `src/components/settings/api/OpenRouterSettings.tsx`

**Find `handleSaveKey()`** — currently does:
```ts
await supabase.from('user_llm_keys').upsert({
  user_id: user.id,
  provider: 'openrouter',
  api_key: apiKey,
  model: selectedModel,
  is_active: true
});
```

**Replace with** the same pattern every other provider uses:
```ts
import { storeApiKey, toggleApiKeyStatus } from '@/services/apiKeyService';

// Save encrypted key to api_keys table
await storeApiKey('openrouter', apiKey);

// Activate in ai_service_providers
await toggleApiKeyStatus('openrouter', true, selectedModel);
```

**Find `loadExistingKey()`** — currently reads from `user_llm_keys`. Change to read from `api_keys_metadata`:
```ts
// Instead of:
const { data } = await supabase
  .from('user_llm_keys')
  .select('api_key, model, is_active')
  .eq('user_id', user.id)
  .eq('provider', 'openrouter')
  .single();

// Use:
const { data } = await supabase
  .from('api_keys_metadata')
  .select('is_active')
  .eq('user_id', user.id)
  .eq('service', 'openrouter')
  .single();

// For model, read from ai_service_providers:
const { data: providerData } = await supabase
  .from('ai_service_providers')
  .select('preferred_model')
  .eq('user_id', user.id)
  .eq('provider', 'openrouter')
  .single();

const selectedModel = providerData?.preferred_model || '';
```

**Find `handleDeleteKey()`** — currently deletes from `user_llm_keys`. Change to:
```ts
import { deleteApiKey } from '@/services/apiKeyService';
await deleteApiKey('openrouter');
```

#### Step 2B — Backend: Remove user_llm_keys fallback in enhanced-ai-chat

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find the OpenRouter special-case check (~line 2214-2225 area). It looks something like:

```ts
// Special case for OpenRouter — check user_llm_keys first
if (provider.provider === 'openrouter') {
  const { data: legacyKey } = await supabase
    .from('user_llm_keys')
    .select('api_key, model')
    .eq('user_id', userId)
    .eq('provider', 'openrouter')
    .eq('is_active', true)
    .single();
  if (legacyKey?.api_key) {
    provider.api_key = legacyKey.api_key;
    // ...
  }
}
```

**Remove this entire block.** OpenRouter will now use the same `getApiKey('openrouter', userId)` path as every other provider — reading from `api_keys` table and decrypting.

**Also check:** `supabase/functions/openrouter-content-generator/index.ts` — if it reads from `user_llm_keys`, change to use `getApiKey('openrouter', userId)` from `shared/apiKeyService.ts`.

**Also check:** `supabase/functions/ai/index.ts` — same pattern, remove any `user_llm_keys` special case.

#### Step 2C — Migration: Copy existing OpenRouter keys to api_keys

**Migration SQL:**

```sql
-- Migrate existing OpenRouter keys from user_llm_keys to api_keys
-- Only migrate keys that don't already exist in api_keys
INSERT INTO api_keys (user_id, service, encrypted_key, is_active)
SELECT
  user_id,
  'openrouter' as service,
  api_key as encrypted_key,  -- Note: this is plaintext, will need re-encryption
  is_active
FROM user_llm_keys
WHERE provider = 'openrouter'
  AND api_key IS NOT NULL
  AND api_key != ''
  AND user_id NOT IN (
    SELECT user_id FROM api_keys WHERE service = 'openrouter'
  )
ON CONFLICT (user_id, service) DO NOTHING;
```

**Important note:** The keys migrated this way will be plaintext in `encrypted_key` column. The `shared/apiKeyService.ts` `getApiKey()` function already has a legacy detection fallback — if decryption fails, it tries using the raw value. So these will still work. When the user next saves their OpenRouter key through the UI, it will be properly encrypted.

#### Step 2D — Frontend: Remove user_llm_keys reads from other files

**File:** `src/services/apiKeys/crud.ts`

Find `getUnifiedApiKey()` — it checks `user_llm_keys` for OpenRouter specifically. Remove that special case. It should only read from `api_keys`:

```ts
// Remove this block:
if (provider === 'openrouter') {
  const { data } = await supabase
    .from('user_llm_keys')
    .select('api_key')
    .eq('user_id', userId)
    .eq('provider', 'openrouter')
    .eq('is_active', true)
    .single();
  if (data?.api_key) return data.api_key;
}
```

**File:** `src/services/apiKeyService.ts`

Find `getLegacyApiKey()` — if it reads from `user_llm_keys`, either remove it entirely or mark it as deprecated. The main `getApiKey()` function should only read from `api_keys`.

**Backend:** No changes beyond what's in 2B.

**After this step:** OpenRouter uses the same storage path as every other provider. Zero special cases. `user_llm_keys` table is no longer written to or read from.

---

### Step 3: Wire Default AI Provider Selector (20 min)

**What:** Users can toggle multiple providers ON but only 1 is used. There's no way to see or choose which one is active. `DefaultAiProviderSelector.tsx` exists but isn't integrated.

#### Step 3A — Integrate selector into API Settings

**File:** `src/components/settings/api/ApiSettings.tsx`

Find where the AI Services category renders. Add the DefaultAiProviderSelector above the provider cards:

```tsx
import { DefaultAiProviderSelector } from './DefaultAiProviderSelector';

// Inside the render, before the AI Services provider cards:
{activeCategory === 'AI Services' && (
  <div className="mb-6">
    <DefaultAiProviderSelector />
  </div>
)}
```

If `activeCategory` isn't how it works, find where AI providers are listed and add the selector above them.

#### Step 3B — Make the selector read/write correctly

**File:** `src/components/settings/api/DefaultAiProviderSelector.tsx`

This component needs to:

1. **Read** which provider is currently active:
```ts
const { data: activeProvider } = useQuery({
  queryKey: ['active-ai-provider', user?.id],
  queryFn: async () => {
    const { data } = await supabase
      .from('ai_service_providers')
      .select('provider, preferred_model')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .single();
    return data;
  },
  enabled: !!user?.id
});
```

2. **Show** only providers that have active keys configured:
```ts
const { data: configuredProviders } = useQuery({
  queryKey: ['configured-ai-providers', user?.id],
  queryFn: async () => {
    const { data } = await supabase
      .from('api_keys_metadata')
      .select('service')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .in('service', ['openai', 'anthropic', 'gemini', 'mistral', 'openrouter']);
    return data?.map(d => d.service) || [];
  },
  enabled: !!user?.id
});
```

3. **Switch** when user picks a different provider:
```ts
const handleSwitch = async (newProvider: string) => {
  // Deactivate all AI providers
  await supabase
    .from('ai_service_providers')
    .update({ status: 'inactive' })
    .eq('user_id', user.id)
    .in('provider', ['openai', 'anthropic', 'gemini', 'mistral', 'openrouter']);

  // Activate the selected one
  await supabase
    .from('ai_service_providers')
    .update({ status: 'active' })
    .eq('user_id', user.id)
    .eq('provider', newProvider);

  // Invalidate cache
  queryClient.invalidateQueries({ queryKey: ['active-ai-provider'] });

  toast({ title: `Switched to ${newProvider}` });
};
```

4. **UI:** Show radio buttons or segmented control with provider names. Only providers with configured keys are clickable. Currently active one is highlighted. Show the model name next to it.

```tsx
{configuredProviders?.map(provider => (
  <button
    key={provider}
    onClick={() => handleSwitch(provider)}
    className={cn(
      'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm',
      activeProvider?.provider === provider
        ? 'border-primary bg-primary/10 text-primary font-medium'
        : 'border-border hover:border-primary/50'
    )}
  >
    <div className={cn(
      'w-2 h-2 rounded-full',
      activeProvider?.provider === provider ? 'bg-primary' : 'bg-muted-foreground/30'
    )} />
    {provider}
    {activeProvider?.provider === provider && (
      <span className="text-xs text-muted-foreground ml-1">
        ({activeProvider.preferred_model || 'default'})
      </span>
    )}
  </button>
))}
```

5. **Empty state:** If no AI providers configured, show: "Add an AI provider key above to get started."

**Backend:** No changes — edge function already reads `ai_service_providers WHERE status='active' LIMIT 1`.

**After this step:** User sees which AI provider is active and can switch with one click. No more "toggle 3 on and guess which one works."

---

### Step 4: Clean Up ai_service_providers.api_key Column (10 min)

**What:** The `api_key` column on `ai_service_providers` is confusing — sometimes stores encrypted key, sometimes empty string, sometimes placeholder. It should NEVER store the actual key (that's what `api_keys` table is for).

#### Step 4A — Migration: Clear the column

```sql
-- Clear the api_key column on ai_service_providers
-- Real keys live in api_keys table. This column should not store keys.
UPDATE ai_service_providers SET api_key = '' WHERE api_key IS NOT NULL AND api_key != '';
```

#### Step 4B — Backend: Stop writing to api_key column

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find any UPSERT into `ai_service_providers` that sets `api_key`. Change to always set it to empty string:

```ts
// In any upsert to ai_service_providers:
api_key: '',  // Keys stored in api_keys table, not here
```

#### Step 4C — Frontend: Stop writing to api_key column

**File:** `src/services/apiKeyService.ts`

In `toggleApiKeyStatus()`, find where it upserts to `ai_service_providers`. Make sure `api_key` is always `''`:

```ts
await supabase.from('ai_service_providers').upsert({
  user_id: userId,
  provider: service,
  api_key: '',  // Never store key here — api_keys table only
  status: isActive ? 'active' : 'inactive',
  preferred_model: defaultModel,
  // ...
});
```

**File:** `src/services/aiService/providerSync.ts`

In `syncApiKeysToProviders()`, same — always `api_key: ''`.

**After this step:** `ai_service_providers` only stores metadata (provider name, status, preferred model, priority). Never stores keys. Clean separation:
- `api_keys` = encrypted key storage
- `ai_service_providers` = which provider is active + model preferences

---

## Step 5: Auto-Detect Available Models Per Provider (30 min)

**What:** Model names go stale (e.g., `gemini-2.0-flash-exp` retired by Google). Instead of hardcoding defaults, detect what models the user actually has access to and auto-select the best one. Self-heal if a model stops working.

### How Each Provider Exposes Models

| Provider | Endpoint | Auth Method |
|----------|----------|-------------|
| OpenAI | `GET https://api.openai.com/v1/models` | `Authorization: Bearer KEY` |
| Gemini | `GET https://generativelanguage.googleapis.com/v1beta/models?key=KEY` | Query param |
| Mistral | `GET https://api.mistral.ai/v1/models` | `Authorization: Bearer KEY` |
| OpenRouter | `GET https://openrouter.ai/api/v1/models` | `Authorization: Bearer KEY` |
| Anthropic | No list endpoint — use known stable model IDs (versioned, don't expire) |

### Step 5A — Backend: Add `listModels` + `pickBestModel` to ai-proxy

**File:** `supabase/functions/ai-proxy/index.ts`

Add these two functions:

```ts
// Model preference ranking per provider (best first)
const MODEL_PREFERENCES: Record<string, string[]> = {
  openai: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo'
  ],
  gemini: [
    'gemini-2.5-flash-preview-05-20',
    'gemini-2.5-pro-preview-05-06',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
  ],
  mistral: [
    'mistral-large-latest',
    'mistral-medium-latest',
    'mistral-small-latest'
  ],
  anthropic: [
    'claude-sonnet-4-20250514',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-haiku-20240307'
  ],
  openrouter: [] // User picks from full catalog — no preference needed
};

async function listModels(service: string, apiKey: string): Promise<string[]> {
  try {
    switch (service) {
      case 'openai': {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!res.ok) return [];
        const data = await res.json();
        // Filter to chat models only (exclude embeddings, whisper, etc.)
        return (data.data || [])
          .map((m: any) => m.id)
          .filter((id: string) => id.includes('gpt'));
      }
      case 'gemini': {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        if (!res.ok) return [];
        const data = await res.json();
        return (data.models || [])
          .map((m: any) => m.name.replace('models/', ''))
          .filter((id: string) => id.includes('gemini'));
      }
      case 'mistral': {
        const res = await fetch('https://api.mistral.ai/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.data || []).map((m: any) => m.id);
      }
      case 'openrouter': {
        const res = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.data || []).map((m: any) => m.id).slice(0, 100); // Cap at 100
      }
      case 'anthropic': {
        // Anthropic has no list endpoint — return known stable models
        return ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'];
      }
      default: return [];
    }
  } catch (err) {
    console.warn(`Failed to list models for ${service}:`, err);
    return [];
  }
}

function pickBestModel(service: string, availableModels: string[]): string {
  const prefs = MODEL_PREFERENCES[service] || [];
  for (const preferred of prefs) {
    // Fuzzy match — model IDs sometimes have date suffixes or version tags
    const match = availableModels.find(m =>
      m === preferred || m.startsWith(preferred)
    );
    if (match) return match;
  }
  // Fallback: first available model
  return availableModels[0] || '';
}
```

### Step 5B — Backend: Wire into `test` endpoint to return models

Each provider's test handler already runs when user clicks "Save & Test". Extend it to also return available models and a recommendation.

**In each provider's test handler** (testOpenAI, testGemini, testMistral, testOpenRouter, testAnthropic):

After the key verification succeeds, add:

```ts
// After key test passes:
const availableModels = await listModels(service, apiKey);
const recommendedModel = pickBestModel(service, availableModels);

return {
  success: true,
  provider: service,
  available_models: availableModels,
  recommended_model: recommendedModel
};
```

### Step 5C — Backend: Self-heal on model-not-found errors

In each provider's chat handler (handleGemini, handleOpenAI, etc.), add a retry with auto-detection if the model returns 404:

**Example for handleGemini (apply same pattern to all providers):**

```ts
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  { method: 'POST', headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) }
);

if (!response.ok && (response.status === 404 || response.status === 400)) {
  // Model doesn't exist or was retired — auto-detect and retry
  console.warn(`⚠️ Model "${model}" not found (${response.status}), auto-detecting best available...`);
  const models = await listModels('gemini', apiKey);
  const fallbackModel = pickBestModel('gemini', models);

  if (fallbackModel && fallbackModel !== model) {
    console.log(`🔄 Retrying with auto-detected model: ${fallbackModel}`);
    const retryResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent`,
      { method: 'POST', headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) }
    );

    if (retryResponse.ok) {
      // Self-heal: update the stored model so this doesn't happen again
      // Pass the new model back in the response metadata
      const data = await retryResponse.json();
      return {
        success: true,
        data,
        provider: 'Gemini',
        _autoDetectedModel: fallbackModel  // Signal to caller to update stored model
      };
    }
  }
  // If retry also fails, throw original error
  const errorData = await response.text();
  throw new Error(`Gemini chat failed: ${response.statusText} - ${errorData}`);
}
```

**Apply the same 404-retry pattern to:** `handleOpenAI`, `handleMistral`, `handleOpenRouter`.

### Step 5D — Backend: enhanced-ai-chat updates stored model on self-heal

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

After calling ai-proxy, check if it auto-detected a new model:

```ts
// After receiving ai-proxy response:
if (aiResponse._autoDetectedModel) {
  console.log(`🔧 Self-healing: updating stored model to ${aiResponse._autoDetectedModel}`);
  try {
    await supabase.from('ai_service_providers')
      .update({ preferred_model: aiResponse._autoDetectedModel })
      .eq('user_id', userId)
      .eq('provider', provider.provider);
  } catch { /* non-blocking */ }
}
```

### Step 5E — Frontend: Auto-set model when test returns recommendation

**File:** `src/components/settings/api/SimpleProviderCard.tsx` (or wherever test results are handled)

After the "Save & Test" call succeeds:

```ts
// After test passes and returns available_models + recommended_model:
if (testResult.recommended_model) {
  // Update the stored model preference
  await supabase.from('ai_service_providers')
    .update({
      preferred_model: testResult.recommended_model,
      available_models: testResult.available_models || []
    })
    .eq('user_id', userId)
    .eq('provider', service);
}
```

### Step 5F — Frontend: Show model dropdown with real models (optional enhancement)

**File:** `src/components/settings/api/SimpleProviderCard.tsx` or `DefaultAiProviderSelector.tsx`

If `ai_service_providers.available_models` is populated, show a dropdown so the user can override the auto-selected model:

```tsx
{provider.available_models?.length > 0 && (
  <select
    value={provider.preferred_model}
    onChange={(e) => handleModelChange(e.target.value)}
    className="text-xs border rounded px-2 py-1 bg-background"
  >
    {provider.available_models.map((model: string) => (
      <option key={model} value={model}>{model}</option>
    ))}
  </select>
)}
```

This gives users control while defaulting to the best model automatically.

### Step 5G — Remove all hardcoded model defaults

**File:** `src/services/apiKeyService.ts`

Find the hardcoded model defaults (~line 328):
```ts
// DELETE THIS ENTIRE BLOCK:
const defaultModels = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.0-flash-exp',
  anthropic: 'claude-3-5-sonnet-20241022',
  ...
};
```

Replace with:
```ts
// Models are auto-detected on key save — no hardcoded defaults needed
// If detection fails, pickBestModel() in ai-proxy handles fallback
const defaultModels: Record<string, string> = {};
```

**File:** `supabase/functions/ai-proxy/index.ts`

Change all hardcoded fallbacks:
```ts
// Line 612 — change:
const model = params.model || 'gemini-pro';
// To:
const model = params.model || 'gemini-2.0-flash'; // Safe fallback, but auto-detect handles most cases

// Same for other providers — update fallbacks to current stable models:
// OpenAI: 'gpt-4o-mini'
// Mistral: 'mistral-small-latest'
// Anthropic: 'claude-3-5-haiku-20241022'
```

These fallbacks are now safety nets only — 99% of the time, auto-detection picks the right model.

**After this step:**
- Model names are detected from the provider API, not hardcoded
- User sees which models they have access to
- Best model is auto-selected on key setup
- If a model gets retired, the system self-heals on next request
- User can override with a model dropdown if they want

---

## WHAT NOT TO DO

| Don't | Why |
|-------|-----|
| Don't DROP `user_llm_keys` table yet | Existing users may have keys there. The migration in Step 2C covers them, but keep the table for 1 release cycle as a safety net. |
| Don't change `api_keys` table schema | It's correct. Don't touch it. |
| Don't change `shared/apiKeyService.ts` `getApiKey()` | It already reads from `api_keys` and decrypts. The legacy fallback is fine to keep for safety. |
| Don't change how non-AI providers work | SERP, Resend, GA, GSC all correctly use `api_keys` already. No changes needed. |
| Don't touch `ai-proxy/index.ts` routing logic | The service dispatch (openai→handleOpenAI, etc.) is correct. Step 5 adds model detection functions but doesn't change routing. |

---

## VERIFICATION CHECKLIST

After all 4 steps, verify:

- [ ] Settings shows 19 providers (not 25) — 6 dead ones removed
- [ ] OpenRouter key save goes to `api_keys` table (check DB after saving)
- [ ] OpenRouter key is encrypted in `api_keys.encrypted_key` (not plaintext)
- [ ] Chat works with OpenRouter after migration (send a test message)
- [ ] Chat works with OpenAI/Anthropic/Gemini (unchanged — should still work)
- [ ] Default AI Provider selector appears above AI Services cards
- [ ] Selector shows only providers with configured keys
- [ ] Clicking a different provider switches the active one
- [ ] `ai_service_providers.api_key` column is empty for all rows
- [ ] `user_llm_keys` table is no longer written to (check DB after operations)
- [ ] Save a Gemini key → test passes → `ai_service_providers.preferred_model` is auto-detected (e.g., `gemini-2.0-flash`), not hardcoded
- [ ] Save an OpenAI key → `preferred_model` is auto-detected (e.g., `gpt-4o` or `gpt-4o-mini`)
- [ ] If a provider returns 404 on a model, the chat auto-retries with a detected model and self-heals the stored model
- [ ] Model dropdown shows real available models (if the enhancement in 5F is built)

---

## SUMMARY

| Step | What | Files | Time |
|------|------|-------|------|
| 1 | Remove 6 dead providers from UI | `types.ts` | 5 min |
| 2 | Migrate OpenRouter to `api_keys` | `OpenRouterSettings.tsx`, `enhanced-ai-chat/index.ts`, `crud.ts`, `apiKeyService.ts`, migration | 30 min |
| 3 | Wire Default AI Provider Selector | `ApiSettings.tsx`, `DefaultAiProviderSelector.tsx` | 20 min |
| 4 | Clean `ai_service_providers.api_key` | migration, `enhanced-ai-chat/index.ts`, `apiKeyService.ts`, `providerSync.ts` | 10 min |
| 5 | Auto-detect models + self-heal | `ai-proxy/index.ts`, `enhanced-ai-chat/index.ts`, `SimpleProviderCard.tsx`, `apiKeyService.ts` | 30 min |
| **Total** | | **~12 files** | **~1.5 hours** |

**After this:**
- 2 tables with clear responsibilities (`api_keys` for keys, `ai_service_providers` for metadata)
- `user_llm_keys` is read-only fallback (no writes), safe to drop later
- User sees exactly which AI provider is active and can switch
- Every provider in the UI actually works
- No more special cases for OpenRouter
- **Models are auto-detected from the provider API — no hardcoded names that go stale**
- **System self-heals if a model gets retired — retries with best available, updates DB**
- **User can see and override which model is used via dropdown**
