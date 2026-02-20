
# AI Chat: "Start from Scratch" vs "AI Proposals" Choice Flow

## Overview

When a user asks to create a blog/article in the AI Chat, instead of immediately launching the Content Wizard, we introduce a **choice step** rendered as two buttons below the AI's response. The user picks one of two paths:

1. **Start from Scratch** -- Opens the existing Content Wizard sidebar (current behavior)
2. **AI Proposals** -- Opens a new sidebar flow: select a solution, generate AI proposals, then pick one to start writing

## How It Works

```text
User: "I want to create a blog about X"
         |
    AI responds with short acknowledgment
    + two choice buttons rendered below the message
         |
   +-----+-----+
   |             |
 [Start from   [AI Proposals]
  Scratch]       |
   |             |
   v             v
 Content        Proposal
 Wizard         Sidebar
 (existing)     (new)
                  |
            1. Select Solution
            2. Generate Proposals
            3. Browse & Pick one
            4. "Use This" --> launches
               Content Wizard pre-filled
               with proposal keyword + solution
```

## Implementation Details

### 1. New Component: `ContentCreationChoiceCard` (inline in chat)

A small component rendered inside the message bubble when the AI detects a content creation intent. Shows two styled buttons:
- "Start from Scratch" (Pen icon) -- triggers `launch_content_wizard` with the extracted keyword
- "Use AI Proposals" (Sparkles icon) -- triggers a new `launch_proposal_browser` visualization type

### 2. New Sidebar Component: `ProposalBrowserSidebar`

A sidebar panel (same position/animation as ContentWizardSidebar) with 3 steps:

- **Step 1: Select Solution** -- Reuses the existing solution selection UI (avatar grid from `SolutionSelectionModal`), adapted for sidebar layout
- **Step 2: Generate & Browse Proposals** -- Calls `contentStrategyService.generateAIStrategy()` with the selected solution, then renders proposal cards (reusing `EnhancedAIProposalCard` styling). Each card has a "Use This" button
- **Step 3: Transition** -- When user clicks "Use This" on a proposal, the sidebar switches to the Content Wizard pre-filled with the proposal's `primary_keyword`, `solution_id`, and `content_type`

### 3. Modified Intent Detection Flow

**File: `src/utils/actionIntentDetector.ts`**
- The existing `launch_content_wizard` intent remains but instead of directly launching the wizard, Phase 2 execution will now return a `content_creation_choice` visualization type that renders the choice card

**File: `src/hooks/useEnhancedAIChatDB.ts`**
- When Phase 2 detects `launch_content_wizard`, the tool result from `enhanced-ai-chat` will include a `visualData` of type `content_creation_choice` with the extracted keyword. This shows the choice card instead of immediately opening the wizard

### 4. Updated `VisualizationSidebar.tsx`

Add handling for `proposal_browser` visualization type alongside the existing `content_wizard` type:

```text
if (visualData?.type === 'content_wizard') --> ContentWizardSidebar
if (visualData?.type === 'proposal_browser') --> ProposalBrowserSidebar
```

### 5. Choice Card in Message Bubble

**File: `src/components/ai-chat/EnhancedMessageBubble.tsx`**
- Detect `content_creation_choice` in the message's `visualData` array
- Render the `ContentCreationChoiceCard` inline below the message text
- On "Start from Scratch" click: set visualData to `content_wizard` type (opens existing sidebar)
- On "AI Proposals" click: set visualData to `proposal_browser` type (opens new sidebar)

### 6. Edge Function Update

**File: `supabase/functions/enhanced-ai-chat/index.ts`**
- When `launch_content_wizard` tool is called, return `visualData` of type `content_creation_choice` instead of `content_wizard`, including the keyword. This triggers the choice card in the chat

## Files to Create
- `src/components/ai-chat/ContentCreationChoiceCard.tsx` -- The two-button choice UI
- `src/components/ai-chat/proposal-browser/ProposalBrowserSidebar.tsx` -- Main sidebar container
- `src/components/ai-chat/proposal-browser/ProposalSolutionStep.tsx` -- Solution selection step
- `src/components/ai-chat/proposal-browser/ProposalBrowseStep.tsx` -- Generate & browse proposals

## Files to Modify
- `src/components/ai-chat/EnhancedMessageBubble.tsx` -- Render choice card for `content_creation_choice` visualData
- `src/components/ai-chat/VisualizationSidebar.tsx` -- Handle `proposal_browser` type
- `src/components/ai-chat/VisualDataRenderer.tsx` -- Suppress `content_creation_choice` and `proposal_browser` from inline rendering
- `supabase/functions/enhanced-ai-chat/index.ts` -- Return `content_creation_choice` visualData type for content creation intents

## Key Design Decisions
- The choice buttons appear **below the user's message** as part of the AI response, not as a modal or popup
- The Proposal Browser sidebar reuses existing services (`contentStrategyService.generateAIStrategy`) -- no new backend logic needed
- When a user picks a proposal, it seamlessly transitions into the Content Wizard with pre-filled data (keyword, solution, content type) so the full writing flow is preserved
- The existing "Start from Scratch" path remains unchanged -- same Content Wizard, same 5 steps
