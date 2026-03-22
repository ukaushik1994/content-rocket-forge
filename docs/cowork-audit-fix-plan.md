# Cowork UX Audit — Complete Fix Plan

> **Source:** Cowork Full UX Audit (15 Phase Reports + Summary), March 22, 2026
> **Total Issues Found:** 106 (8 Critical, 15 High, 38 Medium, 45 Low)
> **Plan:** 5 priority tiers, ordered by user impact

---

## TIER 0: CRITICAL — App Looks Broken (8 issues)

These make the tool appear non-functional. Fix immediately.

| ID | Page | Issue | Fix | Frontend | Backend |
|----|------|-------|-----|----------|---------|
| P12-01 | Journeys | **Canvas completely blank** — 8-node journey shows empty black canvas | Likely a ReactFlow rendering issue. Check if nodes/edges are loaded but not positioned. May need `reactFlowInstance.fitView()` on mount or default node positions. | `JourneyBuilder.tsx` — add fitView on initial load + verify node positions aren't all (0,0) | None |
| P4-01 | Proposals | **Raw JSON in Primary Keyword** — shows `{"keyword":"..."}` | Harden `normalizeKeyword()` to handle JSON strings, objects, and nested formats. Parse before display. | `ProposalCard.tsx` — strengthen normalizeKeyword to try JSON.parse on strings | None |
| P4-02 | Proposals | **Raw JSON in Related Keywords** — same issue for arrays | Apply normalizeKeyword to each item in related keywords array | `ProposalCard.tsx` — map related keywords through normalizeKeyword | None |
| P5-01 | Campaigns | **Blank screen on conversation submit** — white screen after sending message | The conversation handler likely navigates or crashes. Check `handleSubmit` → `onStartConversation`. May be creating an AI chat conversation that fails. | `Campaigns.tsx` / `CampaignsHero.tsx` — add try-catch around submit, show error toast instead of blank screen | None |
| P5-02 | Campaigns | **Stats show 4 Active but list is empty** — data source mismatch | Stats and list query different sources. Make both use the same `campaigns` array. | `Campaigns.tsx` — derive stats FROM the same array that renders the list | None |
| P8-01 | Email | **Inbox tab shows Sent content** — wrong tab renders | Tab key mapping or content component mismatch. Verify each tab key maps to correct component. | `EmailDashboard.tsx` — verify tab key → component mapping is correct | None |
| P8-02 | Email | **Drafts tab shows Scheduled content** — wrong tab renders | Same root cause as P8-01 | Same fix | None |
| P2-01 | Repository | **Create Content redirects to /ai-chat** — navigates away | This is by design (content creation IS in AI Chat). But should communicate it: button text should say "Create in AI Chat →" or open wizard inline. | `RepositoryHero.tsx` — change button text to "Create in AI Chat →" or open Content Wizard sidebar inline | None |

---

## TIER 1: HIGH — Features Don't Work As Expected (15 issues)

| ID | Page | Issue | Fix |
|----|------|-------|-----|
| P1-01 | Chat | Solution selection gives no visual feedback in wizard | Add `border-primary` + checkmark icon to selected solution option |
| P1-04 | Chat | Quick-action buttons have imprecise click targets | Increase button padding: `px-4 py-3` minimum, add `min-h-[44px]` |
| P1-06 | Chat | No loading indicator during AI responses | Already fixed — streaming shows progressive text. Verify InlineProgress component renders. |
| P2-02 | Repository | Edit Content redirects to /ai-chat | Change button to open inline edit form OR label "Edit in AI Chat →" |
| P3-01 | Approvals | /approvals returns 404 | Add redirect: `<Route path="/approvals" element={<Navigate to="/content-approval" replace />} />` in App.tsx |
| P3-02 | Approvals | Run Analysis button non-functional | Verify `handleAnalyzeContent()` handler is wired. May need to call `contentAiAnalysisService.reanalyze()` |
| P4-03 | Proposals | Status filter tabs don't filter | Verify `onStatusToggle` handler updates filter state AND the filtered array re-renders |
| P4-04 | Proposals | "Create Content" redirects to /ai-chat | Same as P2-01 — change label to "Create in AI Chat →" |
| P4-05 | Proposals | Reject button has no confirmation | Add AlertDialog confirmation before `rejectProposal.mutate()` |
| P5-03 | Campaigns | Suggestion chips don't populate input | Verify `onClick={() => setCampaignIdea(prompt)}` actually fires. May be a click target issue. |
| P5-04 | Campaigns | Settings gear icon non-functional | Verify `onClick={() => setShowSettings(!showSettings)}` opens `CampaignSettingsPanel` |
| P6-01 | Keywords | Write About This doesn't pre-fill AI Chat | Currently navigates with `?prompt=...` query param. Verify AI Chat reads and auto-sends the prompt param on mount. |
| P8-03 | Email | Templates tab initially shows Campaigns content | Tab default or first-render issue. May need `useEffect` to force correct tab content on mount. |
| P12-02 | Journeys | + Add Node button non-functional | Verify dropdown renders. May be a z-index or Popover issue preventing the dropdown from showing. |
| P14-01 | Calendar | + Add Content button non-functional | Verify `onClick={() => setDialogOpen(true)}` fires and `CalendarItemDialog` renders. May be a state issue. |

