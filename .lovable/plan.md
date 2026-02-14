

# Replace Inline Content Config with a Floating Selection Modal

## What Changes

### 1. Remove the inline ContentTypeStep card
The glassmorphic card currently sitting below the search bar (lines 251-256 in KeywordSelectionStep) gets removed entirely from the page layout.

### 2. New floating modal: SolutionSelectionModal
A centered Radix Dialog that auto-opens when the user lands on this step **if they haven't yet selected a solution + content type**. It contains:

- The solution avatars (same avatar row from ContentTypeStep) -- clicking one opens the content type dropdown (same DropdownMenu behavior)
- Company info header (if available) -- compact, same avatar + name + "Active" badge, but **no Edit button**
- Once the user picks a solution + content type, the modal auto-closes with a subtle success toast

The modal can be manually reopened via a small pill/chip near the search bar showing the current selection (e.g., "Apple Inc. | Blog Post" with a change icon). This lets the user switch their choice anytime.

### 3. Gating behavior
The keyword search bar remains always visible and usable -- no hard block. But the modal surfaces first to guide the user. If they dismiss without selecting, a subtle reminder chip stays visible.

### 4. Design continuity
- Same glassmorphism: `bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl`
- Same gradient header: `bg-gradient-to-r from-neon-purple/20 via-neon-blue/20 to-neon-purple/20`
- Same solution avatars with ring highlight on selection
- Same DropdownMenu for content type per solution
- Same framer-motion fade/scale-in animation
- Same lucide icons (Building2, CheckCircle2, Palette)
- **No Edit button** -- removed

---

## Technical Details

### New file: `src/components/content-builder/SolutionSelectionModal.tsx`
- Extracts the solution avatar grid + content type dropdown logic from ContentTypeStep
- Wraps it in a Radix Dialog with glassmorphism styling
- Auto-opens via a prop or internal state check: `!selectedSolution || !contentType`
- On selection complete (both solution + contentType set), auto-closes after 500ms delay
- Compact layout -- no large cards, just a focused selection interface
- Reuses the same data-fetching logic (solutions from Supabase, company info)
- Dispatches same actions: `SELECT_SOLUTION`, `SET_CONTENT_TYPE`, `SET_ADDITIONAL_INSTRUCTIONS`

### Modified: `src/components/content-builder/steps/KeywordSelectionStep.tsx`
- Remove the `ContentTypeStep` import and its rendering block (lines 251-256)
- Import and render `SolutionSelectionModal` instead
- Add a small selection indicator chip above or beside the search bar showing current solution + content type (clickable to reopen modal)

### Untouched
- `ContentTypeStep.tsx` -- stays as-is (still used in Step 2 ContentTypeAndOutlineStep)
- All context, reducer, actions, save hooks, Repository, Approvals -- zero changes
- `SerpAnalysisModal`, `ServiceCheckModal` -- no changes

