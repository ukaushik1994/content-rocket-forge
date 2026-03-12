

# AI Chat Sidebar Strategy — Simple Rules for Each Module

## Current State
- All 11 panels already exist in code and are wired in `VisualizationSidebar.tsx`
- The AI returns `visualData.type = "repository"` etc. to open them
- **Problem**: The AI system prompt has ZERO rules about when to open panels vs answer in text vs navigate to full page
- The panels are full mirrors of pages (heavy) — not quick-access views

## Your Vision (Confirmed)
- Left sidebar navigation = always manual, no AI involvement
- AI chat = opens **right sidebar** for quick actions only
- Each module needs a **clear, simple rule** the AI follows

---

## Decision per Module

| Module | AI Behavior | Why |
|---|---|---|
| **Repository** | **Text first** — AI searches content, shows matching titles as clickable list. Button at top: "Open Repository". Clicking a title shows content text inline in chat. | Quick find + read in chat. Panel for browsing everything. |
| **Offerings** | **Text only** — AI describes offerings in text. Mentions "Go to Offerings page for details." No panel. | Simple data, no quick-action needed. |
| **Approvals** | **Right sidebar** — AI shows matching items as clickable list. Clicking one opens it in sidebar with Approve/Comment actions. "Open full page" link at top. Sidebar auto-closes after approval. | Quick approve is the #1 use case. |
| **Contacts** | **Text only** — AI answers contact queries in text (count, tags, details). Links to full page. No panel. | Contact management needs full page (bulk actions, import). |
| **Campaigns** | **Text only** — AI shows campaign status/metrics in text + charts. Links to full page. No panel. | Campaign building is complex, needs full page. |
| **Email** | **Text only** — AI drafts emails in text, sends via tools. Links to full page for template builder. No panel. | Composing = tools. Template design = full page. |
| **Social** | **Text only** — AI creates/schedules posts via tools. Shows results in text. Links to full page for calendar view. No panel. | Post creation = tools. Calendar = full page. |
| **Keywords** | **Text only** — AI shows keyword data in charts/text. Links to full page. No panel. | Keyword browsing with charts already works in chat. |
| **Analytics** | **Text only** — AI shows performance in charts (already does this well). Links to full page. No panel. | Charts in chat ARE the analytics sidebar. |
| **Journeys** | **Text only** — AI lists journeys, shows status. Links to full page. No panel exists, none needed. | Visual flow builder = full page only. |
| **Automations** | **Text only** — AI lists automations, toggles on/off via tools. Links to full page. No panel. | Rule editing = full page only. |

---

## Summary: Only 2 modules get sidebar panels

1. **Repository** — for browsing/reading content inline
2. **Approvals** — for quick approve/comment workflow

Everything else = **AI answers in text/charts + "Open [Module]" navigation link**

---

## Implementation Plan

### Step 1: Update AI System Prompt (index.ts)
Add a `SIDEBAR & NAVIGATION RULES` section:

```
SIDEBAR & NAVIGATION RULES:
- NEVER open sidebar panels for: Offerings, Contacts, Campaigns, Email, Social, Keywords, Analytics, Journeys, Automations
- For these modules: Answer in text/charts + include actionableItem with "Open [Module]" linking to the full page route
- Repository: Search content by title/keyword. Show up to 5 matching results as a clickable list. Include "Open Repository" action. When user clicks a result, show the full content text in chat.
- Approvals: Show matching pending items as a list. When user picks one, return visualData type "approvals" to open sidebar with approve/comment actions. After approval, close sidebar automatically.
```

### Step 2: Remove Unused Panels from VisualizationSidebar.tsx
Remove panel routing for: `offerings`, `contacts`, `campaigns`, `email`, `social`, `keywords`, `analytics`

Keep only: `content_wizard`, `proposal_browser`, `repository`, `approvals`, `research_intelligence`, `content_repurpose`

### Step 3: Rebuild Repository Panel as Quick-Access Browser
- Light list view (title + type + status badge)
- Click → shows content body in a reader view inside the panel
- "Open Repository" button at top-left of panel header
- Search bar at top

### Step 4: Rebuild Approvals Panel as Quick-Action Sidebar
- Shows filtered pending items (matched by AI's keyword search)
- Click item → shows content preview + Approve / Add Comment / Reject buttons
- "Open Approvals Page" link at top-left
- Auto-close on successful approval (with toast confirmation)

### Step 5: Clean Up Dead Panel Files
Delete: `ContactsPanel.tsx`, `CampaignsPanel.tsx`, `EmailPanel.tsx`, `SocialPanel.tsx`, `KeywordsPanel.tsx`, `AnalyticsPanel.tsx`, `OfferingsPanel.tsx`

---

## Files Changed
- `supabase/functions/enhanced-ai-chat/index.ts` — Add sidebar rules to system prompt
- `src/components/ai-chat/VisualizationSidebar.tsx` — Remove 7 panel routes
- `src/components/ai-chat/panels/RepositoryPanel.tsx` — Rebuild as quick-access browser
- `src/components/ai-chat/panels/ApprovalsPanel.tsx` — Rebuild as quick-action sidebar
- Delete 7 unused panel files

