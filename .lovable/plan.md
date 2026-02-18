

# Replace Engage Sidebar with Top-Nav Dropdown

## What Changes

The Engage module currently uses a dedicated sidebar for navigating between Email, Contacts, Segments, etc. This will be replaced with a **dropdown menu on the "Engage" button** in the top navigation bar. Each item in the dropdown navigates to its own full-width standalone page (no sidebar).

## Changes Overview

### 1. Convert the "Engage" NavItem to a Dropdown (NavItems.tsx)
Replace the current simple `NavItem` link for "Engage" with a `DropdownMenu` component. The dropdown trigger shows "Engage" with a chevron icon. The menu items are:
- Email -> `/engage/email`
- Contacts -> `/engage/contacts`
- Segments -> `/engage/segments`
- Journeys -> `/engage/journeys`
- Automations -> `/engage/automations`
- Social -> `/engage/social`
- Activity -> `/engage/activity`

Each item will have its icon (same icons currently used in the sidebar). The trigger button will highlight when on any `/engage/*` route.

### 2. Simplify EngageLayout (EngageLayout.tsx)
- Remove the `EngageSidebar` import and rendering
- Remove the sidebar flex layout (no more `flex` with sidebar + content)
- Keep the `EngageBackground`, `WorkspaceProvider`, loading state, and breadcrumb
- Content now renders full-width within a simple scrollable container

### 3. Delete EngageSidebar (EngageSidebar.tsx)
The sidebar component is no longer needed and will be deleted.

## Technical Details

### NavItems.tsx - Engage Dropdown
Replace the single Engage `NavItem` (lines ~168-174) with a dropdown:

```text
DropdownMenu
  DropdownMenuTrigger (styled like other nav items, with ChevronDown icon)
    "Engage" + Send icon + chevron
  DropdownMenuContent (solid bg-popover, high z-index)
    DropdownMenuItem -> Link to /engage/email (Mail icon)
    DropdownMenuItem -> Link to /engage/contacts (Users icon)
    DropdownMenuItem -> Link to /engage/segments (Layers icon)
    DropdownMenuItem -> Link to /engage/journeys (GitBranch icon)
    DropdownMenuItem -> Link to /engage/automations (Zap icon)
    DropdownMenuItem -> Link to /engage/social (Share2 icon)
    DropdownMenuItem -> Link to /engage/activity (Activity icon)
```

### EngageLayout.tsx - Simplified
```text
Before: PageLayout > flex container > [EngageSidebar | Content]
After:  PageLayout > scrollable container > [Breadcrumb + Content]
```

The background and workspace provider remain intact. Only the sidebar and its flex wrapper are removed.

### Files Summary

| File | Action |
|------|--------|
| `src/components/layout/NavItems.tsx` | Modify - replace Engage NavItem with dropdown |
| `src/components/engage/EngageLayout.tsx` | Modify - remove sidebar, simplify layout |
| `src/components/engage/EngageSidebar.tsx` | Delete |
