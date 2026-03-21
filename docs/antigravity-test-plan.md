# AI Chat — Antigravity DOM Test Plan

> Complete test plan for DOM-based testing of the AI Chat at `creaiter.lovable.app/ai-chat`.
> Every test is described as a user action → expected DOM result.
> Test URL: `https://creaiter.lovable.app/ai-chat`

---

## Pre-requisites

- Logged-in user account with at least one AI provider configured (check Settings → API Keys)
- Some existing data helps (content items, keywords, offerings) but not required for all tests

---

## PHASE 1: First Load & Welcome Screen (8 tests)

| # | Action | Expected DOM |
|---|--------|-------------|
| 1.1 | Navigate to `/ai-chat` | Page loads. Left sidebar visible with conversation history. Center area shows welcome screen. |
| 1.2 | Check welcome screen elements | `DynamicGreeting` component visible (time-appropriate phrase like "Rise and create" or "Evening flow"). `PlatformSummaryCard` visible with 4 stat circles (Content, Published, In Review, SEO). Quick action buttons visible (6 buttons in 2x3 or 3x2 grid). |
| 1.3 | Check notification bell | Fixed top-right corner. Bell icon visible. If unread count > 0, purple badge with number shows. |
| 1.4 | Check proactive insights | If user has stale drafts or empty calendar, small badges appear above quick actions showing alerts like "Stale drafts (>14d)" or "Empty calendar". |
| 1.5 | Check + menu button | Plus (+) button visible in the input area (bottom left of input). |
| 1.6 | Check input area | Textarea with placeholder "Ask Creaiter anything...". Send button (arrow icon) visible but disabled (empty input). Voice mic button visible. |
| 1.7 | Check sidebar sections | Left sidebar has: Logo/brand at top, "New Chat" button, then collapsible sections: Library (Repository, Offerings, Approvals, AI Proposals), Tools (Campaigns, Keywords, Analytics), Engage (Email, Social, Contacts, Automations, Journeys). Settings gear and user avatar at bottom. |
| 1.8 | If no API key configured | `APIKeyOnboarding` modal should appear blocking the chat, asking user to add an API key. Test: remove all API keys from settings, reload page. |

---

## PHASE 2: Sending Messages & Responses (12 tests)

| # | Action | Expected DOM |
|---|--------|-------------|
| 2.1 | Type "hello" in input → press Enter | User message bubble appears (right-aligned, primary color background). AI starts processing — `ThinkingTextRotator` or progress text visible. Within a few seconds, AI response bubble appears (left-aligned). |
| 2.2 | Check AI response has action buttons | Below the AI response text, `ModernActionButtons` should render 1-4 small outlined buttons (e.g., "View Dashboard", "Create Content"). |
| 2.3 | Check follow-up suggestions | Below action buttons, 2-3 small rounded pill buttons with follow-up suggestions (e.g., "Create this as a blog post", "Tell me more about this"). Only appears if no `deepDivePrompts` in the response. |
| 2.4 | Check "Data Analysis" label | If AI response includes data/charts, a small "Data Analysis" label with a purple dot appears above the response text. If no data, this label should NOT appear. |
| 2.5 | Click a follow-up suggestion pill | The suggestion text is sent as a new message. User bubble appears with that text. AI processes and responds. |
| 2.6 | Send empty message | Send button should be disabled (`disabled` attribute). Nothing happens on Enter with empty input. |
| 2.7 | Send whitespace-only message | Send button should be disabled. Whitespace is trimmed. |
| 2.8 | Type a long message (200+ chars) | Textarea auto-expands vertically. Message sends correctly. User bubble wraps text properly. |
| 2.9 | Press Shift+Enter | Adds a newline in the textarea. Does NOT send the message. |
| 2.10 | Check conversation auto-naming | After sending the first message in a new chat, the sidebar conversation entry should update from "New Chat" to the first ~40 characters of the message. |
| 2.11 | Check context indicator | After 10+ messages in a conversation, a small text should appear near the input: "AI context: first message + last 9 of [N]" (where N is total message count). |
| 2.12 | Send `/help` or "what can you do?" | A `CapabilitiesCard` should render — a grid of 6 capability groups (Content, Keywords, Email & Contacts, Offerings, Campaigns, Cross-Module) each with bullet points and clickable example buttons. |

---

## PHASE 3: Message Actions (10 tests)

