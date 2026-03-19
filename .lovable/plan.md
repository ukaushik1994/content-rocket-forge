

# AI Chat & Analyst — 16 Fixes in 5 Phases

40 issues from a fresh audit, consolidated into 16 implementable fixes. Each fix references specific files and the exact changes needed.

---

## Phase 1: Performance & Quality (Fixes 1, 2, 5) — Backend Only

**Highest immediate impact: faster responses, better SEO scores, and informed wait times.**

### Fix 1: System Prompt Compression
**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Currently, the overhaul sections (Workflow Protocol at line ~2913, Content Matching at line ~2962) are appended unconditionally. Make them conditional:
- **Pushback Protocol** (line 2898): Already conditional on `hasWriteIntent` — confirmed good
- **Workflow Protocol** (line 2912): Gate behind `isMultiStep` intent check — currently always appended
- **Content Matching** (line 2961): Gate behind regex for content-referencing queries ("my article", "the one about")
- **Session Checkpoint** (line 2973): Already conditional — confirmed good
- **Trade-Off** (line 2950): Already conditional — confirmed good
- Net reduction: ~3000 tokens for simple queries

### Fix 2: SEO Scoring Overhaul
**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` (lines 9-55)

Replace `calculateBasicSeoScore` with a more generous scorer that rewards structure AI actually produces: Key Takeaways (+10), FAQ section (+10), lists (+10), generous content length thresholds. Max 100. Well-structured AI content should score 60-80 instead of 15-25.

### Fix 5: Tool-Aware Progress Messages
**File:** `supabase/functions/enhanced-ai-chat/index.ts` (around lines 3416-3420)

Replace generic `emitProgress('tools', 'Executing actions...')` with tool-specific messages from a `TOOL_TIME_ESTIMATES` map (e.g., "Generating article (~20-30s)...", "Running SERP analysis (~10s)...").

---

## Phase 2: Edit Tracking, Data Reuse & Scanability (Fixes 3, 10, 13)

### Fix 3: Wire Edit Tracking Into Repository
**File:** `src/components/content/repository/EnhancedContentEditForm.tsx`

Import `trackContentEdit` from `src/services/contentFeedbackService.ts` and call it in the save handler when original differs from edited content and the item was AI-generated.

### Fix 10: AI Reuses Data From Earlier in Conversation
**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Before the AI call, check if recent assistant messages contain tool results. If so, append a short prompt instruction telling the AI to reference previous responses instead of re-fetching.

### Fix 13: Long Response Scanability
**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Append a brief formatting instruction to the system prompt: "For responses over 200 words, use H2/H3 headings, bold key numbers, bullet points for 3+ items."

---

## Phase 3: Resilience & Real-Time Updates (Fixes 6, 14, 16)

### Fix 6: Auto-Retry on Rate Limit
**File:** `src/hooks/useEnhancedAIChatDB.ts`

In the rate-limit catch block, show a "Retrying in 30 seconds..." message with a countdown and "Retry Now" / "Cancel" action buttons. Auto-retry via `setTimeout` with cleanup.

### Fix 14: Health Score Real-Time Refresh
**File:** `src/hooks/useAnalystEngine.ts`

Add a 60-second interval that calls `fetchPlatformData(true)` while the analyst is active. Expose a `triggerRefresh` callback for the chat interface to call after write tool success.

### Fix 16: Wizard Auto-Save Generated Content
**File:** `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`

Auto-save generated content to localStorage on change. On mount, check for a backup less than 30 minutes old and show a recovery prompt (Restore / Discard). Clear backup after successful DB save.

---

## Phase 4: Analyst Topic React, Compare Tool & Wizard Context (Fixes 4, 15, 11)

### Fix 4: Analyst Reacts to Current Conversation Topic
**File:** `src/components/ai-chat/analyst-sections/AnalystNarrativeTimeline.tsx`

Implement topic-aware section reordering: assign a `relevance` score to each section based on whether its category matches `analystState.topics`. Sort sections by relevance (stance/health always first).

**File:** `src/hooks/useAnalystEngine.ts`

Add `messages.length` to the cross-signals useEffect dependency array so signals refresh mid-session as new messages arrive.

### Fix 15: compare_content Tool
**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts`

Add `compare_content` tool definition and handler: queries `content_items`, computes SEO scores, word counts, heading counts, FAQ presence, age. Returns structured comparison. Register in the tools array.

### Fix 11: Content Wizard Receives Chat Context
**File:** `src/components/ai-chat/EnhancedChatInterface.tsx`

When launching the wizard, pass `conversationContext` (recent topics, detected keyword, conversation goal) to the visualization state.

**File:** `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx`

On mount, use `conversationContext` to pre-fill the wizard keyword field if available.

---

## Phase 5: Standing Instructions, Notifications, Deadlines & Tags (Fixes 7, 8, 9, 12)

### Fix 7: Standing User Instructions
**DB Migration:** Create `user_instructions` table (id, user_id, instruction, category, is_active, created_at) with RLS.

**Backend** (`index.ts`): Fetch active user instructions and append as "STANDING INSTRUCTIONS" section in system prompt.

**Frontend:** Add a "Custom Instructions" UI in the settings area — textarea with save button. Also detect "Remember: ..." pattern in chat to offer saving as standing instruction.

### Fix 8: Notification Auto-Resolve
**DB Migration:** Add `status TEXT DEFAULT 'active'` column to `dashboard_alerts` if not present.

**Backend** (`generate-proactive-insights/index.ts`): After generating insights, mark notifications as "resolved" when their underlying condition no longer exists (e.g., no stale drafts → resolve stale draft alerts).

**Frontend** (`RealtimeNotificationCenter.tsx`): Filter out `status = 'resolved'` from the default view.

### Fix 9: Missed Deadline Detection
**Backend** (`generate-proactive-insights/index.ts`): Query `content_calendar` for items with `scheduled_date < yesterday` still in `planned`/`in_progress` status. Push as high-priority (85) recommendations with action prompt.

### Fix 12: Conversation Tagging UI
**File:** `src/components/ai-chat/ChatHistorySidebar.tsx`

Add "Add Tag" to the conversation context menu. Show a small popover with text input and existing tags as removable chips. Wire to existing `addTagToConversation` / `removeTagFromConversation` hooks.

Add tag-based search: when search term starts with `#`, filter conversations by tag match.

---

## Summary

| Phase | Fixes | Backend | Frontend | DB | Key Impact |
|-------|-------|---------|----------|----|------------|
| 1 | 1, 2, 5 | Prompt compression + SEO scorer + progress | None | None | Faster responses, better scores |
| 2 | 3, 10, 13 | Prompt tweak | Edit tracking wiring | None | Learning loop + efficiency |
| 3 | 6, 14, 16 | None | Auto-retry + health refresh + wizard save | None | Resilience + real-time |
| 4 | 4, 15, 11 | New tool | Section reorder + wizard context | None | Smarter analyst + comparison |
| 5 | 7, 8, 9, 12 | Instructions + deadline + resolve | Settings UI + tag UI + notification filter | 1 table + 1 column | Personalization + lifecycle |

