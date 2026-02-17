

# AI Chat Action Engine: Gaps & Completion Plan

## What's Already Done (Backend - 100% Complete)
All 37 action tools are fully implemented and wired in the edge function:
- content-action-tools.ts (8 tools)
- keyword-action-tools.ts (5 tools)
- offerings-action-tools.ts (7 tools)
- engage-action-tools.ts (12 tools)
- cross-module-tools.ts (5 tools)
- tools.ts routing + query-analyzer.ts intent detection + index.ts system prompt

## What's Missing (5 Gaps)

### Gap 1: Edge Function Deployment
The `enhanced-ai-chat` function needs to be redeployed to include all the new tool module files. Without deployment, none of the 37 new tools are live.

**Fix:** Deploy the edge function.

---

### Gap 2: Frontend Action Response Handler
The `useEnhancedAIChat.tsx` hook only handles `send_message` and `navigate` action types from `contextualActions`. When a write tool (like `start_content_builder`) returns an `action` object embedded in the tool result, the frontend doesn't process it.

**Fix:** Update `useEnhancedAIChat.tsx` to:
1. Parse tool action responses from the AI's response (actions that come back with `type: 'navigate'` and `payload`)
2. Handle `navigate` actions that include payload data by writing to `sessionStorage` before navigating

---

### Gap 3: Content Builder SessionStorage Bridge
The `start_content_builder` tool returns `{ action: { type: 'navigate', url: '/content-builder', payload: { keyword, solution_id, suggested_title } } }`. The Content Builder page needs to read this data on mount.

**Fix:**
1. In `useEnhancedAIChat.tsx` `handleAction`: When navigating to `/content-builder` with a payload, store it in `sessionStorage` under a key like `ai_chat_builder_payload`
2. In the Content Builder page component: On mount, check for and consume the `sessionStorage` payload to pre-fill the keyword, solution, and title fields

---

### Gap 4: Cache Invalidation for Write Operations
Tool results are cached for 5 minutes. After a write operation (create, update, delete), the cached read results for that module become stale.

**Fix:** In `tools.ts`, after routing to any write tool handler, clear relevant cache entries. For example, after `create_content_item` succeeds, invalidate all `get_content_items` cache entries for that user.

---

### Gap 5: Destructive Action Confirmation
When the AI calls `delete_content_item`, `send_email_campaign`, or `toggle_automation`, the action executes immediately without user confirmation. This is risky for production data.

**Fix:** Add a confirmation pattern:
1. Define a list of "destructive" tool names in `index.ts`
2. When the AI wants to call a destructive tool, instead of executing immediately, return a confirmation prompt in the response with a special action button
3. The frontend renders a "Confirm" button; clicking it sends a follow-up message that triggers the actual execution

---

## Files to Modify

| File | Change |
|---|---|
| `supabase/functions/enhanced-ai-chat/tools.ts` | Add cache invalidation after write tool execution |
| `supabase/functions/enhanced-ai-chat/index.ts` | Add destructive action confirmation logic |
| `src/hooks/useEnhancedAIChat.tsx` | Expand `handleAction` to process tool action responses with payloads + sessionStorage bridge |
| Content Builder page (TBD) | Read and consume `sessionStorage` AI payload on mount |

## Files to Deploy
- `enhanced-ai-chat` edge function (redeploy with all new tool files)

## No Database Changes Required

## Implementation Order
1. Deploy edge function (makes all 37 tools live)
2. Cache invalidation (prevents stale data after writes)
3. Frontend action handler expansion (enables navigation with payload)
4. Content Builder sessionStorage bridge (enables AI-to-builder handoff)
5. Destructive action confirmation (safety layer)