| # | Action | Expected DOM |
|---|--------|-------------|
| 3.1 | Hover over any message | Action buttons appear: Copy icon, and for AI messages also Regenerate (refresh) icon. For user messages within 5 min: three-dot menu with Edit and Delete. |
| 3.2 | Click Copy on AI message | Toast: "Message copied to clipboard". Clipboard contains the message text. |
| 3.3 | Click Regenerate on AI message | Previous AI response is replaced. New progress indicator shows. New AI response appears (should be different from the original — smart retry with variation). |
| 3.4 | Click three-dot menu on user message (within 5 min) | Dropdown shows "Edit" and "Delete" options. |
| 3.5 | Click Edit → modify text → save | Inline edit dialog opens with current message text. After save: user message updates, subsequent AI response is deleted, new AI response is generated for the edited message. |
| 3.6 | Click Edit on message older than 5 min | Toast: "Edit window expired" or edit option not shown. |
| 3.7 | Click Delete on user message | Confirmation appears ("Delete?" with X and checkmark). Click checkmark → user message AND the paired AI response below it are both removed. |
| 3.8 | Click Delete on AI message | Only that AI message is removed. |
| 3.9 | Click thumbs-up on AI message | Thumbs-up icon highlights (green). Feedback stored. Toast or visual confirmation. |
| 3.10 | Click thumbs-down on AI message | Thumbs-down icon highlights (red). Feedback stored. |

---

## PHASE 4: Plus Menu & Input Modes (12 tests)

| # | Action | Expected DOM |
|---|--------|-------------|
| 4.1 | Click "+" button | Popover opens with 7 items: Attach File, Content Wizard, Research Intelligence, Analyst, AI Proposals, Web Search, Generate Image. |
| 4.2 | Click "Content Wizard" | Wizard mode chip appears in input area. Placeholder changes to topic-related text. |
| 4.3 | In wizard mode, type a topic → press Enter | Content Wizard sidebar opens on the right with steps: Topic & Solution → Research → Outline → Config → Generate. |
| 4.4 | Press Escape in wizard mode | Wizard mode chip disappears. Input returns to normal. |
| 4.5 | Click "Research Intelligence" | Right sidebar opens with Research Intelligence panel showing 3 tabs: Clusters, Content Gaps, Recommendations. |
| 4.6 | Click "Analyst" | Right sidebar opens with Analyst panel. Shows: health score ring, topic tags, platform stats with sparklines, suggested prompt buttons. If no data yet, shows "Ask about your data" CTA with prompts. |
| 4.7 | Click "AI Proposals" | Right sidebar opens with Proposal Browser. First step: solution selection. |
| 4.8 | Click "Web Search" | Web search mode chip appears. Placeholder changes. Typing and sending triggers web search. |
| 4.9 | Click "Generate Image" | Input pre-fills with "Generate an image of: " and cursor is focused at the end. |
| 4.10 | Click "Attach File" | File upload handler appears above input (dropzone or file picker). |
| 4.11 | Upload a .txt file | File is analyzed, summary appears as user message, AI processes and responds with analysis. |
| 4.12 | Click voice mic button | Recording starts (if browser supports it). Interim text may appear. Stop recording → transcript appended to input. |

---

## PHASE 5: Visualization Sidebar (10 tests)

| # | Action | Expected DOM |
|---|--------|-------------|
| 5.1 | Ask "show my content performance" | AI responds with chart data. Right sidebar auto-opens with chart visualization (bar/line/pie). |
| 5.2 | Close sidebar with X button | Sidebar closes. `userClosedSidebar` flag set — subsequent chart responses should NOT auto-open the sidebar. |
| 5.3 | Send another data query after closing | AI responds with chart inline in the message. Sidebar stays closed (respects user close intent). |
| 5.4 | Switch to a different conversation | Sidebar should close completely. No stale data from previous conversation. Analyst panel should deactivate. |
| 5.5 | Switch to an old conversation with charts | Sidebar should NOT auto-open. Messages load but sidebar stays closed (old history, not new message). |
| 5.6 | Open Analyst → ask data questions | Analyst sidebar accumulates: topic tags update, metrics cards appear, insights feed grows with each response. |
| 5.7 | Check Analyst health score | Circular ring with 0-100 score. Colored green (≥70), amber (40-69), or red (<40). Trend indicator (improving/declining/stable). Critical factor shown below. |
| 5.8 | Check Analyst anomaly alerts | If low SEO content, stale drafts, or empty calendar exist, warning items appear at top of insights feed with ⚠️/📝/📅 icons. |
| 5.9 | Check Analyst cross-signal insights | After asking several data questions, look for insights like "SEO scores declining", "Topic concentration", "Publishing gap" in the feed. |
| 5.10 | Close Analyst → reopen in new conversation | Previous session insights should appear prefixed with "📋 Previous session:" (cross-session memory). |

