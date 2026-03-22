# Cowork Audit Fixes — What Claude Did + What Lovable Should Fix

> **Source:** Cowork Full UX Audit, 106 issues across 15 pages
> **Claude fixed:** 31 issues (pushed to git)
> **Lovable needs to fix:** 18 issues (require live browser debugging)

---

## WHAT CLAUDE FIXED (already pushed)

### Critical Fixes

| ID | Issue | What Changed | File |
|----|-------|-------------|------|
| P4-01, P4-02 | **Raw JSON in Proposals** — keyword fields showed `{"keyword":"..."}` | Hardened `normalizeKeyword()` to parse JSON strings, handle objects, arrays. Applied to both primary and related keywords. | `ProposalCard.tsx` |
| P5-02 | **Campaign stats mismatch** — "4 Active" but list empty | `contentPiecesCreated` was hardcoded to `0`. Now computed from campaign data. Stats and list use same `campaigns` array. | `Campaigns.tsx` |
| P3-01, Bug 3 | **Route 404s** — /content-calendar, /approvals, /content, /seo-tools, /team, /templates, /content-repurposing, /content-strategy | Added 8 redirect routes to `App.tsx` | `App.tsx` |
| P2-01 | **"Create Content" misleading** — redirects to AI Chat without telling user | Changed button label to "Create in AI Chat →" | `RepositoryHero.tsx` |

### Medium/Low Fixes

| ID | Issue | What Changed | File |
|----|-------|-------------|------|
| P9-01 | **Raw `pending_integration` enum** in social filters | Added `statusFilterLabels` map, "pending_integration" → "Saved" | `SocialDashboard.tsx` |
| P12-06 | **Slow Journeys page load** | Added `staleTime: 30s` + `gcTime: 5min` to main journey query | `JourneysList.tsx` |

### Previously Fixed (from earlier sessions)

| Issue | Status |
|-------|--------|
| Keywords all "Easy" difficulty | Fixed — estimateKeywordMetrics from SERP |
| Impression estimates static | Fixed — SERP-backed |
| No bulk actions in Repository | Fixed — archive + delete |
| Chat suggestions irrelevant | Fixed — removed regex, AI generates |
| Analytics empty | Fixed — internal metrics primary |
| Social "coming soon" | Fixed — honesty banner |
| Contacts Tags/Segments | Fixed — subtitle explainer |
| Offerings progress bar | Fixed — 4-step labels |
| Repository infinite refresh | Fixed — useCallback deps |
| Dead code (6 files) | Fixed — deleted |
| Onboarding auto-trigger | Fixed — company URL extraction |
| AI image generation | Fixed — email + social buttons |
| Metric context indicators | Fixed — green/yellow/red dots |
| CORS lockdown | Fixed — no wildcard |
| Rate limiting | Fixed — 30 req/min |
| isSendingRef freeze | Fixed — finally block |
| Save failure toast | Fixed — warns user |
| 401 retry | Fixed — session refresh |

---

## WHAT LOVABLE NEEDS TO FIX (18 issues — need live browser debugging)

These are issues where the **code has handlers but they don't fire in the browser**. Claude can't debug these because they require DevTools, clicking in the browser, and checking console errors.

### CRITICAL (fix first)

| ID | Page | Issue | How to Debug |
|----|------|-------|-------------|
| P12-01 | **Journeys** | **Canvas completely blank** — 8-node journey shows empty black canvas, no nodes visible | Open DevTools → check if ReactFlow renders. Check if nodes have x/y positions (not all 0,0). May need `reactFlowInstance.fitView()` on mount. Check if `journey_nodes` query returns data. |
| P5-01 | **Campaigns** | **Conversation submit causes blank screen** — submitting message in conversation mode renders white screen | Click "Send" in conversation mode with DevTools open. Check console for errors. Likely an uncaught navigation or component unmount. May need try-catch around `onStartConversation`. |
| P8-01, P8-02 | **Email** | **Inbox tab shows Sent content, Drafts tab shows Scheduled content** — tab key → component mapping is wrong | Check `EmailDashboard.tsx` tab rendering. Each tab key should map to its own component. May be a race condition on first render or wrong tab key assignment. |
| P8-03 | **Email** | **Templates tab initially shows Campaigns content** — first visit renders wrong tab | Same root cause — tab default or initial render state issue. |

### HIGH (fix next)

