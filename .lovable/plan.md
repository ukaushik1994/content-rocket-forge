
# Premium Repository Tabs & Enhanced Filters

## Problem

1. **Tab bar looks basic** -- flat purple background on active, no glass effects, no glow, no hover animations. Doesn't match the premium Engage module aesthetic.
2. **Content section below only has a search bar** -- no status filter (Draft/Published/Archived), no sort options (Date/Title/Score), no content type sub-filter.

## Solution

### 1. Premium Tab Redesign (`RepositoryTabs.tsx`)

Transform the tab triggers from plain buttons into premium glassmorphic cards:

- **Active state**: Gradient border glow (`border-primary/40`), subtle gradient background (`bg-gradient-to-br from-primary/15 to-primary/5`), icon glow halo effect
- **Hover state**: `hover:bg-white/[0.06]`, `hover:border-white/[0.10]`, slight scale-up (`hover:scale-[1.02]`)
- **Icons**: Larger (`h-6 w-6`), with a faint glow circle behind the active icon using `box-shadow`
- **Count badges**: Gradient-tinted to match each tab's color instead of generic secondary
- **Layout**: Increase padding to `py-4 px-3`, add `rounded-2xl` for each trigger
- **Animation**: Spring transition on active state change using framer-motion `layoutId` for a sliding indicator

### 2. Enhanced Filters in CategoryContent (`CategoryContent.tsx`)

Add a filter bar below search with three controls:

- **Status Filter** (Select dropdown): All Status / Draft / Published / Archived
- **Sort By** (Select dropdown): Date (default) / Title / SEO Score  
- **Content Type sub-filter** (only on "All" tab): Quick filter chips for Article, Blog, Email, etc.

The filter row uses the same glass styling as Engage:
- `bg-background/40 backdrop-blur-sm border-white/10` on select triggers
- Compact layout: search on the left, filters on the right in a single row

### 3. Filter Logic

- Status filter uses the `status` field from `UnifiedContentItem`
- Sort applies `sort()` on the filtered array by `createdAt`, `title`, or `seoScore`
- All filters combine with search for a unified pipeline

---

## Technical Details

| File | Changes |
|------|---------|
| `RepositoryTabs.tsx` | Premium glassmorphic tab triggers with glow effects, gradient borders, animated active indicator |
| `CategoryContent.tsx` | Add status dropdown, sort dropdown, optional content-type chips; update filtering/sorting logic |

### Tab Trigger Style (Before vs After)

**Before**: Flat `data-[state=active]:bg-primary` with plain text  
**After**: Glass card with gradient border, icon glow halo, smooth spring animation, color-matched count badge

### Filter Bar Layout

```text
[Search icon + Search input........................] [Status v] [Sort by v]
[Article] [Blog] [Email] [Social] <-- chips, only on "All" tab
```

No new files needed. No backend changes. 2 files modified.
