

# Auto-Collapse Sidebar on Main Content Click (All Pages)

## What
When the user clicks anywhere inside the main content area on **any** page, the sidebar should automatically collapse. This gives the content full focus regardless of which route the user is on.

## Changes — 1 file

### `src/components/layout/AppLayout.tsx`

Add an `onClick` handler to the `<main>` element (line 195) that collapses the sidebar when it's open (desktop only — on mobile, clicking outside already dismisses overlays):

```tsx
<main
  onClick={() => {
    if (isSidebarOpen && !isMobile) {
      setSidebarOpen(false);
    }
  }}
  className={cn(...)}
>
```

Destructure `setSidebarOpen` from `useSidebarContext()` (line 82 — it's already available, just needs to be added to the destructure).

This is a single, global solution — no per-page changes needed. Every page is rendered inside this `<main>`, so clicking anywhere in the content area on any route will collapse the sidebar.

### Files changed: 1

