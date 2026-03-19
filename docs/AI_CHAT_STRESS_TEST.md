# AI Chat — Comprehensive Stress Test Plan

**Version:** 1.0  
**Date:** 2026-03-19  
**Target:** Antigravity QA Team  
**System Under Test:** CREAiTER AI Chat (`EnhancedChatInterface.tsx` + `enhanced-ai-chat` Edge Function)

---

## How to Use This Document

Each test case follows this format:

| Field | Description |
|-------|-------------|
| **ID** | Section prefix + number (e.g., `CM-01`) |
| **Severity** | **P0** = Blocker, **P1** = Major, **P2** = Minor |
| **Steps** | Numbered actions to reproduce |
| **Expected** | What should happen |
| **Pass/Fail** | ☐ (fill in during testing) |

**Prerequisites for all tests:**
1. Logged-in user with at least one active API key (OpenRouter or Anthropic)
2. Navigate to `/ai-chat`
3. Have sample data: ≥3 content items, ≥5 keywords, ≥1 competitor, ≥1 solution/offering, ≥1 campaign

---

## Section 1: Conversation Management

### CM-01 — Create New Conversation
**Severity:** P0  
**Steps:**
1. Click the "+" button in the conversation sidebar
2. Type "Hello" and press Enter  
**Expected:** A new conversation appears in the sidebar with an auto-generated title. The message is sent and an AI response is received.

### CM-02 — Rename Conversation
**Severity:** P1  
**Steps:**
1. Open an existing conversation
2. Click the conversation title or the edit icon in the sidebar
3. Type a new name and confirm  
**Expected:** Title updates in the sidebar and persists after page reload.

### CM-03 — Delete Conversation
**Severity:** P0  
**Steps:**
1. Open a conversation with at least 5 messages
2. Click the kebab menu (⋮) → "Delete"
3. Confirm the deletion  
**Expected:** Conversation is removed from the sidebar. If it was active, the view returns to the welcome screen. Reloading confirms it's gone from the DB.

### CM-04 — Switch Between Conversations Rapidly
**Severity:** P0  
**Steps:**
1. Have 5+ conversations with messages
2. Click between 4 different conversations within 3 seconds  
**Expected:** Each conversation loads its own messages. No message bleed between conversations. The final conversation shown matches the last one clicked. No console errors about unmounted components.

### CM-05 — Search Conversations
**Severity:** P1  
**Steps:**
1. Have 10+ conversations with distinct titles
2. Click the search icon in the sidebar
3. Type a partial title match  
**Expected:** The conversation list filters to show only matching conversations. Clearing the search restores the full list.

### CM-06 — Tag a Conversation
**Severity:** P2  
**Steps:**
1. Open a conversation
2. Add a tag (e.g., "seo", "research")
3. Add a second tag  
**Expected:** Tags appear on the conversation card in the sidebar. Tags persist after reload.

### CM-07 — Remove a Tag
**Severity:** P2  
**Steps:**
1. Open a conversation with 2+ tags
2. Click the "x" on a tag to remove it  
**Expected:** Tag is removed. Remaining tags stay. Change persists after reload.

### CM-08 — Pin a Conversation
**Severity:** P1  
**Steps:**
1. Pin 3 different conversations
2. Reload the page  
**Expected:** Pinned conversations appear at the top of the sidebar, above unpinned ones. Pin state persists after reload.

### CM-09 — Unpin a Conversation
**Severity:** P1  
**Steps:**
1. Unpin one of the 3 pinned conversations  
**Expected:** The conversation moves back to the regular list, sorted by updated_at.

### CM-10 — Archive a Conversation
**Severity:** P1  
**Steps:**
1. Archive a conversation via the kebab menu  
**Expected:** The conversation disappears from the default sidebar view. It can be found by toggling "Show archived".

### CM-11 — Share a Conversation
**Severity:** P2  
**Steps:**
1. Open a conversation with 5+ messages
2. Click the kebab menu (⋮) → "Share"
3. Copy the generated share link  
**Expected:** A unique share token is generated. The link is copyable. Opening the link in an incognito window shows a read-only view of the conversation.

### CM-12 — Export a Conversation
**Severity:** P2  
**Steps:**
1. Open a conversation with tool results, charts, and regular messages
2. Click the kebab menu → "Export"
3. Download the export file  
**Expected:** A JSON or Markdown file is downloaded containing all messages, including metadata (timestamps, tool names, visual data).

### CM-13 — Empty Conversation Cleanup
**Severity:** P1  
**Steps:**
1. Create a new conversation (click "+")
2. Do NOT send any messages
3. Navigate away to a different page, then return to `/ai-chat`  
**Expected:** The empty conversation should NOT persist in the sidebar. It should be automatically cleaned up.

---

## Section 2: Message Operations

### MO-01 — Send a Simple Message
**Severity:** P0  
**Steps:**
1. Type "What is SEO?" in the input box
2. Press Enter  
**Expected:** Message appears in the chat as a user bubble. AI responds with a relevant answer. Streaming dots/text are visible during generation.

### MO-02 — Send with Shift+Enter (Multiline)
**Severity:** P1  
**Steps:**
1. Type "Line 1"
2. Press Shift+Enter
3. Type "Line 2"
4. Press Enter  
**Expected:** The message is sent with both lines preserved (newline visible in the user bubble). The AI responds to the complete multi-line message.

