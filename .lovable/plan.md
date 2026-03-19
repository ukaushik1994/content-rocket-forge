

# AI Chat Overhaul — 15 Fixes in 5 Phases

The document identifies 40 problems consolidated into 15 fixes that transform the AI Chat from a passive tool into an adaptive, context-aware strategist. Most fixes are backend system prompt additions to the edge function. A few require frontend changes.

---

## Phase 1: Response Intelligence (Fixes 1, 2, 6) — Backend Only

All three are system prompt additions in `supabase/functions/enhanced-ai-chat/index.ts`. No frontend changes.

### Fix 1: Response Calibration Per Query Complexity
Replace the simple `lengthGuidance` block (line ~2799) with a full calibration system that detects:
- **Urgency** via keyword matching (fail/error/broken → URGENT mode, under 100 words)
- **Rapid-fire mode** when avg user message < 50 chars and 3+ messages → EXECUTION mode
- **Conversational** scope → BRIEF mode (1-3 sentences, no charts)
- **Summary** scope → COMPACT mode (under 150 words, chart only if 3+ data points)
- **Detailed/Full** scope → THOROUGH mode (charts, metrics, 300-600 words)

### Fix 2: Strategic Pushback Before Execution
Append `PUSHBACK_PROTOCOL` to system prompt — 5 mandatory checks before any write tool: prerequisites, brand relevance, ambiguity clarification, browse-vs-execute distinction, exploration-vs-decision detection. Bypass when user says "just do it."

### Fix 6: Task-Adaptive Persona
After query intent detection, inject a persona string based on regex matching: Creative Strategist (content writing), Technical Diagnostician (errors), Data Analyst (metrics), Strategy Consultant (campaigns), Marketing Operator (email/social).

**Files:** `supabase/functions/enhanced-ai-chat/index.ts`

---

## Phase 2: Conversational Intelligence (Fixes 3, 7, 12) — Backend Only

Three more system prompt additions. No frontend.

### Fix 3: End-to-End Workflow Orchestration
Append `WORKFLOW_PROTOCOL` — after any significant action, suggest the next logical step (content created → schedule/social/email). Multi-step workflows execute one step at a time with user checkpoints. Batch operations parse lists and confirm.

### Fix 7: Real-Time Feedback Loop
Detect correction patterns in last 5 user messages (shorter/longer/technical/simpler/rejected). Append `IN-SESSION CORRECTIONS` block. Also detect edit-in-place requests ("make it more technical") and inject `EDIT MODE` instruction to modify previous response surgically, not regenerate.

### Fix 12: Trade-Off Reasoning
Append `TRADE-OFF REASONING` — when user asks "X or Y?", provide structured comparison with data. When executing tools, explain one key decision ("I chose how-to format because your how-tos average 62 SEO vs 41 for listicles").

**Files:** `supabase/functions/enhanced-ai-chat/index.ts`

---

## Phase 3: Proactive Intelligence (Fixes 5, 8, 9) — Backend + Frontend

### Fix 5: Proactive Opening With Agenda
- **Backend** (`supabase/functions/generate-proactive-insights/index.ts`): Add `priority_score` (0-100) to each recommendation based on type (failed campaigns = 95, ready-to-publish drafts = 80, empty calendar = 75, stale competitors = 60).
- **Frontend** (`src/components/ai-chat/EnhancedChatInterface.tsx`): Change proactive recommendations display from badges to a prioritized "Needs your attention" action list, top item highlighted with a Priority badge.

### Fix 8: Smart Quick Actions Based on User State
- **Frontend** (`src/components/ai-chat/EnhancedQuickActions.tsx`): Replace static `suggestions` array with data-driven actions. Accept `recommendations`, `contentCount`, `publishedCount`, `draftCount` props. Show proactive recommendations first, then state-based actions (0 content → "Create first article", too many drafts → "Review N drafts"), then milestone celebrations (10/25/50 articles), then contextual defaults.
- **Frontend** (`src/components/ai-chat/EnhancedChatInterface.tsx`): Pass content counts and recommendations to `EnhancedQuickActions`.

### Fix 9: Conversation Outcome Tracking
- **Backend** (`supabase/functions/enhanced-ai-chat/index.ts`): After successful tool execution, generate `suggestedTitle` from tool names. Every 8 messages, inject `SESSION CHECKPOINT` instruction for a 1-2 sentence progress summary.
- **Frontend** (`src/hooks/useEnhancedAIChatDB.ts`): When response includes `suggestedTitle`, update conversation title if current title is the default truncated version.

**Files:** `index.ts` (edge function), `generate-proactive-insights/index.ts`, `EnhancedChatInterface.tsx`, `EnhancedQuickActions.tsx`, `useEnhancedAIChatDB.ts`

---

## Phase 4: Safety and Matching (Fixes 10, 11, 13) — Backend Only

### Fix 10: Prerequisite Checking Before Promises
In `index.ts`, before building the system prompt, query `api_keys` and `website_connections` for the user. Build a `SERVICE STATUS` block listing unconfigured services (SERP, Resend, WordPress). Inject into system prompt so the AI warns before attempting unavailable tools.

### Fix 11: Fuzzy Content Matching by Name
Append `CONTENT MATCHING` instructions to system prompt — when user references content by name, use `get_content_items` to search. 1 match → proceed, 2-3 → disambiguate, 0 → suggest browsing. Never guess with multiple matches.

### Fix 13: Undo and Safety Net
In `supabase/functions/enhanced-ai-chat/content-action-tools.ts`, update tool response messages for `delete_content_item` and `update_content_item` to include undo hints ("say 'restore [title]' to bring it back" / "say 'show version history'").

**Files:** `index.ts`, `content-action-tools.ts`

---

## Phase 5: Memory and Advanced Tools (Fixes 4, 14, 15) — Backend + DB Migration

### Fix 4: Cross-Conversation Intelligence
- **DB migration:** Add `strategic_context JSONB DEFAULT '[]'` column to `user_intelligence_profile`.
- **Backend** (`supabase/functions/shared/userIntelligence.ts`): In `rebuildUserProfile`, extract goals and summaries from last 5 conversations. Store as `strategic_context`. In `getUserIntelligenceContext`, include top 3 strategic context items in the prompt.

### Fix 14: Workflow Resumption
- **Backend** (`index.ts`): At conversation start, check last 3 messages for `function_calls`. If last action was content generation → inject `WORKFLOW CONTEXT` nudge. If analytical → inject analysis context. The AI asks whether to resume or start fresh.

### Fix 15: Cross-Content Comparison and Computation
- **Backend** (`content-action-tools.ts`): Add new `compare_content` tool definition accepting `content_ids` or `search_query`. Handler queries `content_items`, computes SEO scores, word counts, heading counts, FAQ presence, and age. Returns structured comparison with `visualData` bar chart for the existing `VisualDataRenderer`.
- **Backend** (`tools.ts`): Register the new tool in the tools array.

**Files:** `index.ts`, `content-action-tools.ts`, `tools.ts`, `shared/userIntelligence.ts`, DB migration

---

## Summary

| Phase | Fixes | Backend | Frontend | DB | Effort |
|-------|-------|---------|----------|----|--------|
| 1 | 1, 2, 6 | System prompt additions | None | None | Low |
| 2 | 3, 7, 12 | System prompt additions | None | None | Low |
| 3 | 5, 8, 9 | Proactive insights + title suggestion | Quick actions + title update | None | Medium |
| 4 | 10, 11, 13 | Prerequisite checks + undo hints | None | None | Low |
| 5 | 4, 14, 15 | Intelligence profile + workflow resume + new tool | None | 1 migration | Medium |

