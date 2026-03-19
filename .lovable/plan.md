

# Consolidate Welcome Screen into 3-Column Layout

## Current Layout (Vertical Stack)
Everything stacks top-to-bottom in a single narrow column:
1. Badge pill
2. Greeting
3. Platform stats (4 circles)
4. Recommendations (vertical cards)
5. Proactive insights (chips)
6. Workflow templates (chips)
7. Quick actions (3x2 grid)

## Proposed Layout (3-Column)

```text
+--Badge Pill--+
|   Greeting   |
+--------------+
| Platform Summary Stats (4 circles, centered) |
+----------------------------------------------+
|  Column 1        |  Column 2        |  Column 3        |
|  RECOMMENDED     |  INSIGHTS &      |  QUICK ACTIONS   |
|  FOR YOU         |  WORKFLOWS       |  (6 items         |
|  (rec cards      |  (insight chips  |   stacked)        |
|   stacked)       |   + workflow     |                   |
|                  |   templates)     |                   |
+------------------+------------------+------------------+
```

- Badge, greeting, and stats remain full-width centered above
- Below that, a `grid grid-cols-1 lg:grid-cols-3` section with:
  - **Left**: "Recommended for you" cards (vertical stack)
  - **Center**: Proactive insights chips + Workflow templates (grouped under one column)
  - **Right**: Quick actions (single column list of 6 items)
- Each column gets a subtle section header label
- On mobile, falls back to single column

## Changes

**File: `EnhancedChatInterface.tsx` (lines ~617-720)**

Restructure the welcome `motion.div` content after `PlatformSummaryCard`:
- Wrap recommendations, insights+workflows, and quick actions in a 3-column grid container
- Each column wrapped in its own `div` with consistent padding and optional subtle border

**File: `EnhancedQuickActions.tsx`**

Change grid from `grid-cols-3` to single column (`grid-cols-1`) since it will live inside a narrower column. Remove `max-w-[720px]` constraint.

