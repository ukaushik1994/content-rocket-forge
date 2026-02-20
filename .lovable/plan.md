
# AI Chat: "Start from Scratch" vs "AI Proposals" Choice Flow

## Status: ✅ IMPLEMENTED

## Overview

When a user asks to create a blog/article in the AI Chat, instead of immediately launching the Content Wizard, we introduce a **choice step** rendered as two buttons below the AI's response. The user picks one of two paths:

1. **Start from Scratch** -- Opens the existing Content Wizard sidebar (current behavior)
2. **AI Proposals** -- Opens a new sidebar flow: select a solution, generate AI proposals, then pick one to start writing

## Files Created
- `src/components/ai-chat/ContentCreationChoiceCard.tsx` -- Two-button inline choice UI
- `src/components/ai-chat/proposal-browser/ProposalBrowserSidebar.tsx` -- Main sidebar container with 3 steps
- `src/components/ai-chat/proposal-browser/ProposalSolutionStep.tsx` -- Solution avatar grid selection
- `src/components/ai-chat/proposal-browser/ProposalBrowseStep.tsx` -- Browse & pick AI proposals

## Files Modified
- `src/types/enhancedChat.ts` -- Added `content_creation_choice` and `proposal_browser` to VisualData type union
- `src/components/ai-chat/EnhancedMessageBubble.tsx` -- Renders ContentCreationChoiceCard inline, added `onSetVisualization` prop
- `src/components/ai-chat/EnhancedChatInterface.tsx` -- Added `handleSetVisualization` handler, excluded choice card from auto-open
- `src/components/ai-chat/VisualizationSidebar.tsx` -- Added `proposal_browser` sidebar routing
- `src/components/ai-chat/VisualDataRenderer.tsx` -- Suppressed new types from inline rendering
- `supabase/functions/enhanced-ai-chat/content-action-tools.ts` -- Changed `launch_content_wizard` to return `content_creation_choice`
- `supabase/functions/enhanced-ai-chat/index.ts` -- Excluded new types from chart auto-conversion
