

# Phased Plan: Make AI Chat Fully Functional

Based on the audit, here's what needs building vs. what's dead code, organized into 4 phases from most critical to polish.

---

## Phase 1: Cleanup Dead Code & Fix Security (1 session)

**Goal:** Remove orphaned hooks/components that could confuse imports, and close the share security gap.

1. **Delete dead hooks** — none of these are imported by active code:
   - `src/hooks/useStreamingChat.ts` (WebSocket-based, WSS not supported by Edge Functions)
   - `src/hooks/useStreamingChatDB.ts` (only imported by useEnhancedStreamingChat)
   - `src/hooks/useEnhancedStreamingChat.ts` (only imported by StreamingChatInterface)
   - `src/hooks/useUnifiedChatDB.ts` (not imported anywhere)
   - `src/components/ai-chat/StreamingChatInterface.tsx` (only imported by EnhancedStreamingInterface)
   - `src/components/ai-chat/EnhancedStreamingInterface.tsx` (not imported anywhere)

2. **Fix Share Conversation security** — the `/shared-conversation/:id` route queries `ai_conversations` and `ai_messages` without auth. Since RLS requires `user_id = auth.uid()`, unauthenticated users get "not found." Two options:
   - **Option A (simple):** Remove the share feature entirely since it can't work without a token system
   - **Option B (proper):** Add `is_shared` boolean column + `share_token` to `ai_conversations`, create an RLS policy allowing SELECT when `is_shared = true`, and update the share URL to include the token

---

## Phase 2: Wire Voice Input & File Upload Properly (1 session)

**Goal:** Both components exist and are rendered in `ContextAwareMessageInput`, but need verification and fixes.

1. **Voice Input (`VoiceInputHandler`)** — Already uses browser `SpeechRecognition` API and is wired into the input via `onTranscript`. Verify it works end-to-end:
   - Check that `handleVoiceTranscript` in `ContextAwareMessageInput` properly populates the input field
   - Add a fallback message for unsupported browsers (Firefox, some mobile)

2. **File Upload (`FileUploadHandler`)** — Uses `enhancedFileAnalysisService` which likely calls an edge function. Verify:
   - That the analysis service actually processes files (check if it's scaffolded or functional)
   - That analyzed file content is injected into the chat message context
   - That the Supabase storage bucket exists and has correct policies

---

## Phase 3: Complete Engage Integration (2 sessions)

**Goal:** Email campaigns and social posting work end-to-end from the chat.

### Session 1: Email Campaigns
1. **Resend integration** — The `engage-email-send` edge function exists. Verify it has a working Resend API key secret configured and sends real emails.
2. **Domain verification flow** — Add a UI guidance flow when domain isn't verified (currently fails silently).
3. **Campaign creation from chat** — Verify the `create_email_campaign` tool in `enhanced-ai-chat` properly creates campaigns with correct workspace_id filtering.

### Session 2: Social Posting
1. **Social post saving** — `engage-social-poster` saves to `social_posts` table. This works for scheduling/drafting.
2. **External API scaffolding** — Add clear UI indicators that posts are "scheduled locally" and external publishing requires API integration (Twitter/LinkedIn/etc). No fake "posted" status.

---

## Phase 4: Analytics & Image Generation (2 sessions)

**Goal:** Connect the remaining scaffolded features.

### Session 1: Analytics Tools
1. **Google Analytics** — `google-analytics-fetch` edge function exists but needs OAuth. Add setup guidance in the AI chat when user asks for analytics data ("Connect Google Analytics in Settings to see real data").
2. **Content Performance** — `get_content_performance` reads from `content_analytics`. Verify this table is populated and add a graceful "no data yet" response.
3. **Search Console** — Same pattern as GA — add guided setup messaging.

### Session 2: Image Generation
1. **Wire image gen tools** — `generate-image` edge function exists. Add corresponding tools to `enhanced-ai-chat` tool definitions: `generate_image` and `edit_image`.
2. **API key requirement** — Image gen needs an API key (DALL-E/Stability). Add detection: if no key configured, respond with setup instructions instead of failing silently.
3. **Display generated images** — Ensure `GeneratedImageCard` component renders in message bubbles when image URLs are returned.

---

## Summary Table

```text
Phase  | Effort   | What
-------|----------|------------------------------------------
  1    | ~1 hr    | Delete 6 dead files, fix share security
  2    | ~2 hrs   | Verify voice & file upload work E2E
  3    | ~4 hrs   | Email send + social post from chat
  4    | ~4 hrs   | Analytics guidance + image gen tools
```

Each phase is independently shippable. Phase 1 should be done first since dead code creates confusion. Phases 2-4 can be done in any order based on priority.

