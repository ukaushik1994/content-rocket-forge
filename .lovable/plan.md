
## What’s happening right now (current state)
1. **/ai-chat is using the `ai-streaming` Edge Function for the “main” reply path** (confirmed via network logs: POST `/functions/v1/ai-streaming` for “tell me about gl connect”).  
   - `ai-streaming` **does not have tool calling** and **does not fetch workspace data** (solutions/company/competitors).  
   - So the model answers generically: “I don’t have specific info…”

2. **Even when we do call `enhanced-ai-chat` (for post-stream actions), the client is sending the wrong payload shape** in several places:
   - `enhanced-ai-chat` validates input with a strict Zod schema: it accepts `{ messages, context }` (and optional `useCampaignStrategyTool`).  
   - Some callers send extra top-level fields like `conversationId`, `userId`, `features`, etc. → this can cause **400 “Invalid input”** and silently break tool execution/awareness.

This combo explains why it “used to be aware” (when the non-streaming enhanced path was used) and now it isn’t.

---

## Goal
Make AI Chat “awareness-first”:
- Default responses come from **`enhanced-ai-chat`** (tool-enabled, database-aware, nugget-based retrieval).
- Keep token usage controlled by **small summaries + on-demand tools**, not “dump everything”.

(You selected **Awareness-first** mode.)

---

## Plan (Implementation)
### A) Route /ai-chat to the tool-enabled backend by default
**Change the chat send flow** (the hook powering `/ai-chat`) so the default response path is:
- Build conversation history (last N messages)
- Call **`supabase.functions.invoke('enhanced-ai-chat', { body: { messages, context }})`**
- Render returned `message/content`, `visualData`, and `actions`

Concretely:
- Update `src/hooks/useEnhancedAIChatDB.ts`:
  - Add a “default transport” switch (or just make it default) to **skip `ai-streaming`** for standard messages.
  - Keep the existing UI “thinking” indicator (your ThinkingTextRotator) while waiting.
  - Keep the existing “direct wizard launch” shortcut logic if desired (optional), but most tool orchestration will now come from `enhanced-ai-chat`.

### B) Fix all `enhanced-ai-chat` invocation payloads (schema compliance)
Audit and fix any callers that send invalid body fields. Convert to:
```ts
{
  messages: [...],
  context: { conversation_id: "...", analystActive: boolean, ... }
}
```
Key places:
- `src/hooks/useEnhancedAIChatDB.ts` (tool execution calls + any fallback calls)
- `src/hooks/useUnifiedChatDB.ts` (post-stream “execute tool” call)
- `src/services/enhancedAIService.ts` (it currently sends extra fields like `userId`, `features`, `apiKeys`—those must not be sent to `enhanced-ai-chat`)

This ensures tool calls and “aware” responses aren’t failing validation.

### C) Add missing read capability: Company Info
Right now we have:
- `get_solutions` (solutions table)
- `get_competitors` / `get_competitor_solutions`
…but **no `get_company_info` read tool**.

Add to `supabase/functions/enhanced-ai-chat/tools.ts`:
- New READ tool definition: `get_company_info`
- Implementation querying `company_info` for the authenticated user (service role client already exists in the function).

Update `TOOL_USAGE_MODULE` in `supabase/functions/enhanced-ai-chat/index.ts` to mention it in:
- “READ Tools” list
- Examples (“What’s my company description?” → `get_company_info`)

### D) Fix a gap in competitor lookups (name-based)
In `get_competitor_solutions` tool definition we accept `competitor_name`, but execution **currently ignores it**.
- Implement `competitor_name` filtering by joining/lookup:
  - Either: first query `company_competitors` to find matching competitor IDs, then fetch `competitor_solutions` by those IDs
  - Or: use the existing relationship in select to filter (depending on PostgREST constraints)

This makes “Tell me about competitor X’s offerings” work reliably.

### E) “Nuggets, not overload” (how we’ll keep it scalable)
Implement a **two-layer awareness strategy** in `enhanced-ai-chat`:

1) **Always-on tiny context (cheap, low tokens)**
- Counts + last activity (already exists)
- Add a minimal “business identity” snippet:
  - company name/industry/website (if present)
  - top 3 solution names
  - top 3 competitor names

2) **On-demand deep context via tools**
- When user asks about a specific offering (e.g., “GL Connect”), the assistant should:
  - call `get_solutions` with `name="GL Connect"` (already supported)
- When user asks “our competitors”, call `get_competitors limit=10 include_intelligence=true`
- When user asks for competitor product info, call `get_competitor_solutions competitor_name="..."`

This preserves responsiveness while staying “super aware” when needed.

### F) User-facing transparency: “What can you read from backend?”
Add a visible, repeatable way for you to see the AI’s data surface area:
- Add a Quick Action button in AI Chat like **“What can you access?”**
- It sends a predefined prompt that returns:
  - What modules the AI can read
  - The read tools available
  - Example questions mapped to tools
  - Note that it fetches “nuggets” on demand

(Optionally also support a slash command like `/data` or `/sources`.)

---

## Files we’ll touch
Frontend:
- `src/hooks/useEnhancedAIChatDB.ts` (switch default away from ai-streaming; fix tool-call payloads)
- `src/hooks/useUnifiedChatDB.ts` (fix `enhanced-ai-chat` payload)
- `src/services/enhancedAIService.ts` (stop sending invalid fields to `enhanced-ai-chat` or route that call elsewhere)
- `src/components/ai-chat/EnhancedQuickActions.tsx` (add “What can you access?” action)

Backend:
- `supabase/functions/enhanced-ai-chat/tools.ts` (add `get_company_info`; fix competitor_solutions name filter)
- `supabase/functions/enhanced-ai-chat/index.ts` (update TOOL_USAGE_MODULE + optional tiny always-on snippet)

---

## Acceptance checks (how we’ll verify)
1. In /ai-chat, asking **“Tell me about GL Connect”** results in:
   - A tool-backed answer (it calls `get_solutions name="GL Connect"`), not “I don’t have info”.
2. Asking **“What’s my company info?”** returns actual saved `company_info` values (or clearly says none exists).
3. Asking **“List my competitors”** returns real `company_competitors`.
4. Tool execution calls no longer fail with “Invalid input” (schema mismatch).
5. The “What can you access?” quick action produces a clear list of readable backend areas.

