

# Fix: AI Chat Not Working — SSE/Fast-Path Mismatch + Missing URL Fallback

## Root Causes Found

**Bug 1: Fast-path bypasses streaming**
When the user sends a conversational message (like "hi") with `stream: true`, the fast-path at line 1662 of `enhanced-ai-chat/index.ts` returns **plain JSON** before the SSE streaming logic at line 3259 ever runs. The frontend SSE parser can't find `event: done` lines in plain JSON, so `response` stays `null` and it throws "No response received from AI".

**Bug 2: No URL/key fallback**
`useEnhancedAIChatDB.ts` line 428-429 reads `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` without fallbacks. If these aren't set, the fetch URL becomes `undefined/functions/v1/enhanced-ai-chat`. Other hooks in the codebase already use fallbacks (e.g., `|| 'https://iqiundzzcepmuykcnfbc.supabase.co'`).

## Plan

### Fix 1: Make fast-path respect `streamMode` (backend)
In `supabase/functions/enhanced-ai-chat/index.ts`, update the fast-path block (~line 1662-1681) to check `streamMode`. If true, return SSE-formatted response (`event: done\ndata: {...}\n\n`) instead of plain JSON.

### Fix 2: Add URL/key fallbacks (frontend)
In `src/hooks/useEnhancedAIChatDB.ts` lines 428-429, add fallbacks using the hardcoded Supabase URL and anon key from `client.ts`:
```ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iqiundzzcepmuykcnfbc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbG...';
```

### Fix 3: Add frontend fallback for non-SSE responses
In the SSE parser (after the while loop), if `response` is still null, try parsing the full `textBuffer` as plain JSON as a safety net. This handles edge cases where the backend returns JSON instead of SSE.

