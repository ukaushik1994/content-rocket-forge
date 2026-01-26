

# Fix Metric Card Spacing & Widen Sidebar

## Issues Identified

From the screenshot, I can see two problems:

1. **Metric Card Text Overlap**: The value "23" is cramped and merging with the label text below it. The card has insufficient internal spacing.

2. **Sidebar Width**: Currently set at `480px` (sm) and `560px` (lg), which may feel constrained for the data-rich layout.

---

## Solution

### 1. Increase Metric Card Internal Spacing

**File: `PremiumMetricCard.tsx`**

| Current | New |
|---------|-----|
| `p-4` padding | `p-5` padding |
| `text-xl` for value | `text-2xl` for value |
| `mb-2` header margin | `mb-3` header margin |
| `mt-1` label margin | `mt-2` label margin |

This creates more breathing room between:
- Trend badge and value
- Value and label
- Label and comparison text

### 2. Widen the Sidebar

**File: `VisualizationSidebar.tsx`**

| Screen Size | Current Width | New Width |
|-------------|---------------|-----------|
| sm (≥640px) | `480px` | `520px` |
| lg (≥1024px) | `560px` | `600px` |

The 40px increase gives charts and metrics more horizontal space without overwhelming the main chat area.

---

## Technical Changes

### `src/components/ai-chat/PremiumMetricCard.tsx`

```typescript
// Line 71-78: Update card container
<div className={cn(
  "relative p-5 h-full rounded-lg",  // p-4 → p-5
  // ... rest unchanged
)}>

// Line 81: Increase header margin
<div className="flex items-center justify-between mb-3">  // mb-2 → mb-3

// Line 97: Larger value text
<p className="text-2xl font-semibold ...">  // text-xl → text-2xl

// Line 104: More spacing before label
<p className="text-xs text-muted-foreground mt-2 truncate">  // mt-1 → mt-2

// Line 110: More spacing before comparison
{comparisonValue !== undefined && (
  <p className="text-[10px] text-muted-foreground/60 mt-3 truncate">  // mt-2 → mt-3
```

### `src/components/ai-chat/VisualizationSidebar.tsx`

```typescript
// Line 663: Update sidebar width classes
"w-full sm:w-[520px] lg:w-[600px]",  // was 480px / 560px
```

---

## Visual Comparison

**Before:**
```text
┌────────┐
│▲+12%   │ ← cramped
│23      │ ← text overlapping
│Content │
│vs.20   │
└────────┘
```

**After:**
```text
┌──────────┐
│ ▲+12%    │
│           │
│ 23        │ ← clear spacing
│           │
│ Content   │
│ vs. 20    │
└──────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ai-chat/PremiumMetricCard.tsx` | Increase padding, margins, and value font size |
| `src/components/ai-chat/VisualizationSidebar.tsx` | Widen sidebar from 480/560px to 520/600px |

