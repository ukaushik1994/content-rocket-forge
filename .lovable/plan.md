
# Single-Page Content Builder Redesign
## Non-Overwhelming, Aesthetic, Same Design Language

---

## Design Principles Applied

- **Same glassmorphism**: `bg-background/60 backdrop-blur-xl border border-border/50`
- **Same gradient orbs**: Animated purple/blue blurs in background
- **Same floating particles**: Subtle animated dots
- **Same icon set**: Sparkles, Search, Layers, Edit, BarChart4, FileText, Target, Users, Palette, CheckCircle, Eye, Settings from lucide-react
- **Same framer-motion patterns**: `initial/animate/transition`, spring physics, AnimatePresence
- **Same color palette**: primary gradients, green for success, amber for warning, neon-purple, neon-blue
- **NOT overwhelming**: Each section starts collapsed as a slim card (just title + icon + status badge). Only the active section is expanded. Previous completed sections show a compact summary line.

---

## Layout: Progressive Disclosure (Not All-at-Once)

The key difference from the previous plan: instead of showing all 3 sections stacked open, we use a **focused single-section-at-a-time** pattern. This keeps the page clean and non-overwhelming while still being a single page (no sidebar, no step nav).

```text
+----------------------------------------------------------+
|  [Navbar]                                                 |
+----------------------------------------------------------+
|                                                           |
|  [Subtle animated gradient orbs in background]            |
|                                                           |
|  COMPACT HEADER                                           |
|  "Content Builder" + progress dots (3 dots, filled =done) |
|                                                           |
|  SECTION 1: Research & Setup                              |
|  [If active: EXPANDED with search, solution, brief]       |
|  [If done: Single line summary card with keyword + badge] |
|                                                           |
|  SECTION 2: Outline & Write                               |
|  [If locked: Dim card "Complete research to unlock"]      |
|  [If active: EXPANDED with outline gen + editor]          |
|  [If done: Single line with "12 sections, 1500 words"]    |
|                                                           |
|  SECTION 3: Review & Save                                 |
|  [If locked: Dim card]                                    |
|  [If active: EXPANDED with SEO checklist + save buttons]  |
|  [If done: "Published" badge]                             |
|                                                           |
+----------------------------------------------------------+
```

Each section is a **Collapsible card** using Radix Collapsible + framer-motion. Only one is expanded at a time by default, but users CAN click to expand any completed section to review/edit.

---

## What Each Section Contains

### Section 1: Research & Setup (replaces Steps 0 + 1)
Expanded view contains (vertically stacked, clean spacing):
1. **Search bar** -- same KeywordSearch component, centered, with the gradient glow border
2. **SERP results** -- InlineSerpAnalysis inline (same glassmorphic card), "Explore Data" button opens SerpAnalysisModal
3. **Solution row** -- same avatar row from ContentTypeStep (solutions with dropdown for content type)
4. **Content Brief** -- same 3-column dropdowns (Audience, Goal, Tone) from ContentBriefQuestions, collapsed by default with a "Customize Brief" toggle

Collapsed/done view: `"attrition" | Blog Post | Professional tone | 8 SERP items selected`

### Section 2: Outline & Write (replaces Steps 1-partial + 3)
Expanded view contains:
1. **AI Outline Generator** -- same AIOutlineGenerator component
2. **Editable OutlineTable** -- same drag-to-reorder table
3. **"Generate Content" button** -- same gradient CTA
4. **EnhancedContentEditor** -- same full editor, takes remaining viewport height
5. **AttachedImagesGallery** -- same image section below editor
6. **MinimalisticSidebar** -- same floating assistant (stays as-is)

Collapsed/done view: `"12 sections | 1,847 words | 3 images"`

### Section 3: Review & Save (replaces Step 4)
Expanded view contains:
1. **SaveAndExportPanel** -- same save/publish bar at top
2. **SEO checklist** -- same OverviewTab content
3. **Technical tab** -- same TechnicalTabContent
4. **Meta title/description** -- editable fields

Collapsed/done view: `"SEO Score: 85% | Saved to drafts"`