### MO-03 — Send Empty Message
**Severity:** P1  
**Steps:**
1. Click the send button with an empty input
2. Press Enter with only whitespace in the input  
**Expected:** Nothing is sent. No error. The send button should be visually disabled or inactive when input is empty.

### MO-04 — Abort a Streaming Response
**Severity:** P0  
**Steps:**
1. Ask a complex question: "Give me a comprehensive SEO strategy for a SaaS company"
2. While the AI is streaming a response, click the Stop button  
**Expected:** Streaming stops immediately. The partial response remains visible. The input is re-enabled. No error messages.

### MO-05 — Edit a Message (Within 5-Minute Window)
**Severity:** P0  
**Steps:**
1. Send a message: "Show me my worst performing content"
2. Wait for the AI response
3. Within 5 minutes, hover over the user message and click the edit icon
4. Change to: "Show me my best performing content"
5. Confirm the edit  
**Expected:** The user message updates. The AI re-generates a new response based on the edited message. The old AI response is replaced.

### MO-06 — Edit a Message (After 5-Minute Window)
**Severity:** P1  
**Steps:**
1. Find a user message sent more than 5 minutes ago
2. Attempt to edit it  
**Expected:** The edit option should be disabled or not visible. If clicked, a toast/message explains the 5-minute window has expired.

### MO-07 — Delete a Message
**Severity:** P1  
**Steps:**
1. Send a message and receive an AI response
2. Delete the user message  
**Expected:** Both the user message and its corresponding AI response are removed from the view. The deletion persists after reload.

### MO-08 — Pin a Message
**Severity:** P1  
**Steps:**
1. Pin an important AI response (e.g., one with data/analysis)
2. Continue the conversation for 15+ more messages
3. Ask the AI "What did you say about my content earlier?"  
**Expected:** The pinned message is included in the AI's context. The AI should reference or recall the pinned content accurately.

### MO-09 — Retry a Failed Message
**Severity:** P0  
**Steps:**
1. Temporarily disable network or use an invalid API key
2. Send a message and wait for the error
3. Re-enable network / fix the key
4. Click the "Retry" button on the failed message  
**Expected:** The message is re-sent. A successful AI response is received. The error state is cleared.

### MO-10 — Rapid-Fire Messages
**Severity:** P0  
**Steps:**
1. Send 5 messages in rapid succession (within 3 seconds):
   - "Message 1"
   - "Message 2"
   - "Message 3"
   - "Message 4"
   - "Message 5"  
**Expected:** Messages should be queued or debounced. No duplicate messages. No race condition errors. Each message gets a response (possibly batched). The `isSendingRef` guard prevents concurrent sends.

### MO-11 — Message with Special Characters
**Severity:** P2  
**Steps:**
1. Send: `<script>alert('xss')</script>`
2. Send: `SELECT * FROM users; DROP TABLE users;--`
3. Send: `🚀💡📊 Emoji test with "quotes" and 'apostrophes'`  
**Expected:** All messages render safely as plain text. No XSS. No SQL injection. Emojis render correctly. Quotes and special chars are preserved.

### MO-12 — Very Long Message
**Severity:** P2  
**Steps:**
1. Paste a 5000-character message into the input
2. Send it  
**Expected:** The message sends successfully. The textarea auto-resizes up to its max height (120px). The user bubble truncates or scrolls for very long content.

### MO-13 — Keyboard Shortcut: ESC to Clear
**Severity:** P2  
**Steps:**
1. Type a partial message in the input
2. Press ESC  
**Expected:** The input field is cleared (if this behavior is implemented) or focus is removed from the input.

### MO-14 — Feedback: Helpful / Not Helpful
**Severity:** P1  
**Steps:**
1. Receive an AI response
2. Click the "thumbs up" (helpful) button
3. On another response, click "thumbs down" (not helpful)  
**Expected:** Feedback is recorded. The button state changes visually to reflect the selected feedback. The feedback persists after reload (stored in `ai_messages.feedback_helpful`).

---

## Section 3: Tool Execution & Data Retrieval

### TE-01 — Content Items Retrieval
**Severity:** P0  
**Steps:**
1. Ask: "Show me all my draft content"  
**Expected:** AI calls `get_content_items` with `status: "draft"`. Response lists draft content items with titles, dates, and SEO scores. A chart or table may be rendered if 3+ items are returned.

### TE-02 — Content Items with SEO Score Filter
**Severity:** P1  
**Steps:**
1. Ask: "Which of my articles have an SEO score below 50?"  
**Expected:** AI calls `get_content_items` with `max_seo_score: 50`. Results are filtered correctly. Response includes actionable improvement suggestions.

### TE-03 — Keyword Research Data
**Severity:** P0  
**Steps:**
1. Ask: "Show me my top keywords by search volume"  
**Expected:** AI calls `get_keywords`. Response includes keyword names, volumes, and difficulty scores. A bar chart or table visualization may appear.

### TE-04 — Keywords with Difficulty Filter
**Severity:** P1  
**Steps:**
1. Ask: "Find easy keywords with difficulty under 30"  
**Expected:** AI calls `get_keywords` with `max_difficulty: 30`. Only low-difficulty keywords are returned.

### TE-05 — Strategy Proposals
**Severity:** P0  
**Steps:**
1. Ask: "What content opportunities do I have?"  
**Expected:** AI calls `get_proposals`. Response lists available proposals with titles, estimated impressions, and priority tags.

### TE-06 — Proposals by Priority
**Severity:** P1  
**Steps:**
1. Ask: "Show me only quick-win proposals"  
**Expected:** AI calls `get_proposals` with `priority_tag: "quick-win"`. Results are filtered accordingly.

