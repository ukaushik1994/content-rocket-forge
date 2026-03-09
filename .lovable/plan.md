

# Journey Pages — Premium UI Redesign

## Current Issues

**JourneysList (Image 1)**
- Duplicate stats: hero shows Active/Draft/Enrolled/Completion, then EngageStatGrid repeats Active/Paused/Enrolled/Completion below the search bar — redundant
- Content cards are single-row, minimal — no visual weight or personality
- No sort/view-mode options in the filter bar
- The flow preview dots are tiny and lack color variation per node type

**JourneyBuilder (Image 2)**
- Toolbar has ~15 cramped icon buttons in a flat row with no grouping — visually overwhelming
- No visual separators between action groups (navigation, editing, analytics, publishing)
- Canvas background is plain — no premium feel
- No empty state when canvas has no nodes (just blank space)

---

## Plan

### 1. `JourneysList.tsx` — Refine List Page

- **Remove duplicate EngageStatGrid** (lines 396-407) — hero already shows the same stats
- **Add sort + view mode** to EngageFilterBar (sort by name/date/status, grid/list toggle)
- **Enrich content cards**: Add a subtle left-border accent color based on status (emerald for active, amber for paused, muted for draft). Show description more prominently. Better flow preview with colored dots matching node types (purple trigger, blue email, amber wait, etc.)
- **Add grid view option**: 2-column card layout with more visual info per card

### 2. `JourneyBuilder.tsx` — Premium Toolbar & Canvas

- **Group toolbar buttons** with visual separators (thin dividers):
  - Group 1: Back + Journey name/status
  - Group 2: Undo/Redo
  - Group 3: Add Node + Fit View
  - Group 4: Settings/Enroll/Versions/Export (behind a "More" dropdown to reduce clutter)
  - Group 5: Analytics/Enrollments/Performance (behind "Insights" dropdown)
  - Group 6: Validate + Run + Save + Publish
- **Polish toolbar**: Slightly taller (h-12), better spacing, rounded pill-style Publish button with gradient
- **Empty state for canvas**: When no nodes exist, show a centered prompt with icon + "Add your first node to start building" + "Add Node" button
- **Canvas background**: Use `BackgroundVariant.Dots` with softer color and slightly larger gap for premium feel

### 3. `CustomNodes.tsx` — Subtle Node Polish

- Add subtle shadow glow matching node color on hover
- Slightly larger min-width (180px) for better readability

---

## Files to Edit

| File | Change |
|------|--------|
| `src/components/engage/journeys/JourneysList.tsx` | Remove duplicate stats, add sort/view mode, enrich cards |
| `src/components/engage/journeys/JourneyBuilder.tsx` | Redesign toolbar with grouped actions, add empty state, polish canvas |
| `src/components/engage/journeys/nodes/CustomNodes.tsx` | Subtle hover glow, wider nodes |

