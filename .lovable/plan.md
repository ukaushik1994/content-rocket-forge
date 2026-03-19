

# AI Chat Stress Test Document

Create a comprehensive markdown file at `docs/AI_CHAT_STRESS_TEST.md` covering every testable feature of the AI chat system.

## Content Structure

The document will be organized into 8 test sections covering all AI chat capabilities:

1. **Conversation Management** — Create, rename, delete, switch, search, tag, pin, archive, share, export conversations
2. **Message Operations** — Send, edit (5-min window), delete, pin messages; streaming/abort; retry on failure; keyboard shortcuts (Enter/Shift+Enter/ESC)
3. **Tool Execution & Data Retrieval** — All tool categories (content, keywords, proposals, competitors, analytics, engage, campaigns, image generation, brand analytics, SERP, cross-module); forced tool choice; auto-execute fallback; confirmation flow
4. **Visualization & Analyst Sidebar** — Chart rendering, type switching, sidebar auto-open/close, data tables, export, multi-chart, QA panel, version history
5. **AI Response Quality** — Conditional `<think>` tags, smart visualization guidance, length adaptation, negotiation protocol, multi-step workflows, markdown rendering (tables, code, lists)
6. **Context & Intelligence** — Summarization (>10 msgs), pinned message inclusion, user intelligence profile injection, goal detection, proactive recommendations, weekly briefing
7. **UX & Edge Cases** — Sidebar state reset on conversation switch, no auto-open on history load, loading skeleton on switch, empty conversation cleanup, rate limiting, API key onboarding gate, file upload
8. **Background Jobs & Notifications** — Dashboard alerts from edge functions, notification grouping, source labeling on tool results

Each test case includes: ID, description, steps, expected result, and severity (P0-P2).

## Technical Details

- Single file: `docs/AI_CHAT_STRESS_TEST.md`
- ~120 test cases across all sections
- References actual component names and edge functions for traceability

