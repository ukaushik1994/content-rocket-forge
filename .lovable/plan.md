

# What's Left from the Implementation Plan

## Completed (11 of 14 items) ✓

All of the following are verified done in the current codebase:

- **P0-0**: Provider key lookup uses `getApiKey()` for decryption
- **P0-2**: SERP tool uses correct service name `'serp'`
- **P1-7**: Auto-naming fires before AI call
- **P1-1**: No plaintext keys synced to `ai_service_providers`
- **P1-2**: BlockRenderer uses DOMPurify
- **P1-3**: HubSpot console warning added
- **P1-5**: `social_failed` replaced
- **P2-1**: Dead LM Studio handlers deleted
- **P2-3**: Glossary references cleaned up (redirect in App.tsx is correct)
- **P2-4**: Content-repurposing kept (live components)
- **P3-1**: Console/debugger dropped in production build

---

## Still Open (3 items)

### 1. `.gitignore` missing `.env` entries (P1-4) — 1 min
The `.gitignore` has no `.env` lines. Add `.env`, `.env.*`, `.env.local`, `.env.production` entries.

### 2. Error UI when backend fails (P1-6) — 10 min
Line 513 of `useEnhancedAIChatDB.ts` still removes the placeholder and shows only a dismissible toast on error. Users can miss this.

**Fix:** Instead of removing the placeholder, replace it with an error message containing a retry button and a settings link. The message content will show a user-friendly error, and `actions` will include a `send_message` action (retry) and a `navigate` action (settings).

### 3. AI Chat Streaming (Phase 5 / P0-1) — 2-4 hrs
The chat still uses a blocking `supabase.functions.invoke()` call. Users see fake rotating text for 5-30 seconds.

**Fix:** Convert `enhanced-ai-chat` to return a `ReadableStream` with SSE-style progress events. Update the frontend to use `fetch()` + stream reader to show real-time progress steps and token streaming.

This is the highest-effort item and could be done as a separate pass.

---

## Proposed Execution

| Step | Item | Effort |
|------|------|--------|
| 1 | Add `.env` to `.gitignore` | 1 min |
| 2 | Error UI with retry/settings buttons | 10 min |
| 3 | AI Chat Streaming (optional, separate pass) | 2-4 hrs |

Steps 1-2 are quick wins. Step 3 (streaming) is substantially more complex and can be tackled separately if preferred.

