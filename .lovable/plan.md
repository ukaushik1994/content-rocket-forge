

# Round 2: Motion & Depth + Round 3: Empty States

Button micro-interactions are already done. Many pages already have stagger animations. Here's what remains.

## Round 2A: Shared PageContainer wrapper

Create `src/components/ui/PageContainer.tsx` — a reusable `motion.div` wrapper that applies a consistent `fadeUp` entrance (opacity 0→1, y 8→0, 0.3s ease) to all page content. Apply it to pages that currently lack entrance animation or use inconsistent timings:
- `Solutions.tsx`
- `Campaigns.tsx`
- `Analytics.tsx` (already has stagger but no page-level fade)

Pages like `Repository.tsx` already have their own motion wrapper — leave as-is.

## Round 2B: Standardize stagger timing

Normalize `staggerChildren` across the codebase to `0.05s` (currently varies from 0.05 to 0.15). Target the high-traffic grids:
- `ContentGrid.tsx` (0.1 → 0.05)
- `RepositoryGrid.tsx` (0.1 → 0.05)
- `RepositoryList.tsx` (already 0.05, keep)
- `EngageSkeletonCards` and other engage stagger containers

## Round 2C: Tab animated indicator

Add `layoutId`-based animated pill indicator to the main tab systems that lack it:
- `Analytics.tsx` tab bar (overview/content/campaigns tabs)
- `DraftsList.tsx` TabSelector
- Engage sub-page tabs where missing

Use the same pattern already established in `RepositoryTabs.tsx` and `EnhancedWelcomeSection.tsx`.

## Round 3: Reusable EmptyState component

Currently there are 6+ different EmptyState implementations with inconsistent styling. Create a single shared component:

**File:** `src/components/ui/EmptyState.tsx`
- Props: `icon`, `title`, `description`, `actionLabel?`, `onAction?`, `secondaryLabel?`, `onSecondary?`
- Style: 48x48 icon container, title at `text-title` (22px/600), description at 15px/60% opacity, primary CTA button, optional secondary text link
- Wrapped in `glass-card` with consistent padding

Then migrate the top-used empty states:
- `src/components/drafts/list/EmptyState.tsx` → use shared component
- `src/components/solutions/manager/EmptyState.tsx` → use shared component
- `src/components/approval/ApprovalEmptyState.tsx` → use shared component

Keep page-specific logic (like navigation targets) in the consuming components, just delegate rendering to the shared component.

## Files to create
- `src/components/ui/PageContainer.tsx`
- `src/components/ui/EmptyState.tsx`

## Files to edit (~12-15)
- `src/components/drafts/list/ContentGrid.tsx` — stagger timing
- `src/components/repository/RepositoryGrid.tsx` — stagger timing
- `src/components/engage/shared/engageAnimations.ts` — stagger timing
- `src/pages/Analytics.tsx` — PageContainer + tab indicator
- `src/pages/Solutions.tsx` — PageContainer
- `src/pages/Campaigns.tsx` — PageContainer
- `src/components/drafts/list/EmptyState.tsx` — use shared EmptyState
- `src/components/solutions/manager/EmptyState.tsx` — use shared EmptyState
- `src/components/approval/ApprovalEmptyState.tsx` — use shared EmptyState
- Tab components needing layoutId indicators

