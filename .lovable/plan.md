

# AI Chat UI/UX Overhaul -- 3-Phase Plan

---

## Phase 1: Fix First Message Disappearing Bug

**Root cause:** In `useEnhancedAIChatDB.ts`, when a user sends their first message and no conversation exists, `sendMessage` (line 367) calls `await createConversation(...)`. Inside `createConversation` (line 161), `setMessages([])` clears the message state AND `await loadConversations()` triggers a full reload. By the time `sendMessage` resumes at line 382 and calls `setMessages(prev => [...prev, userMessage])`, the state has already been cleared by the conversation creation flow, causing a race condition where the user message gets lost.

**Fix:**
- Remove `setMessages([])` from `createConversation` -- it should only create the DB record and return the ID, not touch message state
- Remove the redundant `await loadConversations()` call inside `createConversation` (the conversation is already prepended to state on line 159)
- This ensures `sendMessage` maintains message continuity after conversation creation

**File:** `src/hooks/useEnhancedAIChatDB.ts` (lines 144-176)

---

## Phase 2: Sidebar Redesign (Always-Visible, Better Organization)

**Current problems:**
- Sidebar is hidden behind a hamburger menu toggle (line 108 in EnhancedChatInterface, line 326-340 for the floating button)
- Only contains "Chats" section with a flat conversation list
- No Apps, Library, or user profile sections
- Uses a motion overlay approach instead of a proper push layout

**Changes:**

### 2a. Replace custom sidebar with SidebarProvider layout

Restructure `AIChat.tsx` to wrap content in `SidebarProvider` from shadcn. The sidebar becomes a permanent push-layout element on desktop (collapsible to icon strip), and a sheet overlay on mobile.

**File:** `src/pages/AIChat.tsx`
- Wrap in `SidebarProvider` with `w-full` container
- Replace the current `EnhancedChatInterface` layout with `AppSidebar + main content`
- Move `SidebarTrigger` into a persistent header area

### 2b. Rebuild ChatHistorySidebar as a proper Sidebar component

Restructure `ChatHistorySidebar.tsx` into organized `SidebarGroup` sections:

```text
+---------------------------+
| Logo + Collapse trigger   |
+---------------------------+
| [+ New Chat]  [Search]    |
+---------------------------+
| LIBRARY                   |
|   Content Repository      |
+---------------------------+
| APPS (collapsible)        |
|   Content  >              |
|   Marketing >             |
|   Audience >              |
|   Analytics >             |
+---------------------------+
| CHATS (scrollable)        |
|   Pinned conversations    |
|   Recent conversations    |
+---------------------------+
| User Profile + Settings   |
+---------------------------+
```

- Each App group item triggers its corresponding action/navigation
- Chats section shows pinned first, then recent, with the existing dropdown menu per item
- Footer shows user avatar, name, and a settings gear icon

**Files:**
- `src/components/ai-chat/ChatHistorySidebar.tsx` -- full rewrite using `Sidebar`, `SidebarContent`, `SidebarGroup`, `SidebarMenu`, etc.
- `src/components/ai-chat/EnhancedChatInterface.tsx` -- remove the floating hamburger button (lines 324-340), remove the `showSidebar` state and AnimatePresence wrapper, remove the `lg:ml-80` margin logic. The sidebar is now external to this component.
- `src/pages/AIChat.tsx` -- add `SidebarProvider` wrapper, render new sidebar alongside main content

---

## Phase 3: Theme Alignment (Wizard matches Chat)

**Current mismatch:** The chat uses ultra-minimal styling (`border-border/20`, transparent backgrounds, subtle text colors). The Content Wizard sidebar uses heavier styling (`bg-background/95 backdrop-blur-xl`, solid step indicators, card-heavy layout).

**Changes:**

### 3a. Wizard sidebar shell
In `ContentWizardSidebar.tsx`, update the outer container to match the chat's glass-minimal aesthetic:
- Change `bg-background/95 backdrop-blur-xl` to `bg-background/80 backdrop-blur-md`
- Soften borders from `border-border/30` to `border-border/10`
- Update step indicator pills to use muted tones matching chat palette

### 3b. Wizard step cards
Across all wizard step components (`WizardStepSolution`, `WizardStepResearch`, `WizardStepOutline`, `WizardStepWordCount`, `WizardStepGenerate`):
- Replace heavy `Card` wrappers with lighter `div` containers using `border-border/10 bg-muted/5`
- Use `text-muted-foreground/60` for secondary text (matching chat's convention)
- Ensure buttons use `variant="ghost"` with `border-border/20` (same as chat's "New Chat" button style)

### 3c. Consistent color tokens
- Ensure both chat and wizard use the same opacity levels: `/10` for borders, `/20` for hover borders, `/40` for active states
- Match the chat's `rounded-full` button style for primary wizard actions
- Align heading sizes and tracking with the chat's `text-sm` / `tracking-widest` pattern for section labels

**Files modified:**
- `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx`
- `src/components/ai-chat/content-wizard/WizardStepSolution.tsx`
- `src/components/ai-chat/content-wizard/WizardStepResearch.tsx`
- `src/components/ai-chat/content-wizard/WizardStepOutline.tsx`
- `src/components/ai-chat/content-wizard/WizardStepWordCount.tsx`
- `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`

---

## Implementation Order

```text
Phase 1: First message bug fix (useEnhancedAIChatDB.ts)
   -- Quick surgical fix, instant impact

Phase 2: Sidebar redesign (AIChat.tsx, ChatHistorySidebar.tsx, EnhancedChatInterface.tsx)
   -- Structural change, biggest UX improvement

Phase 3: Theme alignment (ContentWizardSidebar + all 5 step components)
   -- Visual polish pass across wizard components
```

## Summary

| Phase | Files | Impact |
|-------|-------|--------|
| 1 - Message Bug | `useEnhancedAIChatDB.ts` | First message always visible |
| 2 - Sidebar | `AIChat.tsx`, `ChatHistorySidebar.tsx`, `EnhancedChatInterface.tsx` | Always-visible sidebar with Apps, Library, Chats, Profile |
| 3 - Theme | `ContentWizardSidebar.tsx` + 5 step components | Unified minimal aesthetic across chat and wizard |

