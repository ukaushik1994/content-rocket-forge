

# Fix: AI Chat Input Overlapping with Sidebar

## Problem
The chat input bar in `EnhancedChatInterface.tsx` (line 568) uses `fixed bottom-0 left-0 right-0`, which positions it across the full viewport width — underneath the sidebar. The `<main>` content correctly uses margin-left (`sm:ml-72 lg:ml-80` when open, `sm:ml-14` when collapsed), but the fixed input doesn't follow this.

## Solution
Make the fixed input bar respect the sidebar width by adding matching `left` offsets that mirror the `<main>` margin logic. Use `useSidebarContext` and `useResponsiveBreakpoint` (both already available in the component's parent tree) to dynamically set the left position.

## File: `src/components/ai-chat/EnhancedChatInterface.tsx`

**Change** (lines 567-574): Replace the static `left-0` with responsive left offsets matching AppLayout's sidebar margins:

```tsx
<div className={cn(
  "fixed bottom-0 right-0 z-40",
  "border-t border-border/20 bg-background/80 backdrop-blur-md",
  "transition-all duration-300 ease-out",
  isMobile ? "left-0" : isSidebarOpen ? "sm:left-72 lg:left-80" : "sm:left-14",
  "left-0"  // base mobile
)}>
```

This requires importing `useSidebarContext` and `useResponsiveBreakpoint` into the component (or passing the values as props). Both hooks are already used in the parent `AppLayout`.

## Imports needed
- `useSidebarContext` from `@/contexts/SidebarContext`
- `useResponsiveBreakpoint` from `@/hooks/useResponsiveBreakpoint`

One file changed, ~5 lines modified.