### TE-07 — Solutions/Offerings Data
**Severity:** P0  
**Steps:**
1. Ask: "Tell me about my products"  
**Expected:** AI calls `get_solutions`. Response includes solution names, features, benefits, target audience, and pricing information.

### TE-08 — SEO Scores
**Severity:** P1  
**Steps:**
1. Ask: "How are my articles performing from an SEO perspective?"  
**Expected:** AI calls `get_seo_scores`. Response includes scores with analysis and optimization recommendations.

### TE-09 — SERP Analysis
**Severity:** P0  
**Steps:**
1. Ask: "Analyze the SERP for 'content marketing tools'"  
**Expected:** AI calls `get_serp_analysis` with `keyword: "content marketing tools"`. Response includes SERP features, top results, and competitive analysis. SERP visual data may render.

### TE-10 — Competitor Intelligence
**Severity:** P0  
**Steps:**
1. Ask: "What do you know about my competitors?"  
**Expected:** AI calls `get_competitors` with `include_intelligence: true`. Response includes competitor names, market positions, strengths, weaknesses, and SWOT data.

### TE-11 — Competitor by Name
**Severity:** P1  
**Steps:**
1. Ask: "Tell me about [specific competitor name]"  
**Expected:** AI calls `get_competitors` with `competitor_name` filter. Response focuses on that specific competitor.

### TE-12 — Competitor Solutions
**Severity:** P1  
**Steps:**
1. Ask: "What products does [competitor] offer?"  
**Expected:** AI calls `get_competitors` with `include_solutions: true`. Response includes the competitor's product/service offerings.

### TE-13 — Campaign Intelligence
**Severity:** P0  
**Steps:**
1. Ask: "How are my campaigns performing?"  
**Expected:** AI calls a campaign intelligence tool. Response includes campaign names, statuses, and performance metrics.

### TE-14 — Engage Module Data (Email/Social/Journey)
**Severity:** P1  
**Steps:**
1. Ask: "Show me my email campaign performance"
2. Ask: "What social posts are scheduled?"
3. Ask: "What's the status of my customer journeys?"  
**Expected:** Each query triggers the appropriate engage intelligence tool. Responses include relevant data from the Engage module.

### TE-15 — Brand Analytics
**Severity:** P1  
**Steps:**
1. Ask: "Analyze my brand guidelines"  
**Expected:** AI calls a brand analytics tool. Response includes brand colors, fonts, tone guidelines, and suggestions.

### TE-16 — Image Generation
**Severity:** P1  
**Steps:**
1. Ask: "Generate a hero image for a blog post about AI in marketing"  
**Expected:** AI calls the image generation tool. A generated image card appears in the response with the image preview and download option.

### TE-17 — Cross-Module Query
**Severity:** P0  
**Steps:**
1. Ask: "Based on my keyword gaps and competitor weaknesses, what content should I create next?"  
**Expected:** AI calls multiple tools (keywords, competitors, proposals, content gaps). Response synthesizes data from multiple sources into a unified recommendation. A "Data Analysis" label appears.

### TE-18 — Content Action: Create Draft
**Severity:** P0  
**Steps:**
1. Ask: "Create a blog post draft about cloud security best practices"  
**Expected:** AI calls a content action tool. A confirmation card appears asking user to confirm. Upon confirmation, a draft is created and the user gets a link/redirect option.

### TE-19 — Keyword Action: Save Keyword
**Severity:** P1  
**Steps:**
1. Ask: "Save the keyword 'AI marketing automation' with volume 5000"  
**Expected:** AI calls a keyword action tool. After confirmation, the keyword is saved to the database.

### TE-20 — Proposal Action: Schedule Proposal
**Severity:** P1  
**Steps:**
1. Ask: "Schedule the top proposal for next Monday"  
**Expected:** AI calls a proposal action tool. A confirmation card appears. Upon confirmation, the proposal status updates.

### TE-21 — Strategy Action
**Severity:** P1  
**Steps:**
1. Ask: "Create a new content strategy focused on thought leadership"  
**Expected:** AI calls a strategy action tool. The workflow progresses through strategy creation steps.

### TE-22 — Offerings Action
**Severity:** P1  
**Steps:**
1. Ask: "Add a new product called 'AI Writer Pro' with pricing at $49/month"  
**Expected:** AI calls an offerings action tool. After confirmation, the new solution/offering is created.

### TE-23 — Engage Action: Create Email Template
**Severity:** P1  
**Steps:**
1. Ask: "Create an email template for a product launch announcement"  
**Expected:** AI calls an engage action tool. A confirmation card appears. Upon confirmation, the template is created.

### TE-24 — Action Confirmation: Accept
**Severity:** P0  
**Steps:**
1. Trigger any action that requires confirmation (e.g., "Delete my lowest performing content")
2. Click "Confirm" on the ActionConfirmationCard  
**Expected:** The action executes. An ActionResultCard appears showing the result. The conversation continues normally.

### TE-25 — Action Confirmation: Cancel
**Severity:** P0  
**Steps:**
1. Trigger an action that requires confirmation
2. Click "Cancel" on the ActionConfirmationCard  
**Expected:** The action is NOT executed. The AI acknowledges the cancellation. No data changes. The conversation continues.

### TE-26 — Auto-Execute Fallback (Non-Destructive Tools)
**Severity:** P1  
**Steps:**
1. Ask: "Show me my content" (triggers `get_content_items` — a read-only tool)  
**Expected:** The tool executes automatically WITHOUT a confirmation card (read-only tools should auto-execute). Data is returned directly.

