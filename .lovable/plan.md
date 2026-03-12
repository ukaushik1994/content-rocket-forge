

# AI Chat Audit: What Works, What Confuses, and What Users Can Ask

## Current State Summary

The AI chat has **92 tools** and a system prompt with sidebar/navigation rules. Here's the honest audit:

---

## What's WORKING

1. **Sidebar rules are defined** — Repository and Approvals have panel types, 9 modules are marked text-only
2. **Repository panel** — Search, browse, read content inline, "Open Repository" button
3. **Approvals panel** — Pending items list, approve/reject/comment, auto-close after action
4. **Content Wizard** — Opens from + menu, works as guided creation
5. **Charts/Analytics** — Visual-first responses with charts, metrics, insights
6. **Query analyzer** — Detects intent categories (content, keywords, campaigns, etc.)

---

## What's CONFUSING the AI (Problems)

| # | Problem | Why It Confuses |
|---|---|---|
| 1 | **"repository" visualData type never gets triggered by AI** | The system prompt says to use it, but the AI has no example of WHEN to return `"type": "repository"` vs just answering in text. There's no JSON example like the chart examples. |
| 2 | **"approvals" visualData type same problem** | Same issue — no JSON format example showing the AI HOW to return `"type": "approvals"`. |
| 3 | **VISUAL-FIRST MANDATE conflicts with text-only rules** | The prompt says "ALWAYS include visualData with charts" for ANY data query. But then says "for Offerings, answer in text only." These contradict — if user asks "show my offerings," does AI make a chart or answer in text? |
| 4 | **actionableItems with `navigate` URLs go to full pages** | When AI includes actions like "View Campaigns → /campaigns", clicking them NAVIGATES AWAY from chat. User loses context. No "open in new tab" or "stay in chat" option. |
| 5 | **No way for AI to return "Open [Module]" as a styled button** | The prompt says "include actionableItem with Open [Module]" but actionableItems render as small links inside the sidebar chart view, not as prominent buttons in chat text. |
| 6 | **Query analyzer has no "repository" or "approvals" category** | `query-analyzer.ts` detects `needsApprovals` but adds category `'approvals'` — this category is never used to force `visualData.type = "approvals"`. The connection between detected intent and panel opening is missing. |
| 7 | **Read tool count still says 25** in the system prompt (line 565) | Should say 29. Was supposed to be fixed but the line wasn't updated. |

---

## What Every User Can Ask — Module by Module

### Repository (Panel)
- "Find my blog about [topic]" → should open repository panel with search results
- "Show me all my published content" → panel with filtered list
- "What did I write about [keyword]?" → search + show matches
- "Open my content library" → panel opens
- "Read my article on [topic]" → panel opens, shows content inline

### Approvals (Panel)  
- "What's pending approval?" → panel with pending items
- "Approve the blog about [topic]" → panel opens, shows item, approve button
- "How many items need review?" → text answer + panel link
- "Reject the [title] article" → panel opens with reject action

### Offerings (Text only)
- "What products do I have?" → text list
- "Tell me about my [offering name]" → text description
- "How many offerings do I have?" → text count
- "Add a new product called X" → uses create_solution tool

### Contacts (Text only)
- "How many contacts do I have?" → text count
- "Find contacts tagged [tag]" → text list
- "Add a contact: [name, email]" → uses create_contact tool
- "Show my audience segments" → text list

### Campaigns (Text only + charts)
- "How are my campaigns doing?" → chart + metrics
- "Show campaign [name] status" → text summary
- "Create a new campaign for [topic]" → uses create_campaign tool
- "What's in my content queue?" → text/chart of queue

### Email (Text only)
- "Draft an email about [topic]" → text draft via tool
- "Send a newsletter to [segment]" → uses send_email_campaign tool
- "Show my email templates" → text list
- "How did my last email perform?" → text metrics

### Social (Text only)
- "Create a LinkedIn post about [topic]" → uses create_social_post tool
- "Schedule a post for tomorrow" → uses schedule_social_post tool
- "Show my upcoming social posts" → text list
- "Repurpose my blog for social" → uses repurpose_for_social tool

### Keywords (Text only + charts)
- "Show my keywords" → chart of keyword data
- "Add keyword [term]" → uses add_keywords tool
- "Run a SERP analysis for [keyword]" → triggers SERP tool
- "What are my top keywords?" → chart

### Analytics (Text only + charts)
- "Show my content performance" → multi-chart dashboard
- "How is my content doing?" → chart + metrics
- "Compare my blog performance" → chart

### Journeys (Text only)
- "Show my customer journeys" → text list
- "Create a journey for [purpose]" → uses create_journey tool
- "Activate the [name] journey" → uses activate_journey tool

### Automations (Text only)
- "List my automations" → text list
- "Turn on the [name] automation" → uses toggle_automation tool
- "Create an automation for [trigger]" → uses create_automation tool

---

## What Needs Fixing (Implementation Plan)

### Fix 1: Add JSON examples for repository/approvals panel triggers
Add explicit examples in the system prompt showing the AI exactly when and how to return `"type": "repository"` and `"type": "approvals"` — just like the chart JSON examples exist today.

### Fix 2: Resolve VISUAL-FIRST vs TEXT-ONLY conflict
Add a clear override rule: "The VISUAL-FIRST mandate applies ONLY to modules that support charts (Keywords, Analytics, Campaigns, Content performance). For TEXT-ONLY modules, respond with formatted text + an actionable 'Open [Module]' link."

### Fix 3: Make "Open [Module]" buttons render in chat messages
Currently actionableItems only show in the sidebar. Add a new response format — `navigationLinks` — that renders as styled buttons directly in the chat message bubble so users see "Open Campaigns →" as a clickable button.

### Fix 4: Prevent navigate-away on action clicks
When user is on `/ai-chat`, actionableItem clicks with `navigate` type should either open in a new tab or show a confirmation, not silently navigate away from chat.

### Fix 5: Connect query-analyzer categories to panel types
When `query-analyzer.ts` detects `needsApprovals`, the system should hint to the AI to return `visualData.type = "approvals"`. Same for repository content browsing queries.

### Fix 6: Update read tool count to 29

---

## Files to Change
- `supabase/functions/enhanced-ai-chat/index.ts` — Fix prompt: add panel JSON examples, resolve visual-first conflict, update tool count
- `supabase/functions/enhanced-ai-chat/query-analyzer.ts` — Add panel-trigger hints for repository/approvals intents  
- `src/components/ai-chat/EnhancedChatMessage.tsx` — Add navigation link buttons rendering in chat bubbles
- `src/components/ai-chat/visualization/MultiChartAnalysis.tsx` — Fix navigate-away behavior for action clicks

