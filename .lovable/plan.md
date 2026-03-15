

# Stress Test Readiness — 6 Bug Fixes

All 6 bugs are in edge function tool handlers within `enhanced-ai-chat`. One deploy covers everything.

---

## BUG-1: `repurpose_for_social` missing API key decryption
**File:** `cross-module-tools.ts` lines 287-296

Add `getApiKey` import and decrypt after provider lookup, same pattern as `content-action-tools.ts` line 438-442. Add early return if no key found.

## BUG-2: `schedule_social_from_repurpose` status mismatch  
**File:** `cross-module-tools.ts` line 476

Change `'pending'` → `'scheduled'` so `engage-social-poster` picks up the posts.

## BUG-3: `content_to_email` + `campaign_content_to_engage` workspace auto-creation
**File:** `cross-module-tools.ts` lines 207-209 and 247-249

Replace both `if (!workspaceId) { return error }` blocks with `ensure_engage_workspace` RPC fallback (already exists in DB). Use `let` instead of `const` for `workspaceId`.

## BUG-4: `generate_full_content` wrong request body structure
**File:** `content-action-tools.ts` lines 451-469

Currently: `{ params: { provider, model, apiKey, messages, maxTokens, userId } }`  
Fix to: `{ service: provider.provider, endpoint: 'chat', apiKey: decryptedApiKey, params: { model, messages, maxTokens } }`

Remove `provider`, `apiKey`, and `userId` from inside `params`.

## BUG-5: `create_topic_cluster` same body structure issue
**File:** `keyword-action-tools.ts` lines 267-285

Same restructure as BUG-4. Move `service`, `endpoint`, `apiKey` to top level. Remove `userId` from `params`.

## BUG-6: `repurpose_for_social` same body structure issue (combined with BUG-1)
**File:** `cross-module-tools.ts` lines 307-324

After adding BUG-1's decrypted key, restructure body: `{ service, endpoint, apiKey, params: { model, messages, maxTokens } }`.

---

## Execution

All changes are in 3 edge function files:
1. `cross-module-tools.ts` — BUG-1, BUG-2, BUG-3, BUG-6
2. `content-action-tools.ts` — BUG-4
3. `keyword-action-tools.ts` — BUG-5

Single deploy of `enhanced-ai-chat` after all edits.

