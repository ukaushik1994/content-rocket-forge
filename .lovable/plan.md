

# Fix Plan: Content Wizard Intent Detection + Feature Parity Audit

## Problem Summary

The Content Wizard has a **broken handoff chain**: when a user says "create a blog" and then provides a topic like "AI in healthcare", the system fails to open the wizard sidebar. Instead, the AI responds with a text-based outline in the chat.

**Root cause:** The two-phase streaming architecture relies on regex-based intent detection, but the follow-up topic message (e.g., "AI in healthcare") doesn't match any `ACTION_RULES` pattern. The system depends on `detectAIResponseIntent` scanning the AI's streamed text for phrases like "Launching the Content Wizard...", but the AI often doesn't use those exact phrases.

Additionally, the Content Builder has several features (Solution Integration Analysis, Document Structure Visualization, SEO Checklist) that need verification of proper integration in the Content Wizard.

---

## Part 1: Fix Intent Detection Chain (Critical)

### Problem A: Follow-up topic messages are missed

When the AI asks "What topic would you like to write about?" and the user replies "AI in healthcare", this plain text has no action intent match. The AI then responds conversationally instead of calling `launch_content_wizard`.

**Fix 1: Add contextual intent detection in `useEnhancedAIChatDB.ts`**

After Phase 1 streaming completes and no intent is detected from the user message OR the AI response, check the *conversation context*: if the previous AI message asked for a topic (detected by keywords like "topic", "keyword", "write about"), AND the current user message is short (under ~80 chars) and doesn't end with "?", treat it as a `launch_content_wizard` intent with the user's message as the keyword.

**Fix 2: Strengthen AI response patterns in `actionIntentDetector.ts`**

Add more AI response patterns that the model might use:
- `/I'll\s+(help\s+you\s+)?(create|write)\s+(a\s+)?(blog|article|content)\s+(about|on)/i`
- `/let's\s+(create|write|build)\s+(a\s+)?(blog|article|content)/i`
- `/content\s+about\s+["']([^"']+)["']/i`

**Fix 3: Direct wizard launch shortcut**

When `detectActionIntent` matches `launch_content_wizard` with a keyword, skip Phase 2 entirely. Instead of calling `enhanced-ai-chat` (which then calls AI again), directly set the visualization data to `content_creation_choice` type on the assistant message. This eliminates the fragile AI-calls-tool-returns-visualData chain.

### Problem B: Quick action prompt is too conversational

The "Write content" quick action sends "I want to write a new blog post. What topic should I write about?" — this triggers intent detection correctly, but the AI then asks the user for a topic, adding an unnecessary round-trip.

**Fix:** Change the quick action to open a **mini-dialog** (or inline prompt in the chat) asking for the topic first, THEN send the message with the topic already included. This removes one chat round-trip.

Alternatively, skip the AI entirely for this quick action and directly open the Content Wizard sidebar with an empty keyword, letting the user fill it in Step 1.

---

## Part 2: Feature Parity Audit (Content Builder vs Content Wizard)

### Already Integrated (Confirmed in Code)

| Feature | Content Builder | Content Wizard | Status |
|---------|----------------|----------------|--------|
| Solution Selection | Yes | Yes (WizardStepSolution) | OK |
| Solution-to-Brief Mapping | Yes | Yes (mapOfferingToBrief) | OK |
| SERP Research | Yes | Yes (WizardStepResearch) | OK |
| Outline Builder | Yes | Yes (WizardStepOutline) | OK |
| Word Count Config | Yes | Yes (WizardStepWordCount) | OK |
| Content Brief | Yes | Yes (in WizardStepWordCount) | OK |
| Brand/Company Context | Yes | Yes (loaded in WizardStepGenerate) | OK |
| Meta Title/Description | Yes | Yes (auto-generated) | OK |
| SEO Score | Yes | Yes (calculateSeoScore) | OK |
| AI Detection Score | Yes | Yes (detectAIContent) | OK |
| Refinement Loop | No | Yes (Phase 5 addition) | OK |
| Title Sanitization | Yes | Yes (sanitizeTitle) | OK |
| Document Structure | Yes | Yes (extractDocumentStructure saved to metadata) | OK |
| SERP Metrics Persistence | Yes | Yes (comprehensiveSerpData in metadata) | OK |
| Solution Integration Metrics | Yes | Yes (solutionIntegrationMetrics in metadata) | OK |
| Selection Stats | Yes | Yes (selectionStats in metadata) | OK |
| Continue Editing | Yes | Yes (handleContinueEditing via sessionStorage) | OK |
| User Instructions | No | Yes (getRecentUserInstructions) | OK |