### TE-27 — Tool Execution with No Data
**Severity:** P1  
**Steps:**
1. Ask: "Show me my proposals with priority 'ultra-rare-tag'"  
**Expected:** The tool executes but returns empty results. The AI gracefully explains that no data matches the criteria instead of showing an error or empty chart.

### TE-28 — Forced Tool Choice
**Severity:** P2  
**Steps:**
1. Ask: "Use the keyword tool to find opportunities" (explicitly naming a tool)  
**Expected:** The AI correctly identifies and calls the named tool, not a different one.

---

## Section 4: Visualization & Analyst Sidebar

### VS-01 — Chart Auto-Rendering
**Severity:** P0  
**Steps:**
1. Ask: "Compare my top 10 keywords by search volume"  
**Expected:** AI response includes a bar chart visualization rendered inline. The chart has labeled axes, a legend, and correct data mapping.

### VS-02 — No Chart for Simple Answers
**Severity:** P1  
**Steps:**
1. Ask: "How many articles do I have?"
2. Ask: "What's the status of my latest draft?"  
**Expected:** AI responds with text only — NO chart. (Smart visualization guidance: no charts for simple counts or single lookups.)

### VS-03 — Chart Type Switching
**Severity:** P1  
**Steps:**
1. Get a chart response (e.g., keyword comparison)
2. Use the ChartTypeSwitcher to change from bar to line to pie  
**Expected:** The chart re-renders with the new type. Data remains consistent. Animations are smooth.

### VS-04 — Sidebar Auto-Open on New Data
**Severity:** P0  
**Steps:**
1. Close the visualization sidebar
2. Ask a question that triggers tool data with charts: "Compare my keyword difficulties"
3. Wait for the AI response  
**Expected:** The VisualizationSidebar auto-opens with the chart data. It should only open when a genuinely NEW message with visualData arrives (not on history load).

### VS-05 — Sidebar Does NOT Auto-Open on History Load
**Severity:** P0  
**Steps:**
1. Have a conversation with chart data
2. Navigate away from the chat page
3. Return to `/ai-chat` and select the same conversation  
**Expected:** The sidebar does NOT auto-open when loading historical messages. The user must manually open it.

### VS-06 — Sidebar Stays Closed After User Closes It
**Severity:** P0  
**Steps:**
1. Get a chart response (sidebar auto-opens)
2. Manually close the sidebar
3. Send another message that triggers chart data  
**Expected:** The sidebar does NOT re-open. The `userClosedSidebar` flag prevents auto-reopening until the user switches conversations.

### VS-07 — Sidebar State Resets on Conversation Switch
**Severity:** P0  
**Steps:**
1. Open conversation A → trigger chart data → sidebar opens
2. Switch to conversation B (no chart data)
3. Switch back to conversation A  
**Expected:** On switching to B, sidebar closes and all sidebar state resets (`isAnalystPanelActive`, `showVisualizationSidebar`, `sidebarInteracted`, `visualizationData`, `userClosedSidebar`). Returning to A starts fresh.

### VS-08 — Data Table Rendering
**Severity:** P1  
**Steps:**
1. Ask: "List my content items in a table"  
**Expected:** A formatted table renders with sortable columns, proper alignment, and readable data. The table handles 20+ rows without performance issues.

### VS-09 — Chart Export
**Severity:** P2  
**Steps:**
1. Get a chart visualization
2. Click the export/download button on the chart  
**Expected:** The chart is exported as an image (PNG) or data (CSV/JSON). The downloaded file is valid.

### VS-10 — Multi-Chart Response
**Severity:** P1  
**Steps:**
1. Ask: "Give me a complete SEO overview with keyword distribution, content scores, and competitor comparison"  
**Expected:** Multiple charts render (or a multi-chart modal opens). Each chart is independently viewable and switchable.

### VS-11 — Expand Visualization
**Severity:** P1  
**Steps:**
1. Get a chart rendered inline in a message bubble
2. Click the expand/maximize button  
**Expected:** The chart opens in the VisualizationSidebar with full size, controls, and interactive features (zoom, hover tooltips).

### VS-12 — Analyst Panel Toggle
**Severity:** P1  
**Steps:**
1. Click the "Analyst" toggle/brain icon in the chat header
2. Send a message while analyst mode is active  
**Expected:** The AI receives the analyst mode flag. Responses should be more data-heavy and analytical. The analyst engine tracks cumulative state.

### VS-13 — Chart QA Panel
**Severity:** P2  
**Steps:**
1. Get a chart response
2. Open the Chart QA Panel  
**Expected:** The QA panel shows chart data validation, data point counts, and any anomalies. Insights are actionable.

### VS-14 — Analysis Version History
**Severity:** P2  
**Steps:**
1. Run the same analysis query twice (e.g., "Analyze my SEO scores")
2. Open the version history  
**Expected:** Both analysis versions are listed with timestamps. The user can compare or restore previous versions.

### VS-15 — Deep Dive Prompts
**Severity:** P1  
**Steps:**
1. Get an AI response with `visualData.deepDivePrompts`
2. Click one of the deep dive prompt chips  
**Expected:** The clicked prompt is sent as a new user message. The AI responds with a deeper analysis on that specific aspect.

---

## Section 5: AI Response Quality