---

## PHASE 6: Content Wizard Flow (8 tests)

| # | Action | Expected DOM |
|---|--------|-------------|
| 6.1 | Click "Write content" quick action | Content Wizard sidebar opens directly (no topic input needed for this path). |
| 6.2 | Open wizard from + menu → type topic → Enter | Sidebar opens with topic pre-filled. Step 1 (Topic & Solution) shows solution picker. |
| 6.3 | Select a solution → click Next | Step 2 (Research) loads. SERP analysis runs (if SERP key configured). Shows FAQs, content gaps, related keywords, competitor headings with checkboxes. Items have badges: "From SERP" (green) or "AI Suggested", and content gaps show "Gap: competitors don't cover this well" (amber). |
| 6.4 | Select research items → Next → Outline step | AI-generated outline appears with editable sections. User can drag, edit, add, remove sections. |
| 6.5 | Next → Config step | Writing style, expertise level, word count, content type options. Should pre-fill from last used config (if returning user). |
| 6.6 | Next → Generate step | Content generates (may take 15-30s for long articles). Progress visible. Generated content appears in editable markdown view. |
| 6.7 | Check quality report after generation | Collapsible "Quality Report" section shows pass/fail checks: keyword in intro, FAQ present, word count, H2 headings, SEO score. Each with ✓ (green) or ✗ (red). |
| 6.8 | Check "What's next?" distribution buttons | After saving, buttons appear: "Publish to Website", "Share on Social", "Send as Email", "Schedule". Each triggers the corresponding action via chat. |

---

## PHASE 7: Conversation Management (10 tests)

| # | Action | Expected DOM |
|---|--------|-------------|
| 7.1 | Click "New Chat" in sidebar | New conversation created. Messages cleared. Welcome screen shown. Sidebar shows new entry. |
| 7.2 | Right-click or three-dot menu on conversation | Dropdown: Rename, Pin, Archive, Delete, Export, Share. |
| 7.3 | Rename conversation | Inline edit appears. Type new name → Enter. Title updates in sidebar. |
| 7.4 | Pin conversation | Conversation moves to top of list. Pin icon visible. |
| 7.5 | Archive conversation | Conversation disappears from list. If it was active, welcome screen shown. |
| 7.6 | Delete conversation → confirm | Confirmation dialog. After confirm: conversation removed, messages deleted. |
| 7.7 | Search conversations | Search input in sidebar. Type query → list filters to matching titles. |
| 7.8 | Export conversation (JSON) | File downloads as `.json` with `{conversation, messages, exported_at}` structure. |
| 7.9 | Export conversation (Markdown) | File downloads as `.md` with headers, separators, timestamped messages. |
| 7.10 | Share conversation → copy link | Toast: "Link copied". URL format: `/shared-conversation/[token]`. Opening that URL in incognito shows read-only view with messages. |

---

## PHASE 8: Action Buttons & Navigation (8 tests)

| # | Action | Expected DOM |
|---|--------|-------------|
| 8.1 | AI response includes "View in Repository" button → click | Navigates to `/repository`. |
| 8.2 | AI response includes "Send as Email" button → click | Sends a follow-up message like "Create an email campaign from content...". AI processes it. |
| 8.3 | AI response includes deep-dive question → click | Question sent as message. AI responds with deeper analysis. |
| 8.4 | AI suggests a destructive action (delete) | `ActionConfirmationCard` appears in chat with "Confirm" and "Cancel" buttons. Action does NOT execute until confirmed. |
| 8.5 | Click "Confirm" on destructive action | Action executes. Result message replaces confirmation card. |
| 8.6 | Click "Cancel" on destructive action | Card replaced with "🚫 Action cancelled." text. |
| 8.7 | Error state → click "Retry" | Previous user message is re-sent. New AI response generated. |
| 8.8 | Error state → click "API Settings" | Settings popup opens on the API Keys tab. |

---

## PHASE 9: Notification System (5 tests)

