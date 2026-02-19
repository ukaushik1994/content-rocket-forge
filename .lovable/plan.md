

# Chat-Integrated Content Builder -- Right Sidebar Wizard

## Overview

When a user says "I want to create a blog" (or similar), the AI Chat will launch a multi-step content creation wizard inside the right-side VisualizationSidebar. Each step collects user input, and the final result is saved to the Repository -- identical behavior to the standalone Content Builder, but driven conversationally.

## How It Works

The AI detects "create a blog" intent and triggers a new tool called `launch_content_wizard`. Instead of navigating to /content-builder, the tool returns a special `visualData` payload with `type: 'content_wizard'`. The VisualizationSidebar detects this type and renders the wizard component instead of charts.

```text
User: "I want to create a blog about AI trends"
     |
     v
AI Chat detects intent --> calls launch_content_wizard tool
     |
     v
Tool returns visualData = { type: 'content_wizard', keyword: 'AI trends' }
     |
     v
VisualizationSidebar renders ContentWizardSidebar (5 steps)
     |
     v
Step 1: Pick Solution (avatar grid from solutions table)
Step 2: Research Data (FAQs, content gaps, keywords, SERP headings -- selectable)
Step 3: Outline Builder (AI-generated outline, editable)
Step 4: Word Count (AI-recommended or custom input)
Step 5: Meta Title + Description (AI-generated, editable) + Save to Repository
```

## The 5 Steps in Detail

### Step 1: Solution Selection
- Fetch solutions from `solutions` table (same as SolutionSelector.tsx)
- Display as avatar grid with tooltips
- User clicks one to select
- "Next" button appears after selection

### Step 2: Research & Selection
- Call SERP API first, fall back to AI-generated data if unavailable
- Display 4 collapsible categories: FAQs, Content Gaps, Related Keywords, SERP Headings
- Each item has a checkbox for selection
- "Select All" / "Deselect All" per category
- Selected items feed into the outline generation

### Step 3: Outline
- AI generates an outline based on keyword + solution + selected research items
- Displayed as draggable/editable list of sections
- User can add, remove, or reorder sections
- Calls `ai-proxy` edge function for generation

### Step 4: Word Count
- Two buttons: "Let AI Decide" (recommended) or "Custom"
- If custom, show a number input
- AI estimate is calculated based on outline depth + research selections

### Step 5: Generate, Review & Save
- AI generates meta title + meta description (auto-populated, editable)
- "Generate Content" button triggers full content generation via `ai-proxy`
- Generated content displayed in a scrollable preview
- "Save as Draft" button saves to `content_items` table (same as standalone builder)
- Success state shows link to Repository

## Technical Details

### New Files

| File | Purpose |
|------|---------|
| `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx` | Main wizard container with step management |
| `src/components/ai-chat/content-wizard/WizardStepSolution.tsx` | Step 1: Solution picker |
| `src/components/ai-chat/content-wizard/WizardStepResearch.tsx` | Step 2: Research data with checkboxes |
| `src/components/ai-chat/content-wizard/WizardStepOutline.tsx` | Step 3: Editable outline |
| `src/components/ai-chat/content-wizard/WizardStepWordCount.tsx` | Step 4: Word count selector |
| `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx` | Step 5: Meta + generate + save |

### Modified Files

| File | Change |
|------|--------|
| `src/components/ai-chat/VisualizationSidebar.tsx` | Add conditional render: if `visualData?.type === 'content_wizard'`, render `ContentWizardSidebar` instead of charts (~10 lines) |
| `supabase/functions/enhanced-ai-chat/content-action-tools.ts` | Add `launch_content_wizard` tool definition + handler that returns visualData payload (~30 lines) |
| `src/utils/actionIntentDetector.ts` | Add intent patterns for "create a blog", "write an article", "build content" to map to `launch_content_wizard` (~10 lines) |
| `supabase/functions/enhanced-ai-chat/tools.ts` | Add cache invalidation entry for `launch_content_wizard` (~2 lines) |
| `supabase/functions/enhanced-ai-chat/index.ts` | Add `launch_content_wizard` to system prompt tool list (~2 lines) |

### Backend Tool: `launch_content_wizard`

This is a lightweight tool that returns structured data for the sidebar to render. The heavy lifting (SERP fetch, outline generation, content generation) happens client-side using existing services, exactly like the standalone builder.

```text
Tool definition:
  name: launch_content_wizard
  params: { keyword (required), solution_id (optional), content_type (optional) }
  
Returns:
  {
    success: true,
    message: "Opening content wizard for 'AI trends'",
    visualData: {
      type: "content_wizard",
      keyword: "AI trends",
      solution_id: null,
      content_type: "blog"
    }
  }
```

### Data Flow for Step 2 (Research)

```text
1. Try SERP API via existing serpApiService (getApiKey('serp'))
2. If available: fetch real FAQs, related keywords, SERP headings
3. If unavailable: call ai-proxy to generate suggested FAQs, keywords, headings, content gaps
4. Display both sources with "(SERP)" or "(AI)" badges
5. User selects items via checkboxes
```

### Content Generation (Step 5)

Uses the same `ai-proxy` edge function pattern as `generate_full_content`, but with a richer prompt incorporating:
- Selected solution context (features, pain points, use cases)
- All selected research items from Step 2
- The user-approved outline from Step 3
- Word count target from Step 4

Saves to `content_items` with metadata: `{ generated_via: 'chat_wizard', keyword, solution_id, word_count_mode }`.

### Styling

The wizard sidebar uses the same glassmorphic dark theme as the VisualizationSidebar but with a step indicator at the top (numbered circles connected by lines). Each step uses smooth Framer Motion transitions. The overall layout stays within the existing 600px sidebar width.

### No Database Changes Required

All data is saved to the existing `content_items` table. SERP data uses existing `raw_serp_data` cache. Solutions come from existing `solutions` table. No new tables needed.

## Summary

| Category | Count |
|----------|-------|
| New files | 6 (wizard components) |
| Modified files | 5 |
| New edge function tools | 1 (launch_content_wizard) |
| Database changes | 0 |
| Estimated lines | ~600 |