### RQ-01 — Conditional Think Tags (Anthropic/Claude)
**Severity:** P1  
**Steps:**
1. Configure an Anthropic/Claude API key
2. Ask: "What's the best strategy for my content?"  
**Expected:** The AI uses `<think>` tags internally for reasoning. The thinking process is shown via the ThinkingIndicator component. The final response is clean (no raw `<think>` tags visible).

### RQ-02 — No Think Tags for Non-Claude Providers
**Severity:** P1  
**Steps:**
1. Configure an OpenRouter API key with a non-Claude model (e.g., GPT-4)
2. Ask the same question  
**Expected:** No `<think>` tags are injected in the prompt. The response goes straight to the answer. No ThinkingIndicator appears.

### RQ-03 — Conversational Length (Under 100 Words)
**Severity:** P1  
**Steps:**
1. Ask: "Hey, what's up?"
2. Ask: "Thanks for the help!"
3. Ask: "What can you do?"  
**Expected:** Responses are concise — under 100 words. No unnecessary data fetching or chart generation.

### RQ-04 — Summary Length (Under 200 Words)
**Severity:** P1  
**Steps:**
1. Ask: "Summarize my content strategy"
2. Ask: "Give me a quick overview of my SEO performance"  
**Expected:** Responses are summary-length (100-200 words). Key points are highlighted. No deep-dive unless requested.

### RQ-05 — Detailed Response (200-500 Words)
**Severity:** P1  
**Steps:**
1. Ask: "Explain how I should improve my content SEO scores with specific recommendations"  
**Expected:** Response is detailed (200-500 words) with actionable recommendations, organized with headers or bullet points.

### RQ-06 — Full/Comprehensive Response
**Severity:** P1  
**Steps:**
1. Ask: "Create a comprehensive content marketing strategy for Q2 with keyword targets, content types, publishing schedule, and KPIs"  
**Expected:** Response is thorough (500+ words). Includes structured sections, data-backed recommendations, and actionable next steps.

### RQ-07 — Markdown Rendering: Tables
**Severity:** P1  
**Steps:**
1. Ask: "Show me my content items in a markdown table"  
**Expected:** A properly formatted table renders with headers, borders, and aligned columns. The `FormattedResponseRenderer` handles the markdown-to-HTML conversion.

### RQ-08 — Markdown Rendering: Code Blocks
**Severity:** P2  
**Steps:**
1. Ask: "Show me an example of structured data markup for my blog"  
**Expected:** Code blocks render with syntax highlighting, a copy button, and proper indentation.

### RQ-09 — Markdown Rendering: Lists and Headers
**Severity:** P2  
**Steps:**
1. Ask: "Give me a step-by-step guide to optimizing a blog post"  
**Expected:** Numbered/bulleted lists render correctly. Headers are properly sized. Nested lists are indented.

### RQ-10 — Smart Follow-Up Suggestions
**Severity:** P1  
**Steps:**
1. Get a response about SEO keywords
2. Look for follow-up suggestion chips below the response  
**Expected:** Contextual follow-up suggestions appear (e.g., "Run a SERP analysis on this", "Create a blog post about this topic"). Clicking a suggestion sends it as a new message.

### RQ-11 — Negotiation Protocol (Clarification)
**Severity:** P1  
**Steps:**
1. Ask an ambiguous question: "Do the thing"  
**Expected:** The AI asks a clarifying question instead of guessing. It should present options or ask for specifics.

### RQ-12 — Multi-Step Workflow
**Severity:** P1  
**Steps:**
1. Ask: "Help me create a content strategy"
2. Respond to each follow-up question from the AI
3. Continue through the full workflow  
**Expected:** The AI guides through a multi-step process (goal setting → research → recommendations). Each step builds on previous answers. The workflow state is tracked.

---

## Section 6: Context & Intelligence

### CI-01 — Conversation Summarization (>10 Messages)
**Severity:** P1  
**Steps:**
1. Have a conversation with 12+ messages
2. Send a new message  
**Expected:** The system generates a summary of earlier messages and includes it in the context. The AI still understands the conversation history despite only recent messages being in the prompt window.

### CI-02 — Pinned Messages in Context
**Severity:** P1  
**Steps:**
1. Pin 2 messages in a long conversation (20+ messages)
2. Ask: "What were the key points we discussed?"  
**Expected:** The AI references the pinned messages even if they're outside the recent message window. Pinned content is injected into the system prompt.

### CI-03 — User Intelligence Profile
**Severity:** P1  
**Steps:**
1. Use the chat extensively (10+ conversations, multiple topics)
2. Start a new conversation and ask: "What do you know about my business?"  
**Expected:** The AI leverages the user intelligence profile (company info, industry, goals) to provide personalized responses without being explicitly told.

### CI-04 — Goal Detection
**Severity:** P1  
**Steps:**
1. Ask: "I want to increase my organic traffic by 50% in Q3"
2. Continue chatting about other topics
3. Later ask: "How am I doing on my goals?"  
**Expected:** The AI detects the stated goal from the conversation and tracks/references it in subsequent messages.

### CI-05 — Proactive Insights on Welcome Screen
**Severity:** P1  
**Steps:**
1. Have: stale drafts (>14 days), failed queue items, empty calendar week, or pending approvals
2. Navigate to `/ai-chat` with no active conversation  
**Expected:** The welcome screen shows proactive insight cards (e.g., "3 Stale drafts (>14d)", "2 Failed queue items", "Empty calendar this week"). Each card is clickable.

