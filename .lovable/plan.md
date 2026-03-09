

# Fix Journey Builder UI Overlaps

## Problems from Screenshot

1. **Breadcrumb row showing raw UUID** — "Engage > Journeys > aec63d52-d648-40c7-a032-40c6b718607d" sits above the toolbar, creating a double-header effect and exposing an ugly UUID
2. **Layout padding conflict** — `EngageLayout` wraps content in `p-6`, but `JourneyBuilder` uses `-m-6` to counteract it, causing potential overlap/bleed issues
3. **Two navigation rows** — Breadcrumb + toolbar = wasted vertical space and visual clutter on a full-screen builder

## Plan

### 1. Hide breadcrumb on builder routes

In `EngageBreadcrumb.tsx`, return `null` when the pathname matches a journey builder route (contains a UUID segment after `/journeys/`). The toolbar's back button + journey name already serves as navigation — the breadcrumb is redundant here.

### 2. Suppress layout padding for builder

In `EngageLayout.tsx`, detect when the current route is a builder route and conditionally remove the `p-6` padding on the content wrapper, so the builder can go truly full-bleed without the hacky `-m-6` negative margin. Remove `-m-6` from `JourneyBuilder.tsx`.

### 3. Hide animated background on builder

The `AnimatedBackground` and `EngageBackground` create purple glow bleed on the canvas. Suppress both on builder routes so the canvas owns its own atmosphere.

## Files to Edit

| File | Change |
|------|--------|
| `src/components/engage/shared/EngageBreadcrumb.tsx` | Return `null` for `/engage/journeys/:id` routes |
| `src/components/engage/EngageLayout.tsx` | Conditionally remove `p-6`, hide backgrounds on builder routes |
| `src/components/engage/journeys/JourneyBuilder.tsx` | Remove `-m-6` hack from root div |