| # | Action | Expected DOM |
|---|--------|-------------|
| 9.1 | Click notification bell | Notification center opens. Shows list of notifications grouped by title+hour (e.g., "Content generated (3 items)"). |
| 9.2 | Check notification categories | Notifications should include: content-related, campaign-related, and if background jobs have run: email send results, content queue completions. |
| 9.3 | Click a notification with action URL | Navigates to the relevant page (e.g., `/repository`, `/campaigns`). |
| 9.4 | Mark notifications as read | Click a notification or "Mark all read" → unread count decreases. Badge updates or disappears. |
| 9.5 | Trigger a background action → wait → check bell | e.g., Send an email campaign via chat. Wait 1-2 minutes. Notification bell should show new notification about email send result. |

---

## PHASE 10: Responsive & Mobile (6 tests)

| # | Action | Expected DOM |
|---|--------|-------------|
| 10.1 | Resize to 411px (mobile) | Sidebar collapses. Hamburger/collapse button visible. Input area full-width at bottom. |
| 10.2 | Mobile: code blocks in messages | Horizontal scroll within code block container. No page-level horizontal overflow. |
| 10.3 | Mobile: markdown tables in messages | Scrollable within container. |
| 10.4 | Mobile: + menu | Opens above input. All 7 items visible and tappable. |
| 10.5 | Mobile: visualization sidebar | Overlays content (no side-by-side). Close button accessible. |
| 10.6 | Desktop (1336px+): sidebar + chat + visualization | Three-column layout: left sidebar (280px) + chat (flexible) + visualization sidebar (600px when open). Chat area has margin offset when visualization is open. |

---

## PHASE 11: Edge Cases & Error Handling (8 tests)

| # | Action | Expected DOM |
|---|--------|-------------|
| 11.1 | Send message when backend is down | Error message appears in chat with "Retry" and "API Settings" buttons. No crash. |
| 11.2 | Click "Stop" during AI processing | Processing stops. Partial or no response. No crash. Chat returns to ready state. |
| 11.3 | Rapidly click send 5 times | Only one message sends (button disabled during processing). No duplicate messages. |
| 11.4 | Switch conversation while AI is responding | Previous response aborted. New conversation loads clean. No stale data. |
| 11.5 | Network disconnect during SSE stream | Error caught. Error message with retry button shown. |
| 11.6 | Refresh page mid-conversation | Messages restored from DB on reload. Conversation intact. |
| 11.7 | Open shared conversation link in incognito | Read-only view loads. Messages displayed with SafeMarkdown. "Read Only" badge visible. "Start New Chat" button at bottom. |
| 11.8 | Open invalid share link | Error page: "Unable to Load Conversation" with "Go to AI Chat" button. |

---

## PHASE 12: Tool-Specific Tests (15 tests)

Test each module's tools by sending specific prompts:

| # | Prompt | Expected |
|---|--------|----------|
| 12.1 | "Show me my content" | AI fetches content items, shows list/chart with titles, statuses, SEO scores. |
| 12.2 | "Write a blog post about AI marketing" | AI either launches Content Wizard (if negotiation enabled: asks clarifying questions first) or generates content directly. Result saved to repository. Distribution buttons appear. |
| 12.3 | "Add keyword 'machine learning'" | Keyword added. Confirmation message. |
| 12.4 | "Run SERP analysis for 'content marketing'" | If SERP key configured: analysis runs, results shown (may include inline SERP visualization). If no key: clear message pointing to Settings. |
| 12.5 | "List my solutions" | AI fetches offerings, displays as formatted list with names and descriptions. |
| 12.6 | "Create a contact john@test.com" | Contact created in Engage CRM. Confirmation with contact details. |
| 12.7 | "Create an email campaign for my latest content" | Email campaign created (draft). If Resend key missing: clear guidance. If present: campaign created with option to send. |
| 12.8 | "Show my campaign status" | Campaign intelligence displayed — queue status, content inventory, timeline. |
| 12.9 | "What should I write about this week?" | Weekly briefing generated — draft recommendations, proposal suggestions, calendar gaps, performance insights. Action buttons for each recommendation. |
| 12.10 | "Detect my brand voice" | AI analyzes published content, extracts tone/personality/phrases, saves to brand guidelines. Shows detected patterns. |
| 12.11 | "Compare this week vs last week" | Performance comparison: content created, published, avg SEO, keywords added — current vs previous period. |
| 12.12 | "Repurpose my latest article for Twitter and LinkedIn" | AI generates platform-specific posts. Twitter ≤270 chars. LinkedIn 300-600 words. Response includes scheduling buttons. |
| 12.13 | "Generate an image of a modern office workspace" | Image generation runs (if image provider configured). Generated image displayed in chat. Download button available. |
| 12.14 | "Show version history for my latest article" | Content versions listed (if any edits have been made). Version numbers, dates, change sources shown. |
| 12.15 | "Run full pipeline for my campaign" | Strategy generated + content generation triggered in one flow. Progress updates visible. Queue status shown at end. |