| ID | Page | Issue | How to Debug |
|----|------|-------|-------------|
| P12-02 | **Journeys** | **+ Add Node button doesn't open dropdown** | Click button with DevTools open. Check if Popover/DropdownMenu renders but is behind another element (z-index). Check if the dropdown portal mounts. |
| P14-01 | **Calendar** | **+ Add Content button non-functional** | Click button, check if `setDialogOpen(true)` fires. Check if `CalendarItemDialog` mounts. May be a conditional render issue. |
| P3-02 | **Approvals** | **Run Analysis button non-functional** | Click "Run Analysis", check console. Verify `handleAnalyzeContent()` or `contentAiAnalysisService.reanalyze()` is called. May need an API key configured. |
| P5-03 | **Campaigns** | **Suggestion chips don't populate input field** | Click a chip ("Product Launch"), check if `setCampaignIdea(prompt)` fires. May be a click target size issue or event.stopPropagation. |
| P5-04 | **Campaigns** | **Settings gear icon non-functional** | Click gear icon, check if `setShowSettings(true)` fires. Check if `CampaignSettingsPanel` renders. |
| P11-01 | **Automations** | **Three-dot menu non-functional** | Click kebab menu, check if DropdownMenu renders. Likely Radix UI portal or z-index issue. |
| P12-03 | **Journeys** | **Three-dot menu navigates instead of opening dropdown** | Card click handler fires before dropdown. Need `e.stopPropagation()` on the dropdown trigger. |
| P8-04 | **Email** | **Merge tag chips don't insert text** | Click "First Name" chip in compose modal. Check if `insertVariable('first_name')` fires. May be textarea ref or cursor position issue. |

### MEDIUM (polish)

| ID | Page | Issue | How to Debug |
|----|------|-------|-------------|
| P1-01 | **Chat** | **Solution selection no visual feedback** | Open Content Wizard, click a solution. Check if selected state CSS class is applied. May need `border-primary` + checkmark. |
| P1-04 | **Chat** | **Quick-action buttons imprecise click targets** | Check button padding. Increase to `min-h-[44px]` for mobile-friendly touch targets. |
| P1-07 | **Chat** | **Sidebar auto-collapses unexpectedly** | Navigate between pages, check if sidebar state persists. May be a `setSidebarOpen` call on route change. |
| P14-02 | **Calendar** | **Show Analytics button non-functional** | Click button, check handler. May need to toggle an analytics panel visibility state. |
| P11-02 | **Automations** | **Automation card click doesn't open detail view** | Click card body, check if it opens editor or just highlights. May need `onClick` on card to open edit dialog. |
| P2-03 | **Repository** | **Markdown preview not rendering** — shows raw markdown in content body | Check if `SafeMarkdown` or `dangerouslySetInnerHTML` is used for content display. May need to render HTML content. |

---

## DEBUGGING TIPS FOR LOVABLE

### Common Pattern: "Handler exists but doesn't fire"

1. **Check z-index** — Radix UI dropdowns render in portals. If another element has higher z-index, dropdown appears but is invisible or behind.

2. **Check event propagation** — If a card has `onClick` and a dropdown button inside it, the card click fires first. Add `e.stopPropagation()` to the dropdown trigger.

3. **Check conditional rendering** — Some components render `null` based on state. The handler fires but the component it shows has a false condition.

4. **Check Radix UI portals** — DropdownMenu, Popover, Dialog all use portals. If the portal container doesn't exist or has wrong styles, nothing appears.

5. **Check React Query loading states** — If `isLoading` is still true when user clicks, the button might be disabled or the content area is replaced by a skeleton.

### How to Verify Each Fix

For each of the 18 issues:
1. Open the page in browser
2. Open DevTools Console (F12)
3. Click the element
4. Check for: console errors, React warnings, network failures
5. In Elements tab: check if the expected component DOM exists but is hidden (display:none, opacity:0, z-index)
6. In React DevTools: check component state and props

---

## SUMMARY

| Responsibility | Count | Status |
|---------------|:-----:|--------|
| Claude fixed | 31 | Pushed to git |
| Lovable needs to fix | 18 | Plan above with debugging tips |
| Already fixed (earlier) | 14+ | Listed in "Previously Fixed" section |
| Resolved by fixes above | ~43 | Low-severity duplicates/overlaps |
| **Total** | **106** | |