---

## What Gets Removed
- ContentBuilderSidebar (entire left sidebar -- 280px reclaimed)
- Step navigation bar (Previous/Next buttons at bottom)
- SerpAnalysisStep (step ID 2 -- already hidden)
- Hero section ("Discover Content Opportunities" heading, stats counters "15+", "200+", "< 30s")
- EnhancedSerpStatus and EnhancedAiStatus badges from the hero area
- UnsavedChangesDialog (replace with auto-save)
- The `ml-80` left margin on the main content area

---

## What Stays Exactly As-Is (zero changes)
- All ContentBuilderContext state, reducer, actions, types
- useSaveContent.ts (save logic)
- useChecklistItems.ts (SEO logic)
- useFinalReview.ts (meta generation)
- All Repository and Approval components (read from same content_items table)
- SerpAnalysisModal, SelectionManagerModal, FloatingSelectionWindow
- ContentTypeStep, ContentBriefQuestions, ContentOutlineSection
- EnhancedContentEditor, MinimalisticSidebar
- SaveAndExportPanel, PublishConfirmationDialog, PublishedUrlDialog
- All framer-motion animation patterns (spring, AnimatePresence)
- All glassmorphism styling classes
- All lucide-react icons (same ones)

---

## Auto-Expand Logic

Section transitions happen automatically based on state:
- **Section 1 -> 2**: When `mainKeyword` is set AND `selectedSolution` is set AND `contentType` is set
- **Section 2 -> 3**: When `content.length > 200`
- Smooth scroll to newly expanded section using `scrollIntoView({ behavior: 'smooth' })`
- Users can click any completed section header to re-expand it

---

## Implementation

### Files to Create
- `src/components/content-builder/SinglePageContentBuilder.tsx` -- The new orchestrator. Composes existing sub-components into 3 collapsible sections. Uses Radix Collapsible for expand/collapse, framer-motion for animations.

### Files to Modify
- `src/components/content-builder/ContentBuilder.tsx` -- Replace the step-based layout with `SinglePageContentBuilder`. Remove sidebar, step nav, hero section. Keep all state initialization, preload logic, and API key checks.

### Files NOT Modified
- All context files, hooks, services, sub-components, repository, approvals -- completely untouched.

### Step Completion Mapping (Preserved)
The existing `MARK_STEP_COMPLETED` dispatches continue firing at the same triggers so Repository/Approvals/progress tracking all work:
- Step 0: `mainKeyword && selectedKeywords.length > 0`
- Step 1: `contentType && outline.length >= 3`
- Step 3: `content.length > 0`
- Step 4: `metaTitle && metaDescription && documentStructure`

---

## Visual Details

### Section Header (Collapsed)
```text
[Icon] Section Name                    [Status Badge] [Chevron]
       One-line summary of completed data
```
- Icon uses same lucide icons per section (Sparkles, Edit, BarChart4)
- Status badge: green "Complete" / blue "In Progress" / gray "Locked"
- Chevron rotates on expand (same as existing accordion pattern)
- Card style: `bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50`

### Section Header (Expanded)
- Same card but with gradient accent on left border: `border-l-4 border-l-primary`
- Content fades in with `animate-fade-in` (existing animation)

### Progress Indicator (Top)
- 3 dots in a horizontal row (replacing the sidebar steps)
- Filled dot = completed section, pulsing dot = active, hollow = locked
- Small text below: "Step 1 of 3 -- Research & Setup"
- Same glassmorphic pill: `bg-background/60 backdrop-blur-xl rounded-full border border-border/50`

### Background
- Keep the 2 animated gradient orbs (purple + pink/blue)
- Keep the 15 floating particles
- Remove the hero section's additional gradient overlay

---

## Summary

One new file (`SinglePageContentBuilder.tsx`), one modified file (`ContentBuilder.tsx`). All existing components are reused as-is. The page feels focused because only one section is expanded at a time. Same icons, same animations, same glass cards, same colors. Not overwhelming because completed sections collapse to a single summary line.
