

# AI Chat + Analyst — Definitive Implementation Plan

6 phases, 19 items. Each phase is self-contained and testable before moving to the next.

---

## Phase 1: AI Knows What To Do
**Backend only — `supabase/functions/enhanced-ai-chat/index.ts` + `tools.ts`**

4 prompt blocks added to the system prompt, 1 tool filtering fix:

1. **Priority Rules** — prepend to system prompt so user intent always wins over conflicting instructions. Includes chart decision tree (3+ data points = chart, 1-2 = text, 0 = explain) and tool calling decision tree (read = immediate, write-clear = immediate, write-vague = ask one question, destructive = confirm).

2. **Tool Disambiguation** — explicit routing table: "write a blog" → `generate_full_content`, "help me create" → `launch_content_wizard`, "make shorter" → `reformat_content`. Email always shows draft before sending. Social never auto-schedules.

3. **Result Presentation + Capability Boundaries** — never dump raw JSON, never echo HTML, lead with key finding. Honest about limitations (no rank tracking, no direct social posting, no analytics without config).

4. **Tool Filtering Fix** — replace the "if < 5 tools, show all 89" fallback with a core-tools fallback (5 essential tools). Hide deprecated `start_content_builder` and `create_content_item`. Remove dead `send_quick_email` from tools.ts.

---

## Phase 2: Provider Normalization + Smart Tokens
**Backend only — `ai-proxy/index.ts` + `enhanced-ai-chat/index.ts`**

1. **Normalize Gemini/Anthropic responses** — add `normalizeToOpenAIFormat()` function that translates Gemini's `candidates[0].content.parts` and Anthropic's `content[].text` into OpenAI's `choices[0].message.content` shape. Apply in each provider's handler return.

2. **Increase Gemini max tokens** — raise output cap from 16K to 32K for Gemini (it supports 65K). Other providers stay at 16K.

3. **Dynamic temperature** — data lookups get 0.2 (deterministic), conversational gets 0.4, content generation gets 0.8. No more random tool selection on repeated data queries.

---

## Phase 3: Fix Stale Context
**Backend only — `enhanced-ai-chat/index.ts`**

1. **Auto-update conversation goal** — when user switches from SEO to email topics, update the `goal` field in `ai_conversations` so the AI's persona and advice stay relevant.

2. **Brand voice override** — brand voice applies to content generation only. Conversational responses match user's tone. Explicit tone requests ("write casually") override brand voice.

3. **Data freshness note** — after 10+ messages, inject a note telling the AI that earlier data references may be stale and to acknowledge changes.

---

## Phase 4: Analyst ↔ AI Sync
**Frontend + Backend — most important phase**

1. **Pass analyst state to chat** — in `EnhancedChatInterface.tsx`, create `analystStateRef` that captures health score, warnings, strategic stance, user stage, goal progress. Pass via `useEnhancedAIChatDB` request body.

2. **Edge function reads analyst summary** — replace the current "ANALYST MODE" prompt block with a specific summary of what the sidebar shows (exact health score, warnings, stance). AI references these exact values instead of contradicting visible data.

3. **Refresh analyst after mutations** — when AI response contains action keywords (Created, Deleted, Published, etc.), trigger `analystState.triggerRefresh()` after 2-second delay so sidebar numbers update.

**Files:** `EnhancedChatInterface.tsx`, `useEnhancedAIChatDB.ts`, `enhanced-ai-chat/index.ts`

---

## Phase 5: Fix Analyst Data Accuracy
**Frontend only — `useAnalystEngine.ts`**

1. **CRITICAL: Add user_id filters** — `email_campaigns` and `content_performance_signals` queries are missing `.eq('user_id', userId)`. Data leak.

2. **Stable anomaly IDs** — replace `${now.getTime()}` suffixes with content-based IDs (`anomaly-low-seo` instead of `anomaly-low-seo-1711036800000`) to prevent duplicate entries.

3. **Stage-aware health targets** — starter users target 5 articles (not 15). Prevents discouraging "critical" scores for new users.

4. **Division by zero guard** — protect goal progress calculation when `target_value` is 0.

5. **Remove seasonal detection** — delete B2C seasonal topic warnings (valentine, christmas, etc.) that are irrelevant for B2B users.

6. **Fix goal progress field** — use `created_at` instead of `updated_at` to count genuinely new articles.

7. **Trajectory-aware recommendations** — if recent articles score well (60+) but old content drags the average below 45, recommend "accelerate" instead of "fix-quality".

---

## Phase 6: Session Memory Filtering
**Frontend only — `useAnalystEngine.ts`**

1. **Filter restored insights by topic** — yesterday's "SEO declining" warning shouldn't appear in today's email conversation. Critical/high urgency warnings always pass through regardless of topic.

---

## Implementation order

Each phase is independent and deployable. I recommend doing them in order (1→6) since Phase 1 has the highest user-facing impact and Phase 4 depends on understanding the patterns established in Phases 1-3.

**Total files changed: 6**
| File | Phases |
|------|--------|
| `supabase/functions/enhanced-ai-chat/index.ts` | 1, 2, 3, 4 |
| `supabase/functions/enhanced-ai-chat/tools.ts` | 1 |
| `supabase/functions/ai-proxy/index.ts` | 2 |
| `src/components/ai-chat/EnhancedChatInterface.tsx` | 4 |
| `src/hooks/useEnhancedAIChatDB.ts` | 4 |
| `src/hooks/useAnalystEngine.ts` | 5, 6 |