### CI-06 — AI Recommendations on Welcome Screen
**Severity:** P2  
**Steps:**
1. Have proactive_recommendations entries in the DB
2. Navigate to `/ai-chat` welcome screen  
**Expected:** AI-generated recommendation cards appear with title, description, and action button. Dismissing a recommendation removes it.

### CI-07 — Workflow Templates from Patterns
**Severity:** P2  
**Steps:**
1. Create 5+ conversations with titles starting with "Write..." or "Analyze..."
2. Return to the welcome screen  
**Expected:** Workflow template suggestions appear based on conversation history patterns (e.g., "Write a blog post about...", "Analyze competitor...").

### CI-08 — Solution Intelligence Card
**Severity:** P1  
**Steps:**
1. Have solutions/offerings data in the DB
2. Open the welcome screen  
**Expected:** SolutionIntelligenceCard renders with offering data, quick-action buttons, and context-aware suggestions.

### CI-09 — Platform Summary Card
**Severity:** P1  
**Steps:**
1. Have content, keywords, and campaign data
2. View the welcome screen  
**Expected:** PlatformSummaryCard shows a high-level overview (content count, keyword count, campaign status) that the AI can reference.

### CI-10 — Context Snapshots
**Severity:** P2  
**Steps:**
1. Save a conversation context snapshot via the snapshot panel
2. Load the snapshot in a new conversation  
**Expected:** The new conversation inherits the saved context (workflow state, key messages). The AI responds as if continuing from that point.

---

## Section 7: UX & Edge Cases

### UX-01 — Loading Skeleton on Conversation Switch
**Severity:** P0  
**Steps:**
1. Open conversation A (with many messages)
2. Quickly switch to conversation B  
**Expected:** A skeleton loader (3 alternating-width rounded blocks) appears during the transition instead of the welcome screen flashing momentarily.

### UX-02 — No Welcome Screen Flash
**Severity:** P0  
**Steps:**
1. Rapidly switch between 3 conversations  
**Expected:** The welcome screen (DynamicGreeting, quick actions) NEVER flashes during transitions. Only the skeleton or the actual messages are shown.

### UX-03 — API Key Onboarding Gate
**Severity:** P0  
**Steps:**
1. Remove all API keys (or use a new user with no keys)
2. Navigate to `/ai-chat`  
**Expected:** The APIKeyOnboarding component is shown instead of the chat interface. After adding a valid API key, the chat becomes accessible.

### UX-04 — Rate Limit Banner
**Severity:** P1  
**Steps:**
1. Trigger rate limiting by sending many messages rapidly
2. Observe the RateLimitBanner  
**Expected:** A non-intrusive banner appears informing the user they've been rate limited. It includes a countdown or "try again" message.

### UX-05 — Responsive Layout: Mobile
**Severity:** P1  
**Steps:**
1. Open `/ai-chat` on a mobile viewport (375px width)
2. Send a message
3. Open the visualization sidebar  
**Expected:** The layout adapts to mobile. The sidebar becomes a full-screen overlay or bottom sheet. Messages are readable. The input is accessible.

### UX-06 — Responsive Layout: Tablet
**Severity:** P2  
**Steps:**
1. Open `/ai-chat` on a tablet viewport (768px width)
2. Open the sidebar  
**Expected:** The sidebar takes appropriate width. Chat and sidebar are both usable side-by-side or in an overlay.

### UX-07 — Message Search Within Conversation
**Severity:** P1  
**Steps:**
1. Open a conversation with 20+ messages
2. Click the search icon to open MessageSearchBar
3. Type a keyword that matches multiple messages
4. Use the prev/next navigation arrows  
**Expected:** Matching messages are highlighted. The view scrolls to the current match. The counter shows "2 of 7 matches". Navigation wraps around.

### UX-08 — Conversation Analytics Modal
**Severity:** P2  
**Steps:**
1. Open the ConversationAnalyticsModal from the kebab menu  
**Expected:** The modal shows conversation statistics: message count, average response time, tool usage breakdown, topic distribution.

### UX-09 — File Upload
**Severity:** P1  
**Steps:**
1. Click the paperclip (📎) button
2. Upload a PDF, DOCX, or image file
3. Ask the AI to analyze it  
**Expected:** The file is processed by EnhancedFileProcessor. The AI references the file content in its response. Supported formats are handled; unsupported formats show a clear error.

### UX-10 — Auto-Scroll to Latest Message
**Severity:** P1  
**Steps:**
1. Scroll up in a long conversation (50+ messages)
2. Send a new message  
**Expected:** The view auto-scrolls to the bottom to show the new user message and the incoming AI response.

### UX-11 — Scroll Position Preservation on Content Load
**Severity:** P2  
**Steps:**
1. Scroll to a specific position in a long conversation
2. Wait for any lazy-loaded content  
**Expected:** The scroll position is maintained. No unexpected jumps when images or charts finish rendering.

### UX-12 — Theme Consistency (Light/Dark Mode)
**Severity:** P1  
**Steps:**
1. Switch between light and dark themes
2. Check: message bubbles, sidebar, charts, action cards, confirmation cards  
**Expected:** All elements use semantic tokens (`--background`, `--foreground`, `--primary`, `--muted`, etc.). No hard-coded colors. Contrast is readable in both modes.

### UX-13 — Error Boundary: Crash Recovery
**Severity:** P0  
**Steps:**
1. Trigger a rendering error (e.g., malformed chart data)
2. Observe the ChatErrorBoundary  
**Expected:** The error boundary catches the crash. A friendly error message is shown with a "Retry" option. The entire chat does not unmount.

