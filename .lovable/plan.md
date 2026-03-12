

# Critique & Improved Plan: AI Chat Awareness Gaps

## Critique of Original Plan

### Errors Found

1. **Batch 2B: Wrong table name.** Plan says `saved_campaigns` — the actual table is `campaigns`. Would cause a runtime failure.

2. **Batch 2C: `update_social_post` and `schedule_social_post` are missing but `create_social_post` and `delete_social_post` already exist.** The plan says "verify they work" but doesn't acknowledge the existing code is in `engage-action-tools.ts`, not cross-module. Only `update` and `schedule` are truly new.

3. **Batch 2D: `create_email_template` already exists** in `engage-action-tools.ts` (line 319 shows it in ENGAGE_ACTION_TOOL_NAMES, and cache invalidation exists at line 502). Only `update_email_template` is new.

4. **Batch 5: `content_performance` table doesn't exist and no external API integration exists.** Creating a read tool that always returns empty is low value. Should be deferred or combined with Batch 6.

5. **Batch 4: SEO auto-integration is vague.** "Auto-trigger scoring" needs to specify WHERE the trigger goes — it's an edge function call that needs to happen inside the Content Wizard's save flow and the content-action-tools' `create_content_item`/`generate_full_content`.

6. **Batch 6: Brand Voice migration from localStorage to Supabase is risky.** Existing users would lose their settings. Needs a migration path that reads localStorage on first load and writes to Supabase.

7. **Batch 1: Glossary removal is incomplete.** Plan misses `RepositoryHeader.tsx` (line 19-23: "Build Glossary" button), `content-types.ts` (glossary in ContentType union), and the glossary context/reducer files.

### Structural Issues

- **Too many batches that touch `tools.ts` independently.** Batches 2, 5, and 6 all modify the same file. Should be grouped to avoid merge conflicts.
- **No mention of updating the system prompt in `index.ts`** when adding new tools (the AI won't know to use tools it doesn't know about).
- **Batch 3 (Repurpose sidebar) has no clear component.** Which repurposing component renders in the sidebar? There's `ContentRepurposingView` but it's a full page component, not sidebar-ready.

---

## Improved Plan

### Batch 1: Remove Glossary (cleanup)

Remove all glossary references from UI and AI tools:

| File | Change |
|------|--------|
| `App.tsx` | Remove `/glossary-builder` route |
| `ChatHistorySidebar.tsx` | Remove Glossary nav item |
| `RepositoryHeader.tsx` | Remove "Build Glossary" button |
| `tools.ts` | Remove `get_glossary_terms` from `NEW_READ_TOOL_NAMES` and `switch` case |
| `tools.ts` | Remove `create_glossary_term` from `WRITE_TOOL_CACHE_INVALIDATION` |
| `query-analyzer.ts` | Remove `needsGlossary` detection and `glossary` category push |
| `index.ts` (system prompt) | Remove glossary mentions from capabilities list |
| `content-action-tools.ts` | Remove `glossary` from `content_type` enum |
| `content-types.ts` | Remove `glossary` from `ContentType` union |
| `DashboardSummary.tsx` | Remove glossary stats |

Keep DB tables untouched. Keep context/reducer files (dead code, no harm).

### Batch 2: New Write Tools (all backend tool changes in one batch)

All tool additions in one batch to minimize `tools.ts` conflicts.

**2A: Proposal Actions** — New file `proposal-action-tools.ts`
- `accept_proposal` → Update `ai_strategy_proposals.status = 'scheduled'`, create `content_calendar` item
- `reject_proposal` → Update `status = 'dismissed'`
- `create_proposal` → Insert new row with title, keyword, description, content_type, priority_tag

**2B: Campaign Creation** — Add to `cross-module-tools.ts`
- `create_campaign` → Insert into `campaigns` table (not `saved_campaigns`) with name, solution_id, status='draft'

