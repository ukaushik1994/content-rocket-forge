

# Journey Builder UI Audit

## Issues Identified from the Screenshot

### Toolbar (Top Bar)
1. **Too many ungrouped icons** — Despite previous grouping attempt, the toolbar still shows ~15 items in a single row with tiny separators that don't create meaningful visual hierarchy
2. **Enrollment stats badges inline** — "0 active", "0 done", "0 exited" are crammed into the toolbar as tiny badges, adding clutter
3. **No visual weight on primary actions** — Save, Validate, Run Processor all look identical as ghost icon buttons. No hierarchy between primary and secondary actions
4. **Breadcrumb above toolbar is raw** — "Engage > Journeys > {uuid}" shown as plain text with the full UUID visible — ugly and unprofessional
5. **Double toolbar effect** — The breadcrumb row + toolbar row creates two thin strips that feel cramped together
6. **"More" and "Insights" dropdowns** are text+icon buttons that don't stand out from other buttons

### Canvas Area
7. **Completely black/empty canvas** — No visual guidance, no grid dots visible (too faint), feels broken rather than empty
8. **Empty state not showing** — The empty state with "Start building your journey" may not trigger (depends on `initialLoadRef`), and even if it does, the canvas behind it is just void
9. **No subtle background pattern** — The dot background at 0.15 opacity is invisible on dark mode
10. **Controls and MiniMap** — Default React Flow controls lack premium styling, the minimap feels generic
11. **Left side has a faint purple glow bleeding** — Likely from `AnimatedBackground` in the layout, but it creates an uneven visual

### Overall Feel
12. **No premium depth** — Missing glassmorphism on the toolbar, no ambient effects on the canvas
13. **Edge styling** — Animated dashed edges with muted stroke look generic
14. **Node dropdown uses emoji** — 🎯📧⏰🔀 emojis in the "Add Node" dropdown feel unprofessional for a premium tool

---

## Plan

### 1. Redesign Toolbar — Clean, Grouped, Premium

- **Remove the breadcrumb row** or merge it into the toolbar (back button + journey name is sufficient)
- **Increase toolbar height to h-14** with better padding and glassmorphic background (`bg-background/70 backdrop-blur-xl`)
- **Left section**: Back button → Journey name (editable feel) → Status badge → Auto-save indicator
- **Center section**: Empty (let the canvas breathe)
- **Right section**: Group into 3 clear visual clusters with proper separators:
  - **Edit cluster**: Undo, Redo, Add Node, Fit View
  - **Manage cluster**: "More" dropdown (Settings, Enroll, Versions, Export), "Insights" dropdown (Analytics, Enrollments, Performance)
  - **Action cluster**: Validate (outline), Save (outline), Publish/Pause (solid gradient pill)
- **Move enrollment stats** out of toolbar — show them as a floating pill on the canvas (bottom-left near Controls) or inside the Insights dropdown
- **Replace emoji** in Add Node dropdown with colored dot indicators matching node colors

### 2. Polish Canvas

- **Increase dot background visibility** — `opacity 0.25` with slightly larger dots (size 1)
- **Add subtle radial gradient overlay** on canvas — dark center fading to slightly lighter edges for depth
- **Fix empty state** — Ensure it renders reliably; add a subtle pulsing ring animation around the icon
- **Style React Flow Controls** — Darker background, rounded corners, border matching theme
- **Style MiniMap** — Match theme with node colors

### 3. Node Dropdown Refinement

- Replace emojis with small colored circles (matching node accent colors) for a professional look
- Group nodes into categories: "Triggers", "Actions", "Logic" with subtle headers in the dropdown

### Files to Edit

| File | Changes |
|------|---------|
| `JourneyBuilder.tsx` | Toolbar redesign, canvas polish, enrollment stats relocation, dropdown cleanup |
| `CustomNodes.tsx` | No changes needed (already polished) |

