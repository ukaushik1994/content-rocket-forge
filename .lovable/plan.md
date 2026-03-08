

# Plan: AI-Powered Context Extraction for Content Wizard

## What We're Building

When the user clicks "Content Wizard" from the + menu and types something (or triggers it mid-conversation), the system will use the AI backend to intelligently extract all wizard-relevant fields from:
1. **The wizard-mode input** (what the user just typed)
2. **Recent conversation history** (last ~10 messages)

The extracted data will be passed directly to the Content Wizard sidebar, **skipping the choice card**, opening the wizard pre-filled on Step 0.

## Data Flow

```text
User clicks + → Content Wizard → Types: "Write a professional blog about AI in healthcare for our CRM product, target developers"
                                        │
                                        ▼
                              ┌─────────────────────┐
                              │  AI extraction call  │
                              │  (edge function)     │
                              │                      │
                              │  Input:              │
                              │  - user prompt       │
                              │  - last 10 messages  │
                              │  - user's solutions  │
                              │                      │
                              │  Output:             │
                              │  - keyword           │
                              │  - solution_id       │
                              │  - content_type      │
                              │  - tone              │
                              │  - target_audience   │
                              │  - content_goal      │
                              │  - writing_style     │
                              │  - specific_points   │
                              └────────┬────────────┘
                                       │
                                       ▼
                              Wizard sidebar opens
                              with fields pre-filled
```

## Extractable Fields (mapped to WizardState + ContentBrief)

| Field | WizardState key | Example extraction |
|-------|----------------|-------------------|
| Topic/keyword | `keyword` | "AI in healthcare" |
| Solution/offering | `selectedSolution` (matched by name) | "CRM product" → match to solution |
| Content type | `contentType` | "blog", "landing-page", "social-post" |
| Tone | `contentBrief.tone` | "professional", "casual" |
| Target audience | `contentBrief.targetAudience` | "developers" |
| Content goal | `contentBrief.contentGoal` | "educate", "generate leads" |
| Writing style | `writingStyle` | "conversational", "academic" |
| Specific points | `contentBrief.specificPoints` | "include pricing comparison" |
| Additional instructions | `additionalInstructions` | Any extra directives |

## Changes

### 1. New edge function: `extract-wizard-context`

A lightweight edge function that:
- Receives: user prompt + recent conversation history + list of user's solution names/IDs
- Calls the user's AI provider via `ai-proxy` to extract structured JSON
- Returns: `{ keyword, solution_id, content_type, tone, target_audience, content_goal, writing_style, specific_points, additional_instructions }`

The prompt instructs the AI to scan both the current input AND conversation history for any mentions of topics, audience, tone, solutions, etc.

### 2. Update `ContextAwareMessageInput.tsx`

When `wizardMode` submit happens:
- Instead of sending `Create content about: ${message}` as a chat message...
- Call `extract-wizard-context` with the message + recent conversation messages
- Pass extracted data up via a new callback: `onLaunchWizard(extractedData)`

### 3. Update `EnhancedChatInterface.tsx`

- Add `onLaunchWizard` handler that receives extracted data
- Directly opens the wizard sidebar with pre-filled data (no choice card)
- Sets `visualizationData` to `{ type: 'content_wizard', keyword, solution_id, content_type, ...extractedBrief }`

### 4. Update `VisualizationSidebar.tsx` → `ContentWizardSidebar`

- Expand `ContentWizardSidebarProps` to accept optional pre-fill fields: `tone`, `targetAudience`, `contentGoal`, `writingStyle`, `specificPoints`, `additionalInstructions`
- On mount, if these are provided, populate `wizardState` and `contentBrief` with them
- If `solution_id` is provided, auto-select the matching solution (existing behavior, already works)

### 5. Fallback behavior preserved

- The existing intent detection ("create a blog about X" typed in normal chat) still works as before
- The + menu wizard is the **primary explicit** path; typing naturally is the **fallback**

## Files Changed

| File | Action |
|------|--------|
| `supabase/functions/extract-wizard-context/index.ts` | **Create** -- AI extraction endpoint |
| `src/components/ai-chat/ContextAwareMessageInput.tsx` | **Update** -- call extraction on wizard submit |
| `src/components/ai-chat/EnhancedChatInterface.tsx` | **Update** -- handle `onLaunchWizard` with pre-fill |
| `src/components/ai-chat/VisualizationSidebar.tsx` | **Update** -- pass new props through |
| `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx` | **Update** -- accept and apply pre-fill data |