---

## PHASE 13: Output Quality Assessment (15 tests)

Test the QUALITY of what the AI produces, not just whether it responds.

### Response Quality

| # | Prompt | Quality Criteria | Score 1-5 |
|---|--------|-----------------|:---------:|
| 13.1 | "hello" | Should be under 50 words. Friendly, not robotic. No chart data. No deep-dive prompts. No `<think>` tags visible. | |
| 13.2 | "what keywords do I have?" | Should list keywords by name with volumes if available. NOT a chart for a simple list. Under 200 words. | |
| 13.3 | "analyze my content performance in detail" | Should include chart(s), metric cards, specific numbers from real data, insights, and action recommendations. 300+ words. | |
| 13.4 | "write a blog post about remote work tools" | Should ask a strategic question FIRST (e.g., "You have existing articles on this topic — different angle?") before generating. Should NOT auto-generate a bare article without context. | |

### Content Generation Quality

| # | Action | Quality Criteria | Score 1-5 |
|---|--------|-----------------|:---------:|
| 13.5 | Generate a blog post via Content Wizard | Content should NOT start with "In today's digital landscape" or any generic AI opener. Should start with a specific fact, stat, or scenario. | |
| 13.6 | Check generated content for AI slop phrases | Search the generated text for: "game-changer", "revolutionize", "leverage", "delve into", "navigate", "landscape", "robust", "seamless", "comprehensive guide". Should find ZERO of these. | |
| 13.7 | Check keyword placement | Primary keyword should appear in the first 100-150 characters of the article. | |
| 13.8 | Check structure | Article should have: H1 title, Key Takeaways section near top, multiple H2 sections, FAQ section at end. | |
| 13.9 | Check humanization | Look for: first-person usage ("I've found", "In my experience"), varied sentence lengths (some short, some long), at least one opinion or contrarian take, conversational transitions. | |
| 13.10 | Check solution integration (if applicable) | If a solution was selected, it should be mentioned 2-4 times naturally — NEVER in the introduction, never in consecutive paragraphs, always after providing value. No sales copy tone. | |

### Social Repurposing Quality

| # | Action | Quality Criteria | Score 1-5 |
|---|--------|-----------------|:---------:|
| 13.11 | Repurpose article for Twitter | Post should be ≤270 characters. Punchy, no fluff. 2-3 hashtags max. No emojis in body text. | |
| 13.12 | Repurpose article for LinkedIn | 300-600 words. Professional tone. Hook in first line. Line breaks every 2-3 sentences. Ends with a question or CTA. 3-5 hashtags at end. | |
| 13.13 | Repurpose article for Instagram | Caption with hook + value. Strategic emoji use (not excessive). 15-25 hashtags on separate line at end. | |

### Response Accuracy

| # | Action | Quality Criteria | Score 1-5 |
|---|--------|-----------------|:---------:|
| 13.14 | Ask "how many articles do I have?" | Should return the EXACT number from the database. Cross-check by navigating to Repository and counting. Numbers must match — no hallucinated data. | |
| 13.15 | Ask "what's my best performing content?" | Should reference actual content titles and SEO scores from the database. Cross-check against Repository. No fabricated titles or scores. | |

### Scoring Guide
- **5**: Exceptional — indistinguishable from expert human output
- **4**: Good — minor issues but valuable and usable
- **3**: Acceptable — works but has noticeable AI patterns or missing elements
- **2**: Poor — generic, verbose, missing key elements, or contains AI slop
- **1**: Fail — wrong data, hallucinated content, broken structure, or unusable

**Target: Average 4.0+ across all quality tests.**

---

## Scoring

Each test: PASS / FAIL / PARTIAL / BLOCKED (can't test due to missing config)

**Target: 95%+ PASS rate across all 104 tests.**

Report format:
```
Phase [N]: [Name]
  [#]: PASS/FAIL/PARTIAL — [notes if not PASS]
```

Screenshots for every FAIL and PARTIAL.
