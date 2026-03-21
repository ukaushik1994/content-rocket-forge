

# Claude-Inspired Centered Welcome Layout with Animated Transition

## What
Transform the AI Chat welcome state to match the Claude.ai pattern: greeting + input centered in the viewport, with quick action chips below. On first message send, the input smoothly animates to the fixed bottom position and messages fill the space.

## Current State
- Welcome content (greeting, stats, insights) is in the scroll area
- Input is **always** fixed at the bottom (`fixed bottom-0`)
- Two separate visual zones that don't feel unified

## Proposed Layout

```text
INITIAL STATE (no messages):          AFTER FIRST MESSAGE:
┌─────────────────────────┐          ┌─────────────────────────┐
│                         │          │  [Conversation Goal]    │
│                         │          │                         │
│   ✦ AI Command Centre   │          │  Messages...            │
│                         │          │                         │
│   Morning momentum,     │          │                         │
│      Utkarsh.           │          │                         │
│                         │          │                         │
│  ┌───────────────────┐  │          │                         │
│  │ Ask Creaiter...    │  │          │                         │
│  │ [+]          [mic] │  │          │                         │
│  └───────────────────┘  │          │                         │
│                         │          ├─────────────────────────┤
│  [Write] [Campaign]     │          │ [Input bar - fixed]     │
│  [Email] [Help]         │          │                         │
│                         │          └─────────────────────────┘
└─────────────────────────┘
```

## Changes — 2 files

### 1. `src/components/ai-chat/EnhancedChatInterface.tsx`

**Welcome state restructure (lines 727-812):**
- Move the welcome content **outside** the ScrollArea, into a centered flex container that fills the viewport
- Include the input component **inside** the welcome state (rendered inline, not fixed)
- Remove PlatformSummaryCard and Insights/Recommended columns from welcome (declutter — match Claude's minimalism)
- Keep: Badge pill, DynamicGreeting, GettingStartedChecklist (if active)
- Add quick action chips below the inline input (Write content, Run campaign, Draft email, What can you do?)

**Conditional input rendering:**
- When `messages.length === 0`: render input centered within welcome layout (not fixed)
- When `messages.length > 0`: render input fixed at bottom (current behavior)
- Use `layoutId="chat-input"` on the input wrapper for Framer Motion shared layout animation — the input smoothly slides from center to bottom on first message

**Welcome exit animation:**
- Keep existing exit variant (`opacity: 0, y: -40, scale: 0.95, blur`)
- The greeting/badge fade up and out while input slides down to its fixed position

### 2. `src/components/ai-chat/ContextAwareMessageInput.tsx`

**New prop: `centered?: boolean`**
- When `centered`, use slightly different styling: larger border radius, no fixed positioning (parent handles layout), slightly larger padding
- The component itself stays the same functionally

### Animation Flow
1. Page loads: greeting fades in, input fades in centered
2. User types and sends: welcome content fades out with blur, input wrapper transitions via `layoutId` from center to fixed-bottom
3. Messages appear in the scroll area

### Quick Action Chips (below centered input)
Render 4-5 ghost-style chips from the merged PlusMenuDropdown items (non-tool ones):
- Write content (purple) — triggers Content Wizard
- Run a campaign (emerald) — sends prompt
- Draft an email (blue) — sends prompt  
- What can you do? (violet) — sends prompt

These only show in welcome state and disappear with the transition.

### Files changed: 2
- `src/components/ai-chat/EnhancedChatInterface.tsx`
- `src/components/ai-chat/ContextAwareMessageInput.tsx`