---

## TIER 2: MEDIUM — UX Issues (38 issues, top 15 listed)

| ID | Page | Issue | Fix |
|----|------|-------|-----|
| P1-02 | Chat | Stale drafts count mismatch between dashboard and wizard | Both should query same data source |
| P1-03 | Chat | Stat cards not clickable | Add onClick → navigate to relevant page |
| P1-07 | Chat | Sidebar auto-collapses unexpectedly | Check sidebar state persistence across navigation |
| P2-03 | Repository | Markdown preview not rendering | Use a markdown renderer (already have SafeMarkdown component) |
| P3-03 | Approvals | Stats count doesn't match displayed items | Derive stats from filtered array, not separate query |
| P3-04 | Approvals | Markdown raw display in analysis cards | Apply SafeMarkdown to AI analysis text |
| P4-06 | Proposals | Impression data appears static | Already fixed — SERP-backed estimates now used when available |
| P4-08 | Proposals | Proposal count mismatch between stats and grid | Same root cause as all count mismatches — use same data source |
| P5-05 | Campaigns | Stat cards not interactive | Add onClick navigation |
| P6-03 | Keywords | All keywords show Easy difficulty | Already fixed — estimateKeywordMetrics now computes from SERP data. May need SERP analysis run on each keyword. |
| P8-04 | Email | Merge tag chips don't insert text | Verify `insertVariable()` function. May be a cursor position issue. |
| P9-01 | Social | 'Pending_Integration' raw enum displayed | Replace underscores + title case: `status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())` |
| P11-01 | Automations | Three-dot menu non-functional | Verify DropdownMenu renders. May be z-index or portal issue. |
| P13-01 | Offerings | Progress bar shows 2/4 but all steps have content | Fix completion check logic — check if solutions exist + brand voice has tone |
| P14-02 | Calendar | Show Analytics button non-functional | Verify handler. May need to toggle analytics panel visibility. |

---

## TIER 3: LOW — Polish Items (45 issues, top 10 listed)

| ID | Page | Issue | Quick Fix |
|----|------|-------|-----------|
| P1-08 | Chat | No inline validation in wizard | Add `border-destructive` on empty required fields |
| P2-04 | Repository | Badge type explanations missing | Add `title` attribute to badges |
| P3-05 | Approvals | Missing tooltips on metric icons | Add `title` or Tooltip component |
| P4-10 | Proposals | "High Return" badge criteria unclear | Add tooltip: "Based on keyword volume and low competition" |
| P6-06 | Keywords | No keyword detail view | Add expandable detail or modal on card click |
| P8-08 | Email | Missing "Save as Draft" in Compose | Add "Save Draft" button alongside "Send" |
| P9-04 | Social | Missing character count in post composer | Add `{content.length}/280` counter per platform |
| P10-03 | Contacts | No CSV import format instructions | Add helper text: "Format: email, first_name, last_name, tags" |
| P12-07 | Journeys | Left sidebar icons have no labels | Add tooltips to each icon |
| P15-04 | Settings | No unsaved changes warning | Add `beforeunload` or tab-switch confirmation |

---

## TIER 4: RECURRING PLATFORM-WIDE ISSUES

