

# Fix: Add Proper Spacing Between Sidebar and Chat Content

## Problem
When the sidebar is open, chat messages are cut off on the left because the main content area doesn't get enough left margin to clear the sidebar. The sidebar is `w-72` on small screens and `w-80` on desktop, but the margin (`lg:ml-80`) only applies at the `lg` breakpoint.

## Fix

### File: `src/components/ai-chat/EnhancedChatInterface.tsx`

**Line 346** -- Update the margin logic to match the sidebar width at each breakpoint:

Change:
```
showSidebar && isDesktop && "lg:ml-80"
```
To:
```
showSidebar && !isMobile && "sm:ml-72 lg:ml-80"
```

This ensures:
- **Mobile**: No margin (sidebar overlays with backdrop, as intended)
- **sm-md (tablet)**: `ml-72` margin matches the sidebar's `sm:w-72`
- **lg+ (desktop)**: `ml-80` margin matches the sidebar's `lg:w-80`

### Also update the floating toggle position (Line 328)

The toggle button position should also account for the `sm:w-72` sidebar:

Change:
```
'top-[4.5rem] left-[18.5rem]'
```
To:
```
'top-[4.5rem] sm:left-[16.5rem] lg:left-[18.5rem]'
```

This keeps the hamburger icon flush with the sidebar edge at each breakpoint.

## Summary
Two lines changed in `EnhancedChatInterface.tsx` -- margin and toggle position now respect all breakpoints, so content is never hidden behind the sidebar.

