

# Fix Tab Alignment Issue

## Problem
Tabs that have count badges (All: 6, Socials: 2, Blog: 4) are taller than tabs without badges (Email, Scripts, Campaigns). This creates uneven vertical alignment across the row.

## Fix
In `RepositoryTabs.tsx`, always render a placeholder element for the badge area -- even when there's no count to show. This ensures all 6 tabs maintain the same height.

### Change (Line 84-92)
Replace the conditional badge rendering:
- **Before**: Badge only renders when `count > 0`, leaving no space otherwise
- **After**: Always render the badge container. When there's no count, render an invisible placeholder with the same dimensions (`h-4` min-height) to maintain alignment

Single file change: `src/components/repository/RepositoryTabs.tsx`, lines 84-92.
