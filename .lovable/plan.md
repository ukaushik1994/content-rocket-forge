

# Verification Results — 7 "Still Open" Items

After checking the current codebase, **4 of 7 items are already fixed**. Only 3 genuinely remain open.

---

## Already Fixed (4 items)

| Item | Evidence |
|------|----------|
| **SERP missing key messaging (Fix 3)** | `keyword-action-tools.ts` line 162-170: checks `getApiKey('serpapi', userId)`, returns "No SerpAPI key configured. Please go to Settings → API Keys" if missing |
| **Write confirmation (Fix 6)** | Backend: `DESTRUCTIVE_TOOLS` array at line 2210, blocks at line 2238 unless `CONFIRMED:` prefix. Frontend: `useEnhancedAIChatDB.ts` detects `confirm_action` in response, sets `confirmationData`, renders `ActionConfirmationCard` in `EnhancedMessageBubble.tsx` |
| **Conversation context (Fix 7)** | `useEnhancedAIChatDB.ts` lines 401-409: keeps first message + last 9 when >10 messages |
| **LM Studio messaging** | `ai-proxy/index.ts` lines 87-93: returns 400 with "LM Studio runs on localhost and is not reachable from cloud edge functions" |

---

## Genuinely Open (3 items)

### 1. AI Chat Streaming (Fix 1) — Option C (minimum viable)

The chat still uses a single blocking `supabase.functions.invoke()` call that returns JSON after the full response is generated. Users wait 5-30s with only a static placeholder.

**Plan — Option B (progress events via ReadableStream):**

This is the most impactful fix. Convert `enhanced-ai-chat` to stream progress events so users see what's happening during tool execution.

**Backend (`supabase/functions/enhanced-ai-chat/index.ts`):**
- After query analysis completes, write a progress event: `{"type":"progress","step":"Analyzing your request..."}`
- Before each tool call, write: `{"type":"progress","step":"Fetching your content data..."}`
- After all tools complete, write: `{"type":"progress","step":"Generating response..."}`
- Final event: `{"type":"complete","message":"...","actions":[...],"visualData":[...]}`
- Change `Content-Type` to `text/event-stream` and return a `ReadableStream`

**Frontend (`src/hooks/useEnhancedAIChatDB.ts`):**
- Replace `supabase.functions.invoke()` with a direct `fetch()` to the edge function URL
- Read the response as a stream using `getReader()`
- Parse each chunk as newline-delimited JSON
- On `progress` events: update the placeholder message content with the step text
- On `complete` event: finalize the message with full response data

### 2. XSS in RepositoryPanel (`src/components/ai-chat/panels/RepositoryPanel.tsx` line 84)

Uses `dangerouslySetInnerHTML={{ __html: selectedItem.content }}` without sanitization. Content comes from the database (AI-generated) and could contain malicious HTML.

**Fix:** Import `DOMPurify` and wrap: `DOMPurify.sanitize(selectedItem.content || '...')`

### 3. XSS in ApprovalsPanel (`src/components/ai-chat/panels/ApprovalsPanel.tsx` line 100)

Same issue — `dangerouslySetInnerHTML={{ __html: selectedItem.content?.slice(0, 2000) }}` without sanitization.

**Fix:** Import `DOMPurify` and wrap: `DOMPurify.sanitize(selectedItem.content?.slice(0, 2000) || '...')`

---

## Execution Order

| Step | Fix | Effort |
|------|-----|--------|
| 1 | XSS in RepositoryPanel + ApprovalsPanel | 2 min — two imports + wraps |
| 2 | Streaming (progress events) — backend | 30 min — refactor response to ReadableStream |
| 3 | Streaming (progress events) — frontend | 20 min — stream reader + progressive UI updates |

