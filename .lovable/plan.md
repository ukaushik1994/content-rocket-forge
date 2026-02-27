

# Content Wizard Power Upgrade -- Phased Plan

The goal: make the Content Wizard the primary content tool, eventually replacing the Content Builder. Seven features across 3 phases, each building on the previous.

---

## Phase 1: Quality Intelligence (The Brain)
*Makes the Wizard produce measurably better content*

### 1A. AI Quality Grade Badge (A-F)
- After content generation, run `analyzeContentQualityWithAI()` (already exists in `aiContentQualityService.ts`)
- Show a compact grade badge (e.g., "B+") next to the SEO score at the top of the generate step
- Clicking the badge expands to show 5 sub-scores: Intent Matching, Keyword Integration, Content Depth, User Engagement, SEO Effectiveness
- **Challenge:** The service expects `ContentBuilderState`. We need to build a lightweight adapter that maps `WizardState` to the required fields (content, keywords, solution, outline, SERP data)
- **UI:** Small badge inline with existing scores, collapsible detail panel below

### 1B. 4-Dimension Compliance Analysis
- Run `analyzeContentCompliance()` (exists in `contentComplianceService.ts`, 812 lines, battle-tested)
- Show as a new collapsible section below the SEO checklist: "Compliance (78/100)"
- Expandable to show 4 dimension bars: Keyword (30%), SERP (25%), Solution (25%), Structure (20%)
- Each dimension shows its score + top violation if any
- Same adapter challenge as 1A -- reuse the same `WizardState -> ContentBuilderState` mapper
- **UI:** Collapsible card matching existing SEO checklist style

### 1C. Content Gap Auto-Injection into Refinement
- When content gaps exist in SERP data (`wizardState.serpData.contentGaps`), analyze which gaps the current content misses
- Auto-populate the "How should this be improved?" refinement input with a smart suggestion like: "Add coverage of [missing topic 1], [missing topic 2] -- these are gaps in competitor content"
- Show a small "Gaps detected" chip above the refinement input that the user can click to auto-fill
- **No new service needed** -- just compare `contentGaps` from SERP against current content headings/text

### 1D. Auto-Save with Timestamp
- Add a `useEffect` with a 60-second debounced timer that saves the current content as a draft to `content_items`
- Show a subtle "Auto-saved 2m ago" timestamp below the editor
- Only triggers if content has changed since last save
- Reuse existing save logic but with `status: 'draft'` and skip toast notifications

---

## Phase 2: Post-Save Actions (The Output)
*Maximizes what users can do with finished content*

### 2A. Inline Publish Menu (WordPress/Wix)
- Replace the current "Publish" button with a dropdown that shows:
  - "Save as Published" (current behavior -- just marks status)
  - "Publish to WordPress" (if WP connection active)
  - "Publish to Wix" (if Wix connection active)
- Use existing `getActiveConnection()` and `publishToWebsite()` from `publishingService.ts`
- After successful publish, show the published URL inline
- If no connection is active, show a "Connect Website" link to settings

### 2B. Image Generation Button in Toolbar
- Add a small image icon (ImagePlus) to the existing formatting toolbar (Bold, Italic, H1, H2...)
- On click, call the AI image generation API with context from the content title + keyword
- Show a loading spinner, then insert the generated image as markdown `![alt](url)` at cursor position
- Store generated images in the `generated_images` metadata field (matching Content Builder pattern)
- Uses the Lovable AI gateway (`google/gemini-2.5-flash-image`) -- no new edge function needed

### 2C. Post-Save Repurpose Quick Actions
- After saving a blog, show a "Repurpose" section with 4 quick action chips: Social Post, Email, Ad Copy, Summary
- Clicking one opens the Content Wizard in quick-format mode pre-filled with the saved content as source material
- Reuse existing Quick Format flow -- just pre-populate the content field
- **No new service needed** -- it's a UI flow that chains wizard sessions

---

## Phase 3: Polish and Parity (The Details)
*Final touches to match Content Builder quality*

### 3A. WizardState to ContentBuilderState Adapter
- Create a shared utility `src/utils/wizardStateAdapter.ts` that maps WizardState fields to ContentBuilderState fields
- This is the foundation for Phase 1A and 1B -- extracted here as a reusable utility
- Maps: content, keywords, solution, outline, SERP selections, meta fields, content type

---

## Technical Architecture

### New Files
| File | Purpose |
|------|---------|
| `src/utils/wizardStateAdapter.ts` | Maps WizardState to ContentBuilderState for reusing Builder services |

### Modified Files
| File | Changes |
|------|---------|
| `WizardStepGenerate.tsx` | All UI additions (grade badge, compliance section, gap chips, auto-save, publish dropdown, image button, repurpose actions) |

### Existing Services Reused (No Changes)
| Service | Used For |
|---------|----------|
| `aiContentQualityService.ts` | AI Quality Grade (A-F) |
| `contentComplianceService.ts` | 4-dimension compliance |
| `publishingService.ts` | WordPress/Wix publishing |
| `AI Gateway` | Image generation |

---

## Phase Order and Dependencies

```text
Phase 1 (Quality Intelligence)
  |-- 3A: State Adapter (build first, needed by 1A + 1B)
  |-- 1A: AI Quality Grade
  |-- 1B: Compliance Analysis
  |-- 1C: Content Gap Auto-Injection
  |-- 1D: Auto-Save
  
Phase 2 (Post-Save Actions)
  |-- 2A: Inline Publish Menu
  |-- 2B: Image Generation
  |-- 2C: Post-Save Repurpose

Phase 3 (Polish)
  |-- Final testing and edge case handling
```

---

## What We're NOT Adding (and Why)
- **Title Suggestions**: User confirmed "Skip" -- refinement input covers this
- **Document Structure visual card**: Too complex for sidebar, compliance analysis covers structure scoring
- **Featured Snippets analysis**: Already captured in SERP data and used in content gap detection
- **Full Content Builder parity**: Not needed yet -- the Wizard's strength is speed, not depth

