

# AI API Consolidation — 5 Phases

## Phase 1: Remove Dead Providers (frontend only)

Remove 6 provider entries from `API_PROVIDERS` in `src/components/settings/api/types.ts`:
- `lmstudio` (localhost — can't work from cloud)
- `lmstudio_image` (same)
- `serpstack` (no backend handler)
- `sendgrid` (no backend handler)
- `twilio` (no backend handler)
- `stripe` (no billing system)

Result: 19 working providers remain.

---

## Phase 2: Migrate OpenRouter to `api_keys` table (migration + frontend + backend)

**2A — Migration**: Copy existing OpenRouter keys from `user_llm_keys` to `api_keys` (with `ON CONFLICT DO NOTHING` safety).

**2B — Frontend `OpenRouterSettings.tsx`**: Replace `user_llm_keys` reads/writes with `storeApiKey`/`deleteApiKey`/`toggleApiKeyStatus` from `apiKeyService` — same pattern as all other providers.

**2C — Frontend `crud.ts` + `apiKeyService.ts`**: Remove the OpenRouter special-case that checks `user_llm_keys` first.

**2D — Backend `enhanced-ai-chat/index.ts`**: Remove the `user_llm_keys` special-case block (~line 2213). OpenRouter uses the same `getApiKey('openrouter', userId)` decryption path as other providers.

**2E — Backend `intelligent-workflow-executor/index.ts`, `glossary-generator/index.ts`, `generate-enhanced-brief/index.ts`**: Remove all `user_llm_keys` fallback reads. Use shared `getApiKey()`.

**2F — Frontend `useOpenRouter.ts`**: Change model read from `user_llm_keys` to `ai_service_providers.preferred_model`.

Result: Zero writes/reads to `user_llm_keys`. Table kept as safety net for one release cycle.

---

## Phase 3: Wire Default AI Provider Selector (frontend only)

**3A** — Import and render `DefaultAiProviderSelector` in `ApiSettings.tsx` above the AI Services category cards.

**3B** — Update `DefaultAiProviderSelector.tsx` to:
- Query `api_keys_metadata` for configured AI providers
- Query `ai_service_providers` for currently active provider
- On switch: deactivate all AI providers, activate selected one
- Show only providers with configured keys; empty state if none

Result: User sees which AI provider is active, switches with one click.

---

## Phase 4: Clean `ai_service_providers.api_key` column (migration + frontend + backend)

**4A — Migration**: `UPDATE ai_service_providers SET api_key = '' WHERE api_key IS NOT NULL AND api_key != ''`

**4B — Backend**: In any upsert to `ai_service_providers` in `enhanced-ai-chat/index.ts`, always set `api_key: ''`.

**4C — Frontend**: In `apiKeyService.ts` `toggleApiKeyStatus()` and `providerSync.ts` `syncApiKeysToProviders()`, always set `api_key: ''`.

Result: `api_keys` = encrypted key storage. `ai_service_providers` = metadata only. Clean separation.

---

## Phase 5: Auto-Detect Models + Self-Heal (backend + frontend)

**5A — Backend `ai-proxy/index.ts`**: Add `listModels(service, apiKey)` function that calls each provider's model listing endpoint. Add `pickBestModel(service, availableModels)` with ranked preference lists.

**5B — Backend `ai-proxy/index.ts`**: Extend test handlers to return `available_models` and `recommended_model` after key verification.

**5C — Backend `ai-proxy/index.ts`**: Add 404-retry pattern to each provider's chat handler — on model-not-found, auto-detect best model, retry, return `_autoDetectedModel` signal.

**5D — Backend `enhanced-ai-chat/index.ts`**: After AI response, if `_autoDetectedModel` is set, update `ai_service_providers.preferred_model`.

**5E — Frontend `SimpleProviderCard.tsx`**: After successful test, save `recommended_model` and `available_models` to `ai_service_providers`.

**5F — Frontend**: Show model dropdown from `available_models` when populated.

**5G — Frontend `apiKeyService.ts`**: Remove hardcoded `defaultModels` map. Backend `ai-proxy`: update fallback model strings to current stable names.

Result: Models auto-detected from provider APIs, self-heal on retirement, user can override via dropdown.

---

## Execution Summary

| Phase | Items | Backend | Frontend | Migrations |
|-------|-------|---------|----------|------------|
| 1 | 1 | 0 | 1 | 0 |
| 2 | 6 | 3 | 3 | 1 |
| 3 | 2 | 0 | 2 | 0 |
| 4 | 3 | 1 | 2 | 1 |
| 5 | 7 | 3 | 3 | 0 |
| **Total** | **19** | **7** | **11** | **2** |

Each phase completes fully before the next starts.

