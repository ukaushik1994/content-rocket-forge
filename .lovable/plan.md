

# Final Remaining Items — 13 Items, 5 Phases

---

## Phase A: Core Missing Tools (3 items)

**A1 — `improve_content` tool**
- Add `handleImproveContent` function to `content-action-tools.ts`: fetches content by ID, snapshots to `content_versions`, builds improvement prompt with scope (full/intro/conclusion/specific_section), calls AI, rescores SEO, saves updated content
- Add tool definition to TOOL_DEFINITIONS array
- Register in `tools.ts` under CONTENT category

**A2 — `reformat_content` tool**
- Add `handleReformatContent` to `content-action-tools.ts`: same fetch/snapshot pattern, target-specific prompts (shorter/longer/casual/formal/bullets/simplify), optional word count target
- Add tool definition + register in `tools.ts`

**A3 — AI-generated meta descriptions**
- In `content-action-tools.ts`, replace the `substring(0, 152)` truncation for meta descriptions with an AI call that generates a compelling hook (max 155 chars) and optimized meta title (max 60 chars)
- Keep truncation as fallback if AI call fails

---

## Phase B: Post-Action Intelligence (2 items)

**B1 — Post-publish distribution suggestions**
- In `cross-module-tools.ts`, after successful `publish_to_website`, return `actions` array with 3 buttons: "Create social posts", "Email to subscribers", "Done for now"
- Each action triggers a follow-up chat message

**B2 — Cannibalization check becomes blocking**
- In `content-action-tools.ts` `generate_full_content`, when 2+ articles target the same keyword, return early with `requiresConfirmation: true` and 3 action buttons (write anyway, update existing, suggest alternative keyword)
- Remove the existing warning-only code

---

## Phase C: Chat Reliability (3 items)

**C1 — Session refresh before message send**
- In `useEnhancedAIChatDB.ts` `sendMessage`, call `supabase.auth.getSession()` + `refreshSession()` before the fetch to prevent stale token errors

**C2 — API key test alignment**
- Find the API key test component, change from `supabase.functions.invoke()` to raw `fetch()` matching the same pattern used in `useEnhancedAIChatDB.ts`

**C3 — Pinned messages visual indicator**
- In `EnhancedMessageBubble.tsx`, add amber left border + small "Pinned" label with Pin icon when `message.is_pinned` is true

---

## Phase D: Monthly Summary + Freshness (2 items)

**D1 — `get_monthly_summary` tool**
- Add to `brand-analytics-tools.ts`: queries content_items, keywords, proposals, calendar for the target month, computes stats (created, published, avg SEO, top 3 articles)
- Register in `tools.ts`

**D2 — `last_reviewed_at` freshness tracking**
- **DB migration**: Add `last_reviewed_at timestamptz` to `content_items`, backfill from `updated_at`
- In `ContentDetailView.tsx`, update `last_reviewed_at` on open via useEffect
- In `useAnalystEngine.ts`, add anomaly for published content not reviewed in 90+ days

---

## Phase E: Cleanup (2 items)

**E1 — Delete orphan file**
- Delete `src/components/ai-chat/RealTimeCollaboration.tsx` (unused)

**E2 — Traffic "(est.)" suffix**
- In `ProposalCard.tsx` and any other component displaying `estimated_impressions`, append `(est.)` suffix to the number

---

## Execution

| Phase | Items | Deploy |
|-------|-------|--------|
| A | A1, A2, A3 | Edge fn deploy |
| B | B1, B2 | Edge fn deploy |
| C | C1, C2, C3 | Frontend only |
| D | D1, D2 | Migration + edge fn + frontend |
| E | E1, E2 | Frontend only |

Each phase completes fully before the next starts. Edge function deploys after each backend phase.

