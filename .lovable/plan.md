

# Premium Sidebar Redesign

## Problem
The sidebar looks flat and utilitarian — no visual hierarchy, no depth, no premium feel. Everything blends together with the same muted-foreground color and minimal spacing.

## Design Direction
Apple-inspired premium sidebar with subtle depth, refined typography, better spacing, and tasteful visual accents.

## Changes — `src/components/ai-chat/ChatHistorySidebar.tsx`

### 1. SidebarNavItem — premium hover states & active indicator
- Add a subtle left-border accent on hover (2px primary-colored bar)
- Use `font-medium` for labels, slightly larger icon size (4.5→keep 4 but add opacity transitions)
- Hover: gentle background shimmer (`bg-white/[0.04]` → `bg-white/[0.08]`) with smooth 200ms transition
- Active state support: add optional `isActive` prop with `bg-white/[0.06]` + left accent bar

### 2. CollapsibleSection — refined section headers
- Remove the icon from header (cluttered) — just chevron + label
- Increase section label size from `text-[10px]` to `text-[11px]`, use `font-semibold` with `tracking-wider` (less extreme than `tracking-widest`)
- Add a subtle top divider line (`border-t border-white/[0.04]`) above each section except first
- More breathing room: `pt-5 pb-2` instead of `pt-4 pb-1.5`

### 3. Top area — cleaner header
- Add subtle bottom separator after logo row
- New Chat button: add a soft highlight background (`bg-white/[0.05]`) to make it stand out as the primary action
- Search: keep inline toggle but style the input with a subtle `bg-white/[0.04]` pill shape

### 4. Conversation items — premium card feel  
- Active conversation: subtle left accent bar (3px, primary color) + `bg-white/[0.06]`
- Hover: `bg-white/[0.04]` with smooth transition
- Timestamp text: slightly more visible (`text-muted-foreground/60` instead of `/50`)
- Add `font-medium` to active conversation title

### 5. Footer — elevated profile area
- Increase border-top opacity (`border-white/[0.08]`)
- Profile avatar: add a subtle ring (`ring-1 ring-white/[0.1]`)
- Calendar item: same premium hover as nav items

### 6. Collapsed strip — polish
- Add a subtle inner glow/shadow on the strip
- Icon buttons: smoother hover with `bg-white/[0.06]` background
- Avatar: add ring styling matching expanded view

### 7. Overall container
- Expanded sidebar: use `bg-background` (solid, not `/95`) for a cleaner base, keep `backdrop-blur-xl`
- Add a very subtle inner shadow on the right edge for depth

## File Changed
| File | Change |
|------|--------|
| `src/components/ai-chat/ChatHistorySidebar.tsx` | Restyle all sub-components for premium feel — hover states, spacing, active indicators, typography, depth |