### UX-14 — AI Service Status Indicator
**Severity:** P1  
**Steps:**
1. Check the AiServiceStatusIndicator in the chat header
2. Disconnect internet, then reconnect  
**Expected:** The indicator shows green when connected, yellow/red when there are issues. Status updates within a few seconds of connectivity change.

### UX-15 — Global App Sidebar Interaction
**Severity:** P1  
**Steps:**
1. Toggle the global app sidebar (main navigation)
2. Check the chat layout adjusts  
**Expected:** The chat width adjusts smoothly. No overlapping. The visualization sidebar respects the available space.

---

## Section 8: Background Jobs & Notifications

### BN-01 — Email Send Notification
**Severity:** P1  
**Steps:**
1. Trigger an email campaign send via the Engage module
2. Wait for completion
3. Check the notifications/dashboard alerts  
**Expected:** A `dashboard_alerts` entry is created with title like "Email Campaign Sent" and details about success/failure count. The notification appears in the bell icon.

### BN-02 — Content Queue Processing Notification
**Severity:** P1  
**Steps:**
1. Queue 5+ content items for generation
2. Wait for the `process-content-queue` function to complete
3. Check notifications  
**Expected:** A notification appears: "Content Queue Processed — 5 items completed". Failed items are separately noted.

### BN-03 — Social Poster Notification
**Severity:** P1  
**Steps:**
1. Schedule social media posts via Engage
2. Wait for the `engage-social-poster` to execute
3. Check notifications  
**Expected:** A notification appears with the count of posts processed and any failures.

### BN-04 — Journey Processor Notification
**Severity:** P1  
**Steps:**
1. Have active customer journeys
2. Wait for the `engage-journey-processor` to execute
3. Check notifications  
**Expected:** A notification appears with the count of journey steps executed.

### BN-05 — Notification Grouping
**Severity:** P1  
**Steps:**
1. Trigger 10+ content queue items that complete within the same hour
2. Check the notification list  
**Expected:** Notifications are grouped by title and hour. Instead of 10 individual entries, a single grouped entry appears: "Content generated (10 items)" with a count badge.

### BN-06 — Tool Result Source Label
**Severity:** P1  
**Steps:**
1. Ask the AI a question that triggers a data tool (e.g., "Show me my content")
2. Look at the AI response bubble  
**Expected:** A small label appears above the message content: "📊 Data Analysis" (for visualData responses) or "⚡ Action Result" (for action responses), with a colored dot, distinguishing data-backed responses from conversational ones.

### BN-07 — Notification Persistence
**Severity:** P1  
**Steps:**
1. Receive a background job notification
2. Close the browser
3. Reopen and check notifications  
**Expected:** The notification persists (stored in `dashboard_alerts` table). It shows until dismissed.

### BN-08 — Notification Click-Through
**Severity:** P2  
**Steps:**
1. Receive a "Content Queue Processed" notification
2. Click the notification  
**Expected:** The user is navigated to the relevant module (e.g., Content Queue page) for further action.

---

## Stress & Load Tests

### SL-01 — 50-Message Conversation Performance
**Severity:** P0  
**Steps:**
1. Build a conversation with 50+ messages (mix of user, AI, tool results)
2. Scroll through the entire conversation
3. Send a new message  
**Expected:** No UI lag. Scrolling is smooth. The new message sends within normal time. Memory usage does not spike. VirtualizedMessageList should handle rendering efficiently.

### SL-02 — 20+ Conversations in Sidebar
**Severity:** P1  
**Steps:**
1. Create 25+ conversations
2. Scroll through the sidebar list
3. Search and filter  
**Expected:** Sidebar renders without lag. Search filters quickly. Pinned conversations stay at top.

### SL-03 — Large Tool Response (50+ Items)
**Severity:** P1  
**Steps:**
1. Have 50+ content items in the database
2. Ask: "Show me ALL my content"  
**Expected:** The AI limits the response appropriately (tool has max 50 limit). The chart/table handles 50 data points. No rendering freeze.

### SL-04 — Concurrent Tool Calls
**Severity:** P1  
**Steps:**
1. Ask: "Compare my keyword performance against competitor data and suggest content based on my proposals"  
**Expected:** Multiple tools are called (possibly in parallel). All results are synthesized into a coherent response. No race conditions or partial renders.

### SL-05 — Rapid Conversation Create/Delete
**Severity:** P1  
**Steps:**
1. Create 5 conversations in rapid succession
2. Delete 3 of them immediately  
**Expected:** All operations complete. No orphaned data. The sidebar reflects the correct state (2 remaining conversations).

### SL-06 — SSE Stream Interruption Recovery
**Severity:** P0  
**Steps:**
1. Ask a complex question that generates a long streaming response
2. During streaming, simulate a brief network interruption (toggle airplane mode for 2 seconds)
3. Re-enable network  
**Expected:** The stream either resumes gracefully or shows an error with a retry option. No phantom "typing" state persists. The input re-enables.

### SL-07 — Multi-Tab Usage
**Severity:** P2  
**Steps:**
1. Open `/ai-chat` in two browser tabs
2. Send a message in tab 1
3. Check tab 2  
**Expected:** Tab 2 may not show real-time updates (acceptable), but refreshing tab 2 shows the new message. No data corruption or duplicate conversations.

---

## Regression Tests (Post Phase 1-4 Fixes)

