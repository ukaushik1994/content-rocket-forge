

# Move Quick Actions to Chat Input Icon Button

## What
Remove the Quick Actions column from the welcome screen's 3-column layout. Add a new icon button (⚡ `Zap` icon) next to the `+` button in the chat input bar. Clicking it opens a popover with the same quick action items, styled to match the PlusMenuDropdown.

## Changes

### 1. `src/components/ai-chat/ContextAwareMessageInput.tsx`
- Add new props: `onQuickAction`, `onSetVisualization`
- Import `Zap` from lucide-react and `EnhancedQuickActions` component
- Add a `Popover` with a `Zap` icon button placed **after** the `PlusMenuDropdown` (left of the textarea)
- PopoverContent: same style as PlusMenuDropdown (`side="top"`, `w-48`, `bg-card border-border/50`)
- Render `EnhancedQuickActions` inside, passing `onQuickAction` and `onSetVisualization`
- Close popover on action click

### 2. `src/components/ai-chat/EnhancedChatInterface.tsx` (lines 758-766)
- Remove the "Column 1: Quick Actions" div from the 3-column welcome layout
- Change grid from `md:grid-cols-3` to `md:grid-cols-2` (Insights + Recommended remain)
- Pass `handleLegacyAction` and `handleSetVisualization` down to `ContextAwareMessageInput` as new props

### 3. `src/components/ai-chat/EnhancedQuickActions.tsx`
- Add an `onClose?: () => void` prop
- Call `onClose?.()` after `handleClick` so the popover auto-closes on selection

## Result
Quick Actions move from the welcome screen to a persistent ⚡ icon in the chat input — always accessible, not just on the empty state.