### Missing / Partial Features

| Feature | Content Builder | Content Wizard | Gap |
|---------|----------------|----------------|-----|
| **SEO Checklist UI** | Interactive checklist panel with pass/fail items | Only a numeric score badge | Missing interactive checklist |
| **Solution Integration Dashboard** | Real-time analysis panel showing mentions, features covered, pain points | Only saves metrics to metadata; no UI | Missing live analysis UI |
| **Content Brief Questionnaire** | Dedicated UI step for audience/goals/tone/pain-points | Fields exist in WizardStepWordCount but bundled with word count config | Adequate but could be clearer |
| **Chunked Generation Progress** | N/A (single call) | Stage label only ("Generating content...") | Could show per-chunk progress |

### Fixes for Missing Features

**Fix 4: Add lightweight SEO checklist to WizardStepGenerate**

After content is generated, show an expandable SEO checklist below the score badge. Reuse the existing `calculateSeoScore` breakdown to show individual pass/fail items:
- Keyword in title (pass/fail)
- Keyword in first 200 chars (pass/fail)
- Meta title length 50-60 chars (pass/fail)
- Meta description length 120-160 chars (pass/fail)
- Has H2 headings (pass/fail)
- Word count > 800 (pass/fail)
- Has formatting (lists/bold) (pass/fail)

This is purely a UI addition — the scoring logic already exists.

**Fix 5: Add solution integration summary to WizardStepGenerate**

After content is generated and a solution is selected, show a small card:
- "Solution mentions: X" (how many times the solution name appears)
- "Features covered: X/Y" (which features from the solution are mentioned)
- These values are already computed at save time (lines 526-538); just compute and display them during generation too.

---

## Implementation Plan

### Files to Modify

| # | File | Change |
|---|------|--------|
| 1 | `src/utils/actionIntentDetector.ts` | Add more AI response patterns; add contextual follow-up detection export |
| 2 | `src/hooks/useEnhancedAIChatDB.ts` | Add contextual intent detection for topic follow-ups; add direct wizard launch shortcut |
| 3 | `src/components/ai-chat/EnhancedQuickActions.tsx` | Change "Write content" to directly open wizard with empty keyword |
| 4 | `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx` | Add SEO checklist UI + solution integration summary card |

### Execution Order

1. **Fix intent detection** (actionIntentDetector.ts + useEnhancedAIChatDB.ts) — this is the critical broken path
2. **Fix quick action shortcut** (EnhancedQuickActions.tsx) — removes unnecessary chat round-trip
3. **Add SEO checklist + solution summary** (WizardStepGenerate.tsx) — feature parity polish

### Technical Details

**Contextual intent detection logic (useEnhancedAIChatDB.ts):**
```text
After Phase 1 streaming:
  1. Run detectActionIntent(userMessage) -- existing
  2. If not detected, run detectAIResponseIntent(aiResponse) -- existing
  3. NEW: If still not detected, check conversation context:
     - Look at last 3 messages for AI asking about topic/keyword
     - If found AND current user message is short + non-question
     - Treat as launch_content_wizard with keyword = userMessage
```

**Direct wizard launch (useEnhancedAIChatDB.ts):**
```text
When detectActionIntent returns launch_content_wizard WITH a keyword:
  - Skip executeToolAction entirely
  - Set assistant message visualData = { type: 'content_creation_choice', keyword }
  - This immediately renders the choice card inline
```

**Quick action change (EnhancedQuickActions.tsx):**
```text
"Write content" onClick:
  - Instead of send:message, directly call handleSetVisualization
  - Pass { type: 'content_wizard', keyword: '' }
  - Wizard opens at Step 1 where user types keyword
```

This requires passing `onSetVisualization` to EnhancedQuickActions, or dispatching a custom event.

