
# Continue: AI Chat Polish and Confirmation UX Upgrade

## What's Already Done
The Universal Action Engine is fully wired: Phase 1 streams text, Phase 2 detects action intent and calls `enhanced-ai-chat` for tool execution. Destructive actions trigger a text-based confirmation prompt ("type confirm or cancel").

## What Needs Improvement

### 1. Upgrade Confirmation Flow to Visual Buttons
**Problem**: The current confirmation UX asks users to *type* "confirm" or "cancel" as a chat message. This is clunky and error-prone (typos, user confusion).

**Fix**: Replace the text-based confirmation with an inline card containing **Confirm** and **Cancel** buttons that directly trigger `executeToolAction` or dismiss.

**Changes**:
- Create `src/components/ai-chat/ActionConfirmationCard.tsx` -- a card component with tool name, warning icon, and two buttons
- Modify `src/hooks/useEnhancedAIChatDB.ts`:
  - Instead of adding a text confirmation message, set a special message with a `confirmationData` field containing the pending action details
  - Remove the text-parsing logic for "confirm"/"cancel" at the top of `sendMessage`
  - Add `handleConfirmAction` and `handleCancelAction` callbacks that execute or dismiss directly
- Modify `src/components/ai-chat/EnhancedMessageBubble.tsx` to render `ActionConfirmationCard` when a message has `confirmationData`

### 2. Improve Quick Actions to Trigger Real Tools
**Problem**: The welcome screen quick actions ("Write content", "Research keywords", etc.) send messages via `send:` prefix which goes through streaming, but since these are clear action intents, the Phase 2 detector should pick them up. We need to verify the prompts match the regex patterns in `actionIntentDetector.ts`.

**Fix**: Update the quick action prompts in `EnhancedQuickActions.tsx` to use phrasing that reliably triggers the action detector:
- "Write content" prompt: change to "Create a new blog post" (matches `create_content_item`)
- "Research keywords" prompt: keep as-is (matches `add_keywords` pattern)
- "Draft an email" prompt: change to "Create a new email campaign" (matches `create_email_campaign`)

### 3. Add "What can you do?" Capability Summary
**Problem**: Users don't know what actions the AI can take across modules.

**Fix**: Add a `/capabilities` slash command or a help card that lists grouped actions by module (Content, Keywords, Engage, Offerings, Campaigns).

**Changes**:
- Add capability detection in `sendMessage` -- if user types "what can you do" or "/help", show a formatted capabilities card instead of calling AI
- Create `src/components/ai-chat/CapabilitiesCard.tsx` with grouped action lists and example prompts

## Technical Details

### File Changes

| File | Change |
|------|--------|
| `src/components/ai-chat/ActionConfirmationCard.tsx` | **NEW** -- Inline card with Confirm/Cancel buttons |
| `src/hooks/useEnhancedAIChatDB.ts` | Replace text-based confirm/cancel with callback-based flow; add `/help` handler |
| `src/components/ai-chat/EnhancedMessageBubble.tsx` | Render `ActionConfirmationCard` for confirmation messages |
| `src/components/ai-chat/EnhancedQuickActions.tsx` | Update prompts to reliably trigger action detector |
| `src/components/ai-chat/CapabilitiesCard.tsx` | **NEW** -- Grouped list of all available AI actions |
| `src/types/enhancedChat.ts` | Add `confirmationData` field to `EnhancedChatMessage` type |

### ActionConfirmationCard Component

The card will display:
- Warning icon with tool name (human-readable)
- Brief description of what will happen
- Two buttons: "Confirm" (primary/destructive style) and "Cancel" (ghost)
- On Confirm: calls `executeToolAction` with the stored conversation history
- On Cancel: removes the confirmation message and adds a "Cancelled" note
- Buttons disable after click to prevent double-execution

### Updated Confirmation Flow

```text
User: "Delete the blog post about AI"
  |
  v
Phase 1: Stream text response explaining what will be deleted
  |
  v
Phase 2: detectActionIntent -> delete_content_item (requiresConfirmation: true)
  |
  v
Show ActionConfirmationCard with [Confirm] [Cancel] buttons
  |
  v
User clicks Confirm -> executeToolAction() -> ActionResultCard
```

### Capabilities Card Structure

Groups:
- **Content**: Create, update, delete, publish, generate full articles, submit/approve/reject
- **Keywords**: Add/remove keywords, SERP analysis, topic clusters
- **Email and Contacts**: Create contacts/segments, draft campaigns, send emails
- **Offerings**: Create/update solutions, add competitors, competitor analysis
- **Campaigns**: Trigger generation, retry failed content
- **Cross-Module**: Promote to campaign, convert to email, repurpose for social

Each group shows 1-2 example prompts the user can click to try.
