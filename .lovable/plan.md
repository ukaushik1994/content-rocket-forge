

# AI Chat Fixes — What's Left to Do

I've cross-referenced every fix in the uploaded document against the current codebase and our previous 5 phases of work.

---

## Already Fixed

| Fix | Status | Where |
|-----|--------|-------|
| Fix 8: SerpAPI browser test | **Done** | Phase 2e — routed through edge function |

## Partially Fixed

| Fix | Status | Detail |
|-----|--------|--------|
| Fix 6: Write confirmations | **Backend done, frontend missing** | `DESTRUCTIVE_TOOLS` array and blocking logic exist at line 2210 of `enhanced-ai-chat/index.ts`. But there is no `ActionConfirmationCard` component — the frontend never renders the confirmation or handles the `requires_confirmation` response field. |

---

## Remaining Fixes (7 items)

### Fix 1: Loading UX — Show meaningful placeholder during AI response
- **Problem:** Placeholder message content is `''` (empty string, line 391 of `useEnhancedAIChatDB.ts`). Users see a blank bubble for 5-30 seconds.
- **Fix:** Set placeholder content to a loading message like `"Analyzing your request..."`. The `ThinkingTextRotator` component already renders when `isTyping` is true — this fix ensures the message bubble itself isn't blank.
- **Files:** `src/hooks/useEnhancedAIChatDB.ts`

### Fix 2: Email encrypted key not decrypted
- **Problem:** `engage-email-send/index.ts` line 31 returns `keyRow?.encrypted_key` raw — the encrypted ciphertext blob, not the plaintext key. Resend rejects it.
- **Fix:** Import the shared `getApiKey` from `shared/apiKeyService.ts` (already used by `ai-proxy`) to decrypt the key before use.
- **Files:** `supabase/functions/engage-email-send/index.ts`

### Fix 3: SERP analysis — clear error when no API key
- **Problem:** `keyword-action-tools.ts` calls `serp-api` edge function which fails generically when no key is configured. User gets a vague error.
- **Fix:** Before calling `serp-api`, check if a SERP key exists. If not, return a structured message telling the user to configure one in Settings.
- **Files:** `supabase/functions/enhanced-ai-chat/keyword-action-tools.ts`

### Fix 4: Email send — clear error when no Resend key
- **Problem:** Same pattern as Fix 3 for email tools (`send_email_campaign`, `send_quick_email`).
- **Fix:** Check for Resend key before executing email sends. Return actionable message with Settings link if missing.
- **Files:** `supabase/functions/enhanced-ai-chat/engage-action-tools.ts`

### Fix 5: Social posting — stop faking success
- **Problem:** `engage-social-poster/index.ts` line 54 marks posts as `"posted"` with a `stub_${Date.now()}` ID. Users think posts were published.
- **Fix:** Change stub to set status `"pending_integration"` with an error message. Add a note in the AI chat tool response that social publishing is coming soon — posts are saved as drafts.
- **Files:** `supabase/functions/engage-social-poster/index.ts`, `supabase/functions/enhanced-ai-chat/engage-action-tools.ts`

### Fix 6 (frontend): Confirmation card for destructive actions
- **Problem:** Backend blocks destructive tools and returns `requires_confirmation: true`, but the frontend has no component to render this or let users confirm/cancel.
- **Fix:** Create an `ActionConfirmationCard` component. In `useEnhancedAIChatDB.ts`, detect `requires_confirmation` in the response and render the card. On confirm, resend the message prefixed with `CONFIRMED:` (matching the backend check at line 2236).
- **Files:** New `src/components/ai-chat/ActionConfirmationCard.tsx`, update `src/hooks/useEnhancedAIChatDB.ts` and `src/components/ai-chat/EnhancedChatInterface.tsx`

### Fix 7: Conversation context — smarter than last-10
- **Problem:** Line 400 of `useEnhancedAIChatDB.ts` sends only `slice(-10)` messages. Context is lost in long conversations.
- **Fix:** Keep first message (original intent) + last 9 messages. This is the minimal "smart context" approach from the document.
- **Files:** `src/hooks/useEnhancedAIChatDB.ts`

---

## Priority & Execution Order

| Phase | Fixes | Effort |
|-------|-------|--------|
| A | Fix 2 (email decrypt) — 10 min | Tiny backend fix |
| B | Fix 1 (loading UX) + Fix 7 (context) | Two quick frontend edits |
| C | Fix 3 (SERP messaging) + Fix 4 (email messaging) | Two edge function edits |
| D | Fix 5 (social honesty) | Edge function + tool response |
| E | Fix 6 frontend (confirmation card) | New component + hook wiring |