### RG-01 — Sidebar State No Longer Bleeds (Phase 1, Problem 1)
**Severity:** P0  
**Steps:**
1. Open conversation A → trigger analyst panel + chart data → sidebar opens
2. Switch to conversation B  
**Expected:** `isAnalystPanelActive = false`, `showVisualizationSidebar = false`, `sidebarInteracted = false`, `visualizationData = null`. Conversation B starts with a clean sidebar state.

### RG-02 — No Auto-Open on History Load (Phase 1, Problem 2)
**Severity:** P0  
**Steps:**
1. Conversation A has chart data in old messages
2. Navigate away, then return and select conversation A  
**Expected:** Sidebar stays closed. `prevMessageCountRef` resets on switch, so loaded history doesn't trigger auto-open.

### RG-03 — No Welcome Flash on Switch (Phase 1, Problem 5)
**Severity:** P0  
**Steps:**
1. Switch from conversation A → B → C rapidly  
**Expected:** Skeleton placeholder (3 blocks) shows during loading. Welcome screen never appears during transitions.

### RG-04 — Think Tags Only for Claude (Phase 2, Problem 3a)
**Severity:** P1  
**Steps:**
1. Use a GPT-4 model
2. Ask any analytical question  
**Expected:** No `<think>` tags in the prompt or response. No thinking indicator.

### RG-05 — No Charts for Simple Queries (Phase 2, Problem 3b)
**Severity:** P1  
**Steps:**
1. Ask: "How many blog posts do I have?"
2. Ask: "Is my campaign active?"  
**Expected:** Text-only responses. No `visualData` in the message. No chart renders.

### RG-06 — Response Length Matches Query Scope (Phase 2, Problem 3c)
**Severity:** P1  
**Steps:**
1. Ask: "Hi" → expect < 100 words
2. Ask: "Summarize my SEO status" → expect ~200 words
3. Ask: "Create a detailed content plan" → expect 200-500 words  
**Expected:** Response lengths are proportional to the query complexity.

### RG-07 — Background Job Notifications Exist (Phase 3, Problem 4)
**Severity:** P1  
**Steps:**
1. Trigger each background function: email-send, content-queue, social-poster, journey-processor
2. Check dashboard_alerts table  
**Expected:** Each function has created a corresponding alert entry.

### RG-08 — Notification Grouping Works (Phase 4, Problem 6)
**Severity:** P1  
**Steps:**
1. Generate 15 notifications with the same title within one hour  
**Expected:** The notifications hook groups them into a single entry with count badge.

### RG-09 — Tool Results Have Source Labels (Phase 4, Problem 7)
**Severity:** P1  
**Steps:**
1. Get a response with `visualData` → expect "📊 Data Analysis" label
2. Get a response with `actions` → expect "⚡ Action Result" label
3. Get a plain conversational response → expect NO label  
**Expected:** Labels correctly distinguish data-backed responses from conversational ones.

---

## Test Summary

| Section | Test Count | P0 | P1 | P2 |
|---------|-----------|----|----|-----|
| Conversation Management | 13 | 3 | 5 | 5 |
| Message Operations | 14 | 4 | 6 | 4 |
| Tool Execution | 28 | 7 | 17 | 4 |
| Visualization & Sidebar | 15 | 4 | 7 | 4 |
| AI Response Quality | 12 | 0 | 10 | 2 |
| Context & Intelligence | 10 | 0 | 6 | 4 |
| UX & Edge Cases | 15 | 3 | 9 | 3 |
| Background & Notifications | 8 | 0 | 6 | 2 |
| Stress & Load | 7 | 2 | 4 | 1 |
| Regression | 9 | 3 | 6 | 0 |
| **Total** | **131** | **26** | **76** | **29** |

---

## Appendix: Key Components Reference

| Component | File | Role |
|-----------|------|------|
| EnhancedChatInterface | `src/components/ai-chat/EnhancedChatInterface.tsx` | Main chat orchestrator |
| EnhancedMessageBubble | `src/components/ai-chat/EnhancedMessageBubble.tsx` | Message rendering + actions |
| ContextAwareMessageInput | `src/components/ai-chat/ContextAwareMessageInput.tsx` | Smart input with context |
| VisualizationSidebar | `src/components/ai-chat/VisualizationSidebar.tsx` | Chart/data sidebar panel |
| ActionConfirmationCard | `src/components/ai-chat/ActionConfirmationCard.tsx` | Tool action confirm/cancel |
| ActionResultCard | `src/components/ai-chat/ActionResultCard.tsx` | Tool result display |
| FormattedResponseRenderer | `src/components/ai-chat/FormattedResponseRenderer.tsx` | Markdown → HTML rendering |
| ThinkingIndicator | `src/components/ai-chat/ThinkingIndicator.tsx` | Claude thinking display |
| ChatErrorBoundary | `src/components/ai-chat/ChatErrorBoundary.tsx` | Error recovery |
| APIKeyOnboarding | `src/components/onboarding/APIKeyOnboarding.tsx` | API key gate |
| useEnhancedAIChatDB | `src/hooks/useEnhancedAIChatDB.ts` | Core chat state + DB ops |
| enhanced-ai-chat | `supabase/functions/enhanced-ai-chat/index.ts` | AI edge function (SSE) |
| tools.ts | `supabase/functions/enhanced-ai-chat/tools.ts` | Tool definitions + execution |
| notifyUser | `supabase/functions/shared/notifyUser.ts` | Background job alerts |
| use-notifications | `src/hooks/use-notifications.ts` | Notification grouping |
