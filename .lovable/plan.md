

# Plan: Replace Paperclip with "+" Dropdown Menu

## What We're Building

Replace the paperclip attachment button (left side of chat input) with a **"+" button** that opens a dropdown menu with three options:
1. **Attach File** -- triggers the existing file upload flow
2. **Content Wizard** -- shows an inline keyword input prompt, then launches the wizard
3. **AI Proposals** -- opens the proposal browser sidebar

The existing intent detection (typing "create a blog") stays as a fallback. The "+" menu becomes the primary, explicit way to access these flows.

## Current State

- **Desktop**: Paperclip button on the left of `ContextAwareMessageInput.tsx` (line 228-237) triggers file upload only
- **Mobile**: `MobileActionsSheet.tsx` already uses a "+" button with a dropdown -- but only has file/voice/image/document options
- Both components live inside `ContextAwareMessageInput.tsx` which is the active input used by `EnhancedChatInterface.tsx`

## Changes

### 1. Create `PlusMenuDropdown.tsx` (new component)

A Popover-based dropdown triggered by a "+" button. Shows three items:
- **Attach File** (Paperclip icon) -- calls existing `handleAttachmentClick`
- **Content Wizard** (PenLine icon) -- sets a `wizardMode` state that transforms the input into a keyword prompt
- **AI Proposals** (Sparkles icon) -- calls a new `onOpenProposals` callback

Works on both mobile and desktop (replaces `MobileActionsSheet` + desktop paperclip).

### 2. Update `ContextAwareMessageInput.tsx`

- Remove the separate `MobileActionsSheet` and desktop `Paperclip` button
- Add the new `PlusMenuDropdown` in their place (left side, all breakpoints)
- Add a `wizardMode` state: when active, the input placeholder changes to "Enter a topic or keyword to write about..." and a small label appears above the input ("Content Wizard -- enter a topic")
- When user submits in wizard mode: send the message as a wizard trigger (same as current intent flow -- creates `content_creation_choice` visual), then reset `wizardMode`
- Add `onOpenProposals` prop to interface, pass through from parent

### 3. Update `EnhancedChatInterface.tsx`

- Pass `onOpenProposals` callback to `ContextAwareMessageInput` that triggers the proposal browser sidebar (same logic currently triggered by the choice card's "AI Proposals" button)

### 4. Update `MobileActionsSheet.tsx`

No longer needed as a separate mobile-only component. The new `PlusMenuDropdown` handles all screen sizes. File can be kept but unused, or removed.

## Wizard Mode Inline Prompt Behavior

When user clicks "Content Wizard" from the dropdown:
1. Dropdown closes
2. A subtle chip/label appears above the textarea: "Content Wizard -- type a topic and press Enter"
3. Placeholder changes to "What would you like to write about?"
4. User types a keyword/title and hits Enter
5. System sends it through the existing `launch_content_wizard` intent path (which renders the `content_creation_choice` card inline)
6. Chip disappears, input returns to normal

This avoids any chat confusion -- the user explicitly chose the wizard, and the system knows to treat the next message as a wizard keyword.

## Files Changed

| File | Action |
|------|--------|
| `src/components/ai-chat/PlusMenuDropdown.tsx` | Create |
| `src/components/ai-chat/ContextAwareMessageInput.tsx` | Update -- swap paperclip + mobile sheet for PlusMenuDropdown, add wizardMode state |
| `src/components/ai-chat/EnhancedChatInterface.tsx` | Update -- pass `onOpenProposals` to input |