| Issue | Pages Affected | Fix |
|-------|---------------|-----|
| **Slow page loads (2-5s)** | All 15 pages | Add `staleTime: 30000` and `gcTime: 300000` to all React Query hooks. Prevents re-fetching on repeat navigation. |
| **Stat cards never clickable** | Chat, Campaigns, Keywords, Analytics, Contacts, Social, Automations | Add `onClick={() => navigate('/relevant-page')}` + `cursor-pointer` to all stat card components |
| **Data count mismatches** | Campaigns, Proposals, Approvals, Analytics, Keywords | Root cause: stats computed from one query, list from another. Fix: derive stats FROM the list array. |
| **Buttons without handlers** | Calendar (+Add), Approvals (Run Analysis), Journeys (+Add Node) | Each is a separate bug — verify onClick handlers are connected. May be Popover/Dialog not rendering. |
| **Sidebar navigation unreliable** | Offerings, Journeys links | Verify `navigate()` calls in sidebar. May be event propagation issue with nested clickable elements. |
| **/content-calendar 404** | Calendar | Add `<Route path="/content-calendar" element={<Navigate to="/calendar" replace />} />` |
| **/approvals 404** | Approvals | Add `<Route path="/approvals" element={<Navigate to="/content-approval" replace />} />` |

---

## IMPLEMENTATION ORDER

| Priority | Items | Scope | Effort |
|----------|:-----:|-------|--------|
| **Tier 0** | 8 | Critical — app looks broken | 2-3 hours |
| **Tier 1** | 15 | High — features don't work | 2-3 hours |
| **Tier 2** | 15 (of 38) | Medium — UX issues | 2 hours |
| **Tier 3** | 10 (of 45) | Low — polish | 1 hour |
| **Tier 4** | 7 | Platform-wide recurring | 1 hour |
| **Total** | **55** | | **~8-10 hours** |

---

## WHAT WE ALREADY FIXED (before this audit)

| Cowork Finding | Our Status |
|---------------|-----------|
| Keyword difficulty all "Easy" | FIXED — estimateKeywordMetrics computes from SERP |
| Impression data static | FIXED — SERP-backed estimates |
| No bulk actions in Repository | FIXED — bulk archive + delete + partial failure reporting |
| Content Wizard validation | FIXED — toast.error on failures |
| Analytics empty state | FIXED — internal metrics shown as primary |
| Social "coming soon" messaging | FIXED — honesty banner (SB-6) |
| Contacts Tags/Segments explanation | FIXED — subtitle explains difference |
| Progress bar on Offerings | FIXED — 4-step labels + progress bar |
| Chat suggestions irrelevant | FIXED — removed regex, AI generates contextual follow-ups |
| Rate limiting | FIXED — 30 req/min |
| CORS lockdown | FIXED — no wildcard |
| Onboarding auto-trigger | FIXED — auto-extracts company + competitors |
| Repository infinite refresh | FIXED — useCallback deps |
| Dead code cleanup | FIXED — 6 files deleted |

---

## WHAT COWORK FOUND THAT WE MISSED

| Finding | Category | We Missed? |
|---------|----------|:----------:|
| Journey canvas blank | Critical | **YES** — we verified buttons work but didn't test canvas rendering |
| Campaign conversation crashes | Critical | **YES** — we tested quick setup but not conversation submit |
| Email tabs show wrong content | Critical | **YES** — we checked tab navigation works but not content correctness |
| Raw JSON in proposals | Critical | **YES** — we checked normalizeKeyword exists but didn't test with real data |
| Run Analysis button dead | High | **YES** — not in our button audit results |
| +Add Content on calendar dead | High | **YES** — our audit said WORKS but Cowork says non-functional |
| +Add Node on journeys dead | High | **YES** — our audit said WORKS but Cowork says non-functional |
| Sidebar links unreliable | Medium | **PARTIAL** — we found 404 routes but not click propagation issues |
| Merge tags don't insert | Medium | **YES** — not tested |
| 3-dot menus non-functional | Medium | **YES** — we said WORKS but Cowork found them dead |

**Key takeaway:** Our code audit verified handlers exist. Cowork's live testing found that some handlers exist but don't actually fire in the browser. This means there are **rendering/event propagation bugs** that are invisible in code review.
