
# Move Visualization Sidebar Behind Bottom Bar

## Problem
The Data Visualization sidebar currently extends all the way to the bottom of the screen (`bottom-0`) with `z-[50]`, while the input bar has `z-40`. This causes:

1. The sidebar's footer (Export button, copy, share) is hidden behind the input bar
2. Users can't access the sidebar controls that are cut off
3. Poor UX - the input bar should always be fully accessible

## Solution
Adjust the sidebar positioning so it ends **above** the input bar, giving the input bar visual priority and ensuring all sidebar content is accessible.

### Changes Required

**File: `src/components/ai-chat/VisualizationSidebar.tsx`**

Change the sidebar positioning from `bottom-0` to `bottom-24` (96px) to clear the input bar area:

```
Current:  "fixed top-20 right-0 bottom-0 z-[50]"
Proposed: "fixed top-20 right-0 bottom-24 z-[35]"
```

Key changes:
| Property | Current | Proposed | Reason |
|----------|---------|----------|--------|
| `bottom` | `0` | `24` (96px) | Clear the input bar height |
| `z-index` | `z-[50]` | `z-[35]` | Ensure input bar (z-40) stays above sidebar |

The backdrop overlay also needs the same `bottom-24` adjustment so it doesn't cover the input area on mobile/tablet.

---

## Visual Outcome

```text
┌─────────────────────────────────────────────────────────┐
│  Navbar (z-50)                                          │
├─────────────────────────────────────────────────────────┤
│                                          │ Visualization │
│  Chat Messages                           │ Sidebar       │
│                                          │ (z-35)        │
│                                          │               │
│                                          │ [Export] etc. │
│                                          ├───────────────┤ ← bottom-24
├──────────────────────────────────────────┴───────────────┤
│  Input Bar (z-40) - Always visible and accessible        │
└─────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ai-chat/VisualizationSidebar.tsx` | Change `bottom-0` → `bottom-24`, reduce z-index to `z-[35]` |

---

## Implementation Details

**Line ~925 in VisualizationSidebar.tsx:**
```typescript
// Before
"fixed top-20 right-0 bottom-0 z-[50]"

// After  
"fixed top-20 right-0 bottom-24 z-[35]"
```

**Line ~912 (backdrop):**
```typescript
// Before
"fixed top-16 bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm z-[45] lg:hidden"

// After
"fixed top-16 bottom-24 left-0 right-0 bg-black/40 backdrop-blur-sm z-[35] lg:hidden"
```

This ensures:
- Sidebar content is fully visible and scrollable above the input bar
- Export/share buttons are accessible
- Input bar maintains visual priority (z-40 > z-35)
- Mobile backdrop doesn't cover the input area