**2C: Social Posts** — Add to `engage-action-tools.ts`
- `update_social_post` → Update content, platforms, status by post_id
- `schedule_social_post` → Set `scheduled_at` + status='scheduled'
- (`create_social_post` and `delete_social_post` already exist — no changes needed)

**2D: Email Templates** — Add to `engage-action-tools.ts`
- `update_email_template` → Update name, subject, body, category by template_id
- (`create_email_template` already exists — no changes needed)

**2E: Strategy Recommendations** — Add to new `strategy-action-tools.ts`
- `accept_recommendation` → Update `strategy_recommendations.status = 'accepted'`
- `dismiss_recommendation` → Update `status = 'dismissed'`

**Registration (all at once in `tools.ts`):**
- Import new tool definition arrays and name arrays
- Add to `TOOL_DEFINITIONS` spread
- Add routing blocks in `executeToolCall`
- Add cache invalidation entries:
  - `accept_proposal` / `reject_proposal` / `create_proposal` → invalidate `get_proposals`
  - `create_campaign` → invalidate `get_campaign_intelligence`
  - `update_social_post` / `schedule_social_post` → invalidate `get_social_posts`
  - `update_email_template` → invalidate `get_email_templates`
  - `accept_recommendation` / `dismiss_recommendation` → invalidate `get_strategy_recommendations`

**Update `query-analyzer.ts`:**
- Add intent patterns: "accept proposal", "reject proposal", "create campaign", "update social post", "schedule post", "accept recommendation", "dismiss recommendation"

**Update system prompt in `index.ts`:**
- Add new tools to capabilities list so AI knows they exist

### Batch 3: Repurpose Content Sidebar

- Add `content-repurpose` type check in `VisualizationSidebar.tsx`
- Create a new lightweight `RepurposePanel.tsx` that wraps the existing repurposing format selection + generation UI (from `ContentRepurposingView`) in a sidebar-compatible layout
- Wire `query-analyzer.ts` to detect "repurpose" intent and return `{ type: 'content-repurpose', contentId }` visualization
- Add "Repurpose" button at end of Content Wizard final step (verify `ContentRepurposingCard` exists)
- Add "Repurpose" button in Proposal Browser after content is generated

### Batch 4: SEO Auto-Scoring

- In `content-action-tools.ts` → after `create_content_item` and `generate_full_content` succeed, invoke the SEO scoring edge function with the new content_id
- In Content Wizard save handler → trigger SEO score after save
- Surface score badge on content cards (verify existing `seo_score` field renders)

### Batch 5: Analytics + Brand Voice (combined — both need DB migration + tool)

**Analytics (API-Ready):**
- Add `get_content_performance` read tool that checks if external API keys exist. If not, returns message "Connect Google Analytics or Search Console in Settings to see performance data"
- No DB migration needed — just a tool that checks `ai_service_providers` or a settings table for API keys
- Add intent detection for "how is my content performing?"

**Brand Voice:**
- Create `user_brand_settings` table (user_id UUID PK references auth.users, tone text, voice_style text, writing_preferences text, custom_instructions text, updated_at timestamptz)
- Add `get_brand_voice` read tool
- Add `update_brand_voice` write tool
- On frontend: when `FormatPromptSettings` saves, also write to Supabase table
- In `index.ts` system prompt: include brand voice in identity snippet if available
- Migration path: on first load of Settings > Prompts, check localStorage for existing templates and sync to Supabase

---

### Implementation Order

1. **Batch 1** — Glossary removal (15 min, reduces noise)
2. **Batch 2** — All write tools + registration (largest, ~8 new tools)
3. **Batch 3** — Repurpose sidebar (UI wiring)
4. **Batch 4** — SEO auto-scoring (cross-cutting)
5. **Batch 5** — Analytics scaffold + Brand Voice (DB + tools)

Reduced from 6 batches to 5 by combining Analytics + Brand Voice (both are DB migration + tool pattern).

